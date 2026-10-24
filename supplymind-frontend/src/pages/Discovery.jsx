
import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  Bell,
  ChevronDown,
  CircleHelp,
  Command,
  Wifi,
  WifiOff,
  Sparkles,
  ArrowLeft,
  Search,
} from "lucide-react";

import ProductSelector from "../components/ProductDiscovery";
import Sidebar from "../components/Sidebar";
import DiscoveryForm from "../components/DiscoveryForm";
import SpecificationCard from "../components/SpecificationCard";
import { api } from "../services/api";

export default function DiscoveryPage() {
  const [result, setResult] = useState(null);
  const [apiStatus, setApiStatus] = useState("checking");
  const [formKey, setFormKey] = useState(0);
  const [selectedSearch, setSelectedSearch] = useState(null);
  const [searchParams] = useSearchParams();

  const initialNeed = searchParams.get("need") || "";
  const initialCategory = searchParams.get("category") || "";
  const initialLocation = searchParams.get("location") || "";

  useEffect(() => {
    let active = true;

    api
      .health()
      .then(() => {
        if (active) setApiStatus("online");
      })
      .catch(() => {
        if (active) setApiStatus("offline");
      });

    return () => {
      active = false;
    };
  }, []);

  function resetSearch() {
    setResult(null);
    setSelectedSearch(null);
    setFormKey((key) => key + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-[#183C32] lg:flex">
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-20 lg:block">
        <Sidebar onNewSearch={resetSearch} />
      </div>

      <main className="min-w-0 flex-1 lg:ml-64">
        <header className="sticky top-0 z-10 border-b border-[#183C32]/10 bg-[#F8F6F0]/95 backdrop-blur-xl">
          <div className="flex min-h-[76px] items-center justify-between gap-4 px-4 sm:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <Link
                to="/"
                aria-label="Back to homepage"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#183C32]/10 bg-white text-[#183C32] transition hover:bg-[#EEE8DB]"
              >
                <ArrowLeft size={18} />
              </Link>

              <div className="hidden h-10 w-10 items-center justify-center rounded-xl bg-[#183C32] text-[#C7A879] sm:flex">
                <Command size={19} />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-medium tracking-[0.16em] text-[#8A8A7C]">
                  NEEDWISE AI / SOURCING
                </p>
                <h2 className="mt-1 truncate text-sm font-semibold text-[#183C32] sm:text-base">
                  Product Discovery
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div
                className={`hidden items-center gap-2 rounded-full px-3 py-2 text-xs font-medium sm:flex ${
                  apiStatus === "online"
                    ? "bg-emerald-50 text-emerald-800"
                    : apiStatus === "offline"
                    ? "bg-red-50 text-red-700"
                    : "bg-amber-50 text-amber-800"
                }`}
                title="FastAPI backend status"
              >
                {apiStatus === "online" ? (
                  <Wifi size={14} />
                ) : (
                  <WifiOff size={14} />
                )}

                {apiStatus === "online"
                  ? "API connected"
                  : apiStatus === "offline"
                  ? "API disconnected"
                  : "Checking API"}
              </div>

              <button
                type="button"
                title="Help"
                aria-label="Help"
                onClick={() =>
                  window.alert(
                    "Enter a product, select your preferences, and answer the AI-generated questions to discover suitable options."
                  )
                }
                className="flex h-10 w-10 items-center justify-center rounded-xl text-[#77786F] transition hover:bg-[#EEE8DB] hover:text-[#183C32]"
              >
                <CircleHelp size={19} />
              </button>

              <button
                type="button"
                title="Notifications"
                aria-label="Notifications"
                className="relative flex h-10 w-10 items-center justify-center rounded-xl text-[#77786F] transition hover:bg-[#EEE8DB] hover:text-[#183C32]"
              >
                <Bell size={19} />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#C7A879] ring-2 ring-[#F8F6F0]" />
              </button>

              <button
                type="button"
                className="hidden items-center gap-2 rounded-xl border border-[#183C32]/10 bg-white px-3 py-2 sm:flex"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#EEE8DB] text-xs font-bold text-[#183C32]">
                  B
                </span>
                <span className="text-sm font-medium text-[#183C32]">
                  Buyer
                </span>
                <ChevronDown size={15} className="text-[#8A8A7C]" />
              </button>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8 sm:py-10">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-[#77786F]">
                Welcome to your sourcing workspace
              </p>
              <h1 className="mt-2 text-3xl font-medium tracking-tight text-[#183C32] sm:text-4xl">
                Find your perfect fit.
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-[#77786F]">
                Discover relevant products through AI-assisted search and
                recommendations tailored to your needs.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-[#183C32]/10 bg-white px-4 py-2.5 text-xs font-medium text-[#183C32]">
              <Sparkles size={15} className="text-[#B99A68]" />
              AI-assisted discovery
            </div>
          </div>

          {(initialNeed || initialCategory || initialLocation) && (
            <div className="mb-6 rounded-2xl border border-[#C7A879]/40 bg-white p-5">
              <p className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-[0.15em] text-[#8A8A7C]">
                <Search size={14} />
                YOUR LANDING PAGE SEARCH
              </p>

              {initialNeed && (
                <p className="text-base font-semibold text-[#183C32]">
                  {initialNeed}
                </p>
              )}

              <div className="mt-3 flex flex-wrap gap-2">
                {initialCategory && (
                  <span className="rounded-full bg-[#EEE8DB] px-3 py-1.5 text-xs text-[#183C32]">
                    {initialCategory}
                  </span>
                )}
                {initialLocation && (
                  <span className="rounded-full bg-[#EEE8DB] px-3 py-1.5 text-xs text-[#183C32]">
                    {initialLocation}
                  </span>
                )}
              </div>
            </div>
          )}

          {apiStatus === "offline" && (
            <div
              role="status"
              className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
            >
              <p className="font-semibold">
                The backend is not responding.
              </p>
              <p className="mt-1 leading-6">
                Start FastAPI and check the API URL in your{" "}
                <code className="rounded bg-amber-100 px-1">.env</code> file.
                You can fill out the form, but AI discovery requires the
                backend to be available.
              </p>
            </div>
          )}

          {!result ? (
            <DiscoveryForm
              key={formKey}
              onComplete={(options) => {
                setResult(options);
                setSelectedSearch(null);
              }}
            />
          ) : (
            <>
              <SpecificationCard
                result={result}
                onReset={resetSearch}
              />

              <ProductSelector
                products={
                  Array.isArray(result)
                    ? result
                    : result.products ?? []
                }
                onSearch={(selection) => {
                  setSelectedSearch(selection);

                  console.log(
                    "Selected product:",
                    selection.product
                  );
                  console.log(
                    "Search query:",
                    selection.query
                  );

                  // Connect your supplier-search API here.
                }}
              />

              {selectedSearch && (
                <div
                  role="status"
                  className="mt-5 rounded-2xl border border-[#C7A879]/40 bg-white p-5"
                >
                  <p className="text-sm font-semibold text-[#183C32]">
                    Product selected
                  </p>
                  <p className="mt-2 text-sm text-[#77786F]">
                    Search: {selectedSearch.query || "No query provided"}
                  </p>
                  <p className="mt-1 text-xs text-[#8A8A7C]">
                    Connect your supplier-search API to retrieve matching
                    products and suppliers.
                  </p>
                </div>
              )}
            </>
          )}

          <footer className="mt-12 flex flex-col justify-between gap-2 border-t border-[#183C32]/10 py-6 text-xs text-[#8A8A7C] sm:flex-row sm:items-center">
            <p>© {new Date().getFullYear()} NeedwiseAI</p>
            <p>
              Intelligent product discovery · Built for B2C sourcing
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}
