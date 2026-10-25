
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  X,
  MapPin,
  Clock3,
  ShieldCheck,
  Sparkles,
  Headphones,
  House,
  Compass,
  HeartHandshake,
  Truck,
} from "lucide-react";

const categories = [
  {
    title: "Everyday essentials",
    subtitle: "Thoughtful picks for daily life",
    icon: Headphones,
    query: "Headphones for everyday use",
    category: "Electronics & audio",
  },
  {
    title: "A happier home",
    subtitle: "Make your space work better",
    icon: House,
    query: "Air purifier for my bedroom",
    category: "Home & living",
  },
  {
    title: "Move your way",
    subtitle: "Find what fits your routine",
    icon: Compass,
    query: "Running shoes for beginners",
    category: "Fashion & footwear",
  },
  {
    title: "Small daily joys",
    subtitle: "Little upgrades, considered well",
    icon: Sparkles,
    query: "My first coffee machine",
    category: "Home & living",
  },
];

function Brand() {
  return (
    <a
      href="/"
      aria-label="NeedwiseAI home"
      className="flex items-center gap-2.5 text-xl font-semibold tracking-tight text-[#183C32]"
    >
      <span className="grid h-10 w-10 place-items-center rounded-full bg-[#C7A879]">
        <Sparkles size={19} />
      </span>
      <span>
        needwise<span className="font-normal text-[#C7A879]"> AI</span>
      </span>
    </a>
  );
}

function Eyebrow({ children }) {
  return (
    <p className="mb-5 flex items-center gap-2 text-[10px] font-semibold tracking-[0.22em] text-[#66776C] sm:text-xs">
      <span className="h-1.5 w-1.5 rounded-full bg-[#C7A879]" />
      {children}
    </p>
  );
}

function Header({ onStart }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-[#183C32]/10 bg-[#F8F6F0]/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-12">
        <Brand />

        <button
          type="button"
          className="rounded-xl p-2 text-[#183C32] md:hidden"
          aria-label="Toggle navigation"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? "✕" : "☰"}
        </button>

        <nav
          className={`${
            menuOpen ? "flex" : "hidden"
          } absolute left-0 right-0 top-full flex-col gap-5 border-b border-[#183C32]/10 bg-[#F8F6F0] p-6 md:static md:flex md:flex-row md:items-center md:gap-8 md:border-0 md:bg-transparent md:p-0`}
        >
          <a
            href="#home"
            onClick={() => setMenuOpen(false)}
            className="text-sm font-medium text-[#183C32]"
          >
            Discover
          </a>
          <a
            href="#how-it-works"
            onClick={() => setMenuOpen(false)}
            className="text-sm text-[#77786F] hover:text-[#183C32]"
          >
            How it works
          </a>
          <a
            href="#why-needwise"
            onClick={() => setMenuOpen(false)}
            className="text-sm text-[#77786F] hover:text-[#183C32]"
          >
            Why Needwise
          </a>
          <button
            onClick={() => {
              setMenuOpen(false);
              onStart({}); 
            }}
            className="flex items-center justify-center gap-2 rounded-full bg-[#183C32] px-6 py-3 text-sm text-white transition hover:bg-[#285446]"
          >
            Find my fit <ArrowRight size={16} />
          </button>
        </nav>
      </div>
    </header>
  );
}

