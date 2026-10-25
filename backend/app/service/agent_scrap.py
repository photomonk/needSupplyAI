import concurrent.futures
import json
import random
import sys
import time

from tinyfish import TinyFish

try:  # enum names per TinyFish SDK docs; fall back to string compare if missing
    from tinyfish import EventType, RunStatus
except ImportError:
    EventType = RunStatus = None

TOP_N = 10          # minimum listings wanted per site (also the cap we keep)
ASK_FOR = 15        # ask the agent for more than needed, so dedupe still leaves >= TOP_N
MAX_ATTEMPTS = 3    # extra runs if we are still short of TOP_N

FIELDS = [
    "supplier_name", "product_name", "part_number_or_model",
    "technical_specifications", "unit_price", "moq", "stock_availability",
    "lead_time_days", "verification_status", "location", "rating",
    "product_url", "supplier_url",
]


def _is_complete(e) -> bool:
    if EventType and RunStatus:
        return e.type == EventType.COMPLETE and e.status == RunStatus.COMPLETED
    return "COMPLETE" in str(getattr(e, "type", "")) and "COMPLETED" in str(getattr(e, "status", ""))


def _extract_list(data):
    """Accept list, dict-wrapping-a-list, or JSON string."""
    if isinstance(data, str):
        try:
            data = json.loads(data)
        except json.JSONDecodeError:
            return []
    if isinstance(data, list):
        return [d for d in data if isinstance(d, dict)]
    if isinstance(data, dict):
        for v in data.values():
            if isinstance(v, list):
                return [d for d in v if isinstance(d, dict)]
    return []


def _dedupe_key(item):
    return (
        (item.get("product_url") or "").strip().lower()
        or f"{(item.get('supplier_name') or '').strip().lower()}|{(item.get('product_name') or '').strip().lower()}"
    )


def _build_goal(product_query, have, attempt):
    goal = (
        f"This is a marketplace search results page for '{product_query}'. "
        f"Goal: collect at least {TOP_N} (ideally {ASK_FOR}) distinct product listings, "
        "in the order the site ranks them. "
        "Steps: (1) If a popup, login, cookie or location dialog appears, close it and continue. "
        "Do not log in. (2) Scroll slowly to the bottom of the page so lazy-loaded listings appear. "
        f"(3) If fewer than {TOP_N} listings are visible, click 'Load more' / 'Next' / page 2 and keep going "
        f"until you have {TOP_N}+ listings or there are no more results. "
        "Only keep listings relevant to the search term (skip ads and unrelated categories). "
        f"Return strictly a valid JSON array. Each item must have these keys: {', '.join(FIELDS)}. "
        "Fill values only if visible on the page or listing card; use null for anything missing. "
        "Return only the JSON array."
    )
    if have:
        goal += (
            f" A previous run already found {have} listings, so prioritise listings further down "
            "the results and on later pages."
        )
    return goal


def scrape_channel(channel_name, search_url, product_query):
    """Return up to TOP_N live listings for one site (may be fewer if the site has fewer)."""
    try:
        client = TinyFish()
    except Exception as e:
        print(f"[!] {channel_name}: cannot init TinyFish ({e}). Is TINYFISH_API_KEY set?")
        return []

    collected, seen = [], set()

    for attempt in range(1, MAX_ATTEMPTS + 1):
        goal = _build_goal(product_query, len(collected), attempt)
        try:
            with client.agent.stream(url=search_url, goal=goal) as stream:
                for e in stream:
                    if _is_complete(e):
                        for item in _extract_list(e.result_json):
                            key = _dedupe_key(item)
                            if key and key not in seen:
                                seen.add(key)
                                item["source_channel"] = channel_name
                                item["is_simulated"] = False
                                collected.append(item)
                        break
        except Exception as err:
            print(f"[!] {channel_name} attempt {attempt} error: {err}")

        print(f"    {channel_name}: attempt {attempt} -> {len(collected)} unique listings so far")
        if len(collected) >= TOP_N:
            break
        time.sleep(2 * attempt)

    top = collected[:TOP_N]
    for rank, item in enumerate(top, start=1):
        item["rank"] = rank
    return top


def generate_channel_fallback_data(product_query, channel_name):
    """DEMO ONLY. Clearly flagged as simulated so it never passes as real supplier data."""
    clean = product_query.strip().title()
    items = []
    for i in range(TOP_N):
        items.append({
            "rank": i + 1,
            "supplier_name": f"[SIMULATED] Sample Supplier {i + 1}",
            "product_name": f"{clean} - sample variant {i + 1}",
            "unit_price": f"₹{random.randint(100, 3000)}.00",
            "moq": random.choice([1, 5, 10, 50]),
            "lead_time_days": random.randint(1, 7),
            "source_channel": channel_name,
            "is_simulated": True,
        })
    return items


def run_supplymind_discovery(product_query, allow_simulated=False):
    print(f"\n🚀 [DISCOVERY ENGINE] Searching top {TOP_N} per site for: '{product_query}'")
    q = product_query.replace(" ", "+")
    channels = [
        ("IndiaMART B2B", f"https://dir.indiamart.com/search.mp?ss={q}"),
        ("Justdial Local Directory", f"https://www.justdial.com/search?q={q}"),
        ("JioMart Retail", f"https://www.jiomart.com/search?q={q}"),
        ("Alibaba Global", f"https://www.alibaba.com/trade/search?SearchText={q}"),
    ]

    results, summary = [], {}
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as ex:
        futures = {ex.submit(scrape_channel, n, u, product_query): n for n, u in channels}
        for fut in concurrent.futures.as_completed(futures):
            name = futures[fut]
            try:
                data = fut.result()
            except Exception as err:
                print(f"[!] {name}: {err}")
                data = []

            summary[name] = len(data)
            if data:
                flag = "" if len(data) >= TOP_N else f" (site returned fewer than {TOP_N})"
                print(f"[+] {name}: {len(data)} live items{flag}")
                results.extend(data)
            else:
                print(f"[!] {name}: no live data")
                if allow_simulated:
                    results.extend(generate_channel_fallback_data(product_query, name))
    return results, summary


if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if a != "--demo"]
    demo = "--demo" in sys.argv
    query = " ".join(args) or input("Enter a component/device: ").strip() or "keyboard"

    t0 = time.time()
    out, summary = run_supplymind_discovery(query, allow_simulated=demo)
    live = sum(1 for r in out if not r.get("is_simulated"))

    print(f"\nREPORT '{query.upper()}': {len(out)} items ({live} live) in {round(time.time() - t0, 2)}s")
    for site, n in summary.items():
        print(f"  - {site}: {n} live")
    print(json.dumps(out, indent=2, ensure_ascii=False))