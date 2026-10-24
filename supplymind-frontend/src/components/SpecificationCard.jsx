import { useState } from "react";
import {
  Check,
  Clipboard,
  MapPin,
  Package,
  IndianRupee,
  Boxes,
  Search,
  Sparkles,
  RotateCcw,
} from "lucide-react";

function formatPrice(value) {
  if (value === null || value === undefined) return null;

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

function Detail({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
      <div className="mb-3 flex items-center gap-2 text-slate-500">
        <Icon size={16} />
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="break-words text-sm font-semibold text-slate-900">
        {value ?? "Not provided"}
      </p>
    </div>
  );
}

export default function SpecificationCard({ result, onReset }) {
  const [copied, setCopied] = useState(false);

  const spec = result?.search_specification;
  const location = result?.location;
  const [copiedQuery, setCopiedQuery] = useState(null);

  const copyAlternativeQuery = async (query) => {
  try {
    await navigator.clipboard.writeText(query);

    setCopiedQuery(query);

    setTimeout(() => {
      setCopiedQuery(null);
    }, 2000);
  } catch (error) {
    console.error("Failed to copy alternative query:", error);
  }
};

   if (!spec) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
        <h3 className="font-semibold text-amber-900">
          Search specification unavailable
        </h3>
        <p className="mt-2 text-sm text-amber-800">
          The session finished without returning a search specification.
          Check the backend response and try again.
        </p>
        <button
          onClick={onReset}
          type="button"
          className="mt-4 rounded-xl bg-amber-900 px-4 py-2.5 text-sm font-semibold text-white"
        >
          Start again
        </button>
      </div>
    );
  }

  const price =
    spec.budget_min != null && spec.budget_max != null
      ? `${formatPrice(spec.budget_min)} – ${formatPrice(spec.budget_max)}`
      : spec.budget_max != null
      ? `Up to ${formatPrice(spec.budget_max)}`
      : spec.budget_min != null
      ? `From ${formatPrice(spec.budget_min)}`
      : "Not specified";

  const locationLabel =
    location?.mode === "typed"
      ? location.address
      : location?.mode === "live"
      ? `Coordinates: ${location.latitude}, ${location.longitude}`
      : "Not provided";

  const copyText = [
    `Product: ${spec.product}`,
    `Category: ${spec.category}`,
    `Quantity: ${spec.quantity ?? "Not specified"}`,
    `Budget: ${price}`,
    `Search location: ${locationLabel}`,
    `Main search query: ${spec.search_query}`,
    `Alternative queries: ${(spec.alternate_queries || []).join("; ")}`,
  ].join("\n");

  async function copySpecification() {
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
          <Check size={15} />
          Discovery completed
        </div>

        <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Your sourcing brief is ready
        </h2>

        <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
          Review the requirements and search queries before using them
          to find relevant suppliers.
        </p>
      </div>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft">
        <div className="flex flex-col justify-between gap-4 bg-slate-950 p-6 text-white sm:flex-row sm:items-center sm:p-8">
          <div>
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/20 text-blue-300">
              <Sparkles size={22} />
            </div>

            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Product search specification
            </p>
            <h3 className="mt-2 text-2xl font-bold">
              {spec.product}
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              {spec.category}
            </p>
          </div>

          <button
            type="button"
            onClick={copySpecification}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold text-white hover:bg-white/15"
          >
            {copied ? <Check size={17} /> : <Clipboard size={17} />}
            {copied ? "Copied" : "Copy brief"}
          </button>
        </div>

        <div className="p-6 sm:p-8">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Detail
              icon={Package}
              label="Product"
              value={spec.product}
            />
            <Detail
              icon={Boxes}
              label="Category"
              value={spec.category}
            />
            <Detail
              icon={Boxes}
              label="Required quantity"
              value={
                spec.quantity != null
                  ? `${spec.quantity} units`
                  : "Not specified"
              }
            />
            <Detail
              icon={IndianRupee}
              label="Budget"
              value={price}
            />
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 sm:col-span-2">
              <div className="mb-3 flex items-center gap-2 text-slate-500">
                <MapPin size={16} />
                <span className="text-xs font-medium">
                  Search location
                </span>
              </div>
              <p className="break-words text-sm font-semibold text-slate-900">
                {locationLabel}
              </p>
            </div>
          </div>

          <div className="mt-8">
            <div className="mb-3 flex items-center gap-2">
              <Search size={19} className="text-blue-600" />
              <h4 className="font-semibold text-slate-900">
                Main search query
              </h4>
            </div>

            <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
              <p className="text-sm leading-6 text-blue-950">
                {spec.search_query}
              </p>
            </div>
          </div>

         {spec.alternate_queries?.length > 0 && (
  <div className="mt-6">
    <h4 className="mb-3 font-semibold text-slate-900">
      Alternative search queries
    </h4>

    <div className="space-y-2">
      {spec.alternate_queries.map((query, index) => (
        <button
          key={`${query}-${index}`}
          type="button"
          onClick={() => copyAlternativeQuery(query)}
          className="flex w-full items-start gap-3 rounded-xl border border-slate-200 p-4 text-left transition hover:border-blue-300 hover:bg-blue-50"
          title="Click to copy this search query"
        >
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-semibold text-slate-600">
            {index + 1}
          </span>

          <span className="flex-1 text-sm leading-6 text-slate-700">
            {query}
          </span>

          <span className="shrink-0 text-xs font-medium text-blue-600">
            {copiedQuery === query ? "Copied!" : "Copy"}
          </span>
        </button>
      ))}
    </div>
  </div>
)}

          <div className="mt-8 flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row">
            <button
              type="button"
              onClick={() => copySpecification(spec.search_query)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              {copied ? <Check size={17} /> : <Clipboard size={17} />}
              {copied ? "Copied to clipboard" : "Copy search brief"}
            </button>

            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <RotateCcw size={17} />
              New search
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}