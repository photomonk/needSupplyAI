import { useEffect, useState } from "react";
import {
  Bell,
  ChevronDown,
  CircleHelp,
  Command,
  Wifi,
  WifiOff,
} from "lucide-react";

import ProductSelector from "./components/ProductDiscovery";
import Sidebar from "./components/Sidebar";
import DiscoveryForm from "./components/DiscoveryForm";
import SpecificationCard from "./components/SpecificationCard";
import { api } from "./services/api";

export default function App() {
  const [result, setResult] = useState(null);
  const [apiStatus, setApiStatus] = useState("checking");
  const [formKey, setFormKey] = useState(0);
  
  const [selectedSearch, setSelectedSearch] = useState(null);

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
    setFormKey((key) => key + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="min-h-screen bg-[#f6f8fc] lg:flex">
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-20">
        <Sidebar onNewSearch={resetSearch} />
      </div>

      <main className="min-w-0 flex-1 lg:ml-64">
        <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
          <div className="flex min-h-[76px] items-center justify-between gap-4 px-4 sm:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <div className="hidden h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 sm:flex">
                <Command size={19} />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-400">
                  WORKSPACE / SOURCING
                </p>
                <h2 className="mt-1 truncate text-sm font-semibold text-slate-900 sm:text-base">
                  Product Discovery
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div
                className={`hidden items-center gap-2 rounded-full px-3 py-2 text-xs font-medium sm:flex ${
                  apiStatus === "online"
                    ? "bg-emerald-50 text-emerald-700"
                    : apiStatus === "offline"
                    ? "bg-red-50 text-red-700"
                    : "bg-amber-50 text-amber-700"
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
                onClick={() =>
                  window.alert(
                    "Enter a product, select a search location, and answer the short AI-generated questionnaire."
                  )
                }
                className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              >
                <CircleHelp size={19} />
              </button>

              <button
                type="button"
                title="Notifications"
                className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              >
                <Bell size={19} />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white" />
              </button>

              <button
                type="button"
                className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 sm:flex"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-xs font-bold text-blue-700">
                  S
                </span>
                <span className="text-sm font-medium text-slate-700">
                  Buyer
                </span>
                <ChevronDown size={15} className="text-slate-400" />
              </button>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8 sm:py-10">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-slate-500">
                Welcome to your sourcing workspace
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              AI-assisted discovery
            </div>
          </div>

          {apiStatus === "offline" && (
            <div
              role="status"
              className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
            >
              <p className="font-semibold">
                The backend is not responding.
              </p>
              <p className="mt-1 leading-6">
                Start FastAPI and check the API URL in your{" "}
                <code>.env</code> file. You can still fill out the form,
                but discovery requires the backend to be online.
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

        console.log("Selected product:", selection.product);
        console.log("Search query:", selection.query);

        // Call your supplier-search API here.
      }}
    />
  </>
)}

          <footer className="mt-12 flex flex-col justify-between gap-2 border-t border-slate-200 py-6 text-xs text-slate-400 sm:flex-row sm:items-center">
            <p>© {new Date().getFullYear()} SupplyMind</p>
            <p>
              Intelligent product discovery · Built for B2C sourcing
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}