function Hero({ onStart }) {
  const [need, setNeed] = useState("Headphones for my daily commute");
  const [category, setCategory] = useState("Electronics & audio");
  const [location, setLocation] = useState("");

  function submit(event) {
    event.preventDefault();
    onStart({ need, category, location });
  }

  return (
    <section
      id="home"
      className="grid items-center gap-14 py-14 sm:py-20 lg:grid-cols-2 lg:gap-16 lg:py-24"
    >
      <div>
        <Eyebrow>GOOD CHOICES START WITH YOU</Eyebrow>

        <h1 className="max-w-2xl text-5xl font-medium leading-[1.08] tracking-[-0.055em] text-[#183C32] sm:text-6xl lg:text-7xl">
          Less searching.
          <br />
          <span className="font-serif italic font-normal text-[#B99A68]">
            More finding
          </span>{" "}
          your thing.
        </h1>

        <p className="mt-6 max-w-xl text-base leading-8 text-[#77786F] sm:text-lg">
          Tell us what you need. We’ll help you make sense of the options,
          with your everyday life and budget in mind.
        </p>

        <form
          onSubmit={submit}
          className="mt-9 rounded-3xl border border-[#183C32]/10 bg-white p-5 shadow-[0_20px_70px_rgba(24,60,50,0.07)] sm:p-7"
        >
          <label
            htmlFor="need"
            className="mb-3 block text-sm font-semibold text-[#183C32]"
          >
            What do you need?
          </label>

          <div className="flex items-center gap-3 rounded-2xl border border-[#183C32]/15 bg-[#F8F6F0] px-4 py-3">
            <Search size={18} className="shrink-0 text-[#B99A68]" />
            <input
              id="need"
              required
              value={need}
              onChange={(event) => setNeed(event.target.value)}
              placeholder="Describe what you're looking for..."
              className="min-w-0 flex-1 bg-transparent text-sm text-[#183C32] outline-none placeholder:text-[#77786F]/70"
            />
            {need && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setNeed("")}
                className="text-[#77786F]"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="text-xs font-medium text-[#77786F]">
              Category · optional
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="mt-2 w-full rounded-xl border border-[#183C32]/15 bg-white px-3 py-3 text-sm text-[#183C32] outline-none focus:border-[#C7A879]"
              >
                <option>Electronics & audio</option>
                <option>Home & living</option>
                <option>Fashion & footwear</option>
                <option>Health & wellness</option>
                <option>Education & services</option>
                <option>Other</option>
              </select>
            </label>

            <label className="text-xs font-medium text-[#77786F]">
              <span className="flex items-center gap-1">
                <MapPin size={13} /> Location · optional
              </span>
              <input
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="City or PIN code"
                className="mt-2 w-full rounded-xl border border-[#183C32]/15 bg-white px-3 py-3 text-sm text-[#183C32] outline-none focus:border-[#C7A879]"
              />
            </label>
          </div>

          <div className="mt-6 flex flex-col gap-4 border-t border-[#183C32]/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <span className="flex items-center gap-2 text-xs text-[#77786F]">
              <Clock3 size={14} />
              A few questions. About 2 minutes.
            </span>
            <button
              type="submit"
              className="flex items-center justify-center gap-2 rounded-full bg-[#183C32] px-6 py-3.5 text-sm font-medium text-white transition hover:bg-[#285446]"
            >
              Find my fit <ArrowRight size={16} />
            </button>
          </div>
        </form>

        <p className="mt-5 flex items-center gap-2 text-xs text-[#77786F]">
          <ShieldCheck size={16} className="text-[#183C32]" />
          Independent guidance. Your choice, always.
        </p>
      </div>

      <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
        <div className="relative min-h-[450px] overflow-hidden rounded-[2rem] bg-[#E8E0D1] sm:min-h-[580px]">
          <img
            src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1100&q=85"
            alt="Premium headphones in a warm setting"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#132D25]/85 via-transparent to-black/5" />

          <div className="absolute left-5 top-5 rounded-full border border-white/40 bg-white/80 px-4 py-2 text-[10px] font-semibold tracking-[0.16em] text-[#183C32] backdrop-blur-md">
            <Sparkles size={12} className="mr-2 inline" />
            A LITTLE MORE YOU
          </div>

          <div className="absolute bottom-8 left-6 right-6 text-white sm:bottom-10 sm:left-9">
            <p className="mb-3 text-[10px] tracking-[0.2em] text-white/75">
              MADE FOR YOUR KIND OF DAY
            </p>
            <h2 className="font-serif text-3xl leading-tight sm:text-5xl">
              The right fit.
              <br />
              The right feel.
            </h2>
            <p className="mt-3 text-sm text-white/80">
              Thoughtful picks, without the endless scrolling.
            </p>
          </div>
        </div>

        <div className="absolute -bottom-6 left-3 flex items-center gap-3 rounded-2xl border border-[#183C32]/10 bg-white p-4 shadow-xl sm:-left-7 sm:p-5">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-[#F1E8D7] text-[#183C32]">
            <HeartHandshake size={21} />
          </span>
          <span>
            <strong className="block text-sm text-[#183C32]">
              Considered for you
            </strong>
            <small className="mt-1 block text-xs text-[#77786F]">
              Not just another list
            </small>
          </span>
        </div>
      </div>
    </section>
  );
}

function Inspiration({ onChoose }) {
  return (
    <section className="border-t border-[#183C32]/10 py-20 sm:py-24">
      <div className="mb-9 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <Eyebrow>A GOOD PLACE TO BEGIN</Eyebrow>
          <h2 className="max-w-2xl text-3xl font-medium tracking-tight text-[#183C32] sm:text-4xl">
            Or, start with something on your mind.
          </h2>
        </div>
        <p className="text-sm text-[#77786F]">
          A little inspiration to get going
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {categories.map(({ title, subtitle, icon: Icon, query, category }) => (
          <button
            key={title}
            onClick={() => onChoose({ need: query, category })}
            className="group flex min-h-36 items-center gap-4 rounded-2xl border border-[#183C32]/10 bg-white/70 p-5 text-left transition duration-300 hover:-translate-y-1 hover:border-[#C7A879]/70 hover:bg-white hover:shadow-xl"
          >
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#EEE8DB] text-[#183C32] transition group-hover:bg-[#183C32] group-hover:text-white">
              <Icon size={20} />
            </span>
            <span className="min-w-0 flex-1">
              <strong className="block text-sm font-semibold text-[#183C32]">
                {title}
              </strong>
              <small className="mt-2 block leading-5 text-[#77786F]">
                {subtitle}
              </small>
            </span>
            <ArrowUpRight
              size={17}
              className="shrink-0 text-[#B99A68] transition group-hover:-translate-y-1 group-hover:translate-x-1"
            />
          </button>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    ["01", "Tell us your need", "In your own words, not a spec sheet."],
    ["02", "Add your preferences", "What matters, and what you'd like to spend."],
    ["03", "Meet your shortlist", "Thoughtful options, with the why explained."],
  ];

  return (
    <section
      id="how-it-works"
      className="grid gap-12 rounded-[2rem] bg-[#183C32] px-6 py-12 text-white sm:px-10 sm:py-16 lg:grid-cols-2 lg:gap-20 lg:px-16 lg:py-20"
    >
      <div>
        <Eyebrow>A BETTER WAY TO CHOOSE</Eyebrow>
        <h2 className="font-serif text-4xl leading-tight sm:text-5xl">
          Your needs.
          <br />
          <span className="italic text-[#C7A879]">A clearer choice.</span>
        </h2>
        <p className="mt-5 text-sm leading-7 text-white/65">
          You decide. We help you get there.
        </p>
        <div className="mt-8 flex items-center gap-2 text-xs text-white/70">
          <ShieldCheck size={16} className="text-[#C7A879]" />
          Your priorities come first.
        </div>
      </div>

      <div className="divide-y divide-white/15">
        {steps.map(([number, title, text]) => (
          <article key={number} className="group flex gap-5 py-6 first:pt-0 last:pb-0">
            <span className="font-serif text-2xl italic text-[#C7A879]">
              {number}
            </span>
            <div className="flex-1">
              <h3 className="text-lg font-medium">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-white/60">{text}</p>
            </div>
            <ArrowDownRight
              size={19}
              className="text-white/40 transition group-hover:translate-x-1 group-hover:translate-y-1 group-hover:text-[#C7A879]"
            />
          </article>
        ))}
      </div>
    </section>
  );
}

function WhyNeedwise() {
  const benefits = [
    {
      icon: Sparkles,
      title: "Personal, not generic",
      text: "Recommendations shaped around your real priorities.",
    },
    {
      icon: ShieldCheck,
      title: "Clarity you can trust",
      text: "Understand why an option makes your shortlist.",
    },
    {
      icon: Truck,
      title: "Time well spent",
      text: "Explore relevant options without endless searching.",
    },
  ];

  return (
    <section id="why-needwise" className="py-20 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <Eyebrow>A LITTLE MORE CLARITY</Eyebrow>
        <h2 className="text-3xl font-medium tracking-tight text-[#183C32] sm:text-5xl">
          Advice that starts with{" "}
          <span className="font-serif italic text-[#B99A68]">you.</span>
        </h2>
        <p className="mt-5 text-sm leading-7 text-[#77786F] sm:text-base">
          Less noise. More confidence in what you choose.
        </p>
      </div>

      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {benefits.map(({ icon: Icon, title, text }) => (
          <article
            key={title}
            className="rounded-3xl border border-[#183C32]/10 bg-white/60 p-7 transition hover:-translate-y-1 hover:bg-white hover:shadow-lg sm:p-9"
          >
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#EEE8DB] text-[#183C32]">
              <Icon size={21} />
            </span>
            <h3 className="mt-6 text-lg font-semibold text-[#183C32]">
              {title}
            </h3>
            <p className="mt-3 text-sm leading-7 text-[#77786F]">{text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="mt-4 border-t border-white/10 bg-[#112E25] text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-9 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-12">
        <Brand />
        <span className="text-sm text-white/60">
          A little guidance. A better choice.
        </span>
        <nav className="flex flex-wrap gap-5 text-sm text-white/65">
          <a href="#why-needwise" className="hover:text-white">About</a>
          <a href="#how-it-works" className="hover:text-white">How it works</a>
          <a href="mailto:hello@needwise.ai" className="hover:text-white">Need a hand?</a>
        </nav>
        <small className="text-xs text-white/50">
          © {new Date().getFullYear()} NeedwiseAI
        </small>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();

  function startWithNeed({ need = "", category = "", location = "" } = {}) {
    const params = new URLSearchParams();
    if (need) params.set("need", need);
    if (category) params.set("category", category);
    if (location) params.set("location", location);

    navigate(`/supplier${params.size ? `?${params.toString()}` : ""}`);
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F8F6F0]">
      <Header onStart={() => startWithNeed()} />
      <main className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <Hero onStart={startWithNeed} />
        <Inspiration onChoose={startWithNeed} />
        <HowItWorks />
        <WhyNeedwise />
      </main>
      <Footer />
    </div>
  );
}
