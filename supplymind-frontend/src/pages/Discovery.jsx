
// import { useEffect, useState } from "react";
// import { useSearchParams, Link } from "react-router-dom";
// import {
//   Bell,
//   ChevronDown,
//   CircleHelp,
//   Command,
//   Wifi,
//   WifiOff,
//   Sparkles,
//   ArrowLeft,
//   Search,
// } from "lucide-react";

// import ProductSelector from "../components/ProductDiscovery";
// import Sidebar from "../components/Sidebar";
// import DiscoveryForm from "../components/DiscoveryForm";
// import SpecificationCard from "../components/SpecificationCard";
// import { api } from "../services/api";

// export default function DiscoveryPage() {
//   const [result, setResult] = useState(null);
//   const [apiStatus, setApiStatus] = useState("checking");
//   const [formKey, setFormKey] = useState(0);
//   const [selectedSearch, setSelectedSearch] = useState(null);
//   const [searchParams] = useSearchParams();

//   const initialNeed = searchParams.get("need") || "";
//   const initialCategory = searchParams.get("category") || "";
//   const initialLocation = searchParams.get("location") || "";

//   const [isSearching, setIsSearching] = useState(false);
//   const [supplierResults, setSupplierResults] = useState(null);
//   const [searchError, setSearchError] = useState("");

//   useEffect(() => {
//     let active = true;

//     api
//       .health()
//       .then(() => {
//         if (active) setApiStatus("online");
//       })
//       .catch(() => {
//         if (active) setApiStatus("offline");
//       });

//     return () => {
//       active = false;
//     };
//   }, []);

//   function resetSearch() {
//     setResult(null);
//     setSelectedSearch(null);
//     setFormKey((key) => key + 1);
//     window.scrollTo({ top: 0, behavior: "smooth" });
//   }

//   return (
//     <div className="min-h-screen bg-[#F8F6F0] text-[#183C32] lg:flex">
//       <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-20 lg:block">
//         <Sidebar onNewSearch={resetSearch} />
//       </div>

//       <main className="min-w-0 flex-1 lg:ml-64">
//         <header className="sticky top-0 z-10 border-b border-[#183C32]/10 bg-[#F8F6F0]/95 backdrop-blur-xl">
//           <div className="flex min-h-[76px] items-center justify-between gap-4 px-4 sm:px-8">
//             <div className="flex min-w-0 items-center gap-3">
//               <Link
//                 to="/"
//                 aria-label="Back to homepage"
//                 className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#183C32]/10 bg-white text-[#183C32] transition hover:bg-[#EEE8DB]"
//               >
//                 <ArrowLeft size={18} />
//               </Link>

//               <div className="hidden h-10 w-10 items-center justify-center rounded-xl bg-[#183C32] text-[#C7A879] sm:flex">
//                 <Command size={19} />
//               </div>

//               <div className="min-w-0">
//                 <p className="text-xs font-medium tracking-[0.16em] text-[#8A8A7C]">
//                   NEEDWISE AI / SOURCING
//                 </p>
//                 <h2 className="mt-1 truncate text-sm font-semibold text-[#183C32] sm:text-base">
//                   Product Discovery
//                 </h2>
//               </div>
//             </div>

//             <div className="flex items-center gap-2 sm:gap-3">
//               <div
//                 className={`hidden items-center gap-2 rounded-full px-3 py-2 text-xs font-medium sm:flex ${
//                   apiStatus === "online"
//                     ? "bg-emerald-50 text-emerald-800"
//                     : apiStatus === "offline"
//                     ? "bg-red-50 text-red-700"
//                     : "bg-amber-50 text-amber-800"
//                 }`}
//                 title="FastAPI backend status"
//               >
//                 {apiStatus === "online" ? (
//                   <Wifi size={14} />
//                 ) : (
//                   <WifiOff size={14} />
//                 )}

//                 {apiStatus === "online"
//                   ? "API connected"
//                   : apiStatus === "offline"
//                   ? "API disconnected"
//                   : "Checking API"}
//               </div>

//               <button
//                 type="button"
//                 title="Help"
//                 aria-label="Help"
//                 onClick={() =>
//                   window.alert(
//                     "Enter a product, select your preferences, and answer the AI-generated questions to discover suitable options."
//                   )
//                 }
//                 className="flex h-10 w-10 items-center justify-center rounded-xl text-[#77786F] transition hover:bg-[#EEE8DB] hover:text-[#183C32]"
//               >
//                 <CircleHelp size={19} />
//               </button>

//               <button
//                 type="button"
//                 title="Notifications"
//                 aria-label="Notifications"
//                 className="relative flex h-10 w-10 items-center justify-center rounded-xl text-[#77786F] transition hover:bg-[#EEE8DB] hover:text-[#183C32]"
//               >
//                 <Bell size={19} />
//                 <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#C7A879] ring-2 ring-[#F8F6F0]" />
//               </button>

//               <button
//                 type="button"
//                 className="hidden items-center gap-2 rounded-xl border border-[#183C32]/10 bg-white px-3 py-2 sm:flex"
//               >
//                 <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#EEE8DB] text-xs font-bold text-[#183C32]">
//                   B
//                 </span>
//                 <span className="text-sm font-medium text-[#183C32]">
//                   Buyer
//                 </span>
//                 <ChevronDown size={15} className="text-[#8A8A7C]" />
//               </button>
//             </div>
//           </div>
//         </header>

//         <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8 sm:py-10">
//           <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
//             <div>
//               <p className="text-sm text-[#77786F]">
//                 Welcome to your sourcing workspace
//               </p>
//               <h1 className="mt-2 text-3xl font-medium tracking-tight text-[#183C32] sm:text-4xl">
//                 Find your perfect fit.
//               </h1>
//               <p className="mt-2 max-w-xl text-sm leading-6 text-[#77786F]">
//                 Discover relevant products through AI-assisted search and
//                 recommendations tailored to your needs.
//               </p>
//             </div>

//             <div className="flex items-center gap-2 rounded-full border border-[#183C32]/10 bg-white px-4 py-2.5 text-xs font-medium text-[#183C32]">
//               <Sparkles size={15} className="text-[#B99A68]" />
//               AI-assisted discovery
//             </div>
//           </div>

//           {(initialNeed || initialCategory || initialLocation) && (
//             <div className="mb-6 rounded-2xl border border-[#C7A879]/40 bg-white p-5">
//               <p className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-[0.15em] text-[#8A8A7C]">
//                 <Search size={14} />
//                 YOUR LANDING PAGE SEARCH
//               </p>

//               {initialNeed && (
//                 <p className="text-base font-semibold text-[#183C32]">
//                   {initialNeed}
//                 </p>
//               )}

//               <div className="mt-3 flex flex-wrap gap-2">
//                 {initialCategory && (
//                   <span className="rounded-full bg-[#EEE8DB] px-3 py-1.5 text-xs text-[#183C32]">
//                     {initialCategory}
//                   </span>
//                 )}
//                 {initialLocation && (
//                   <span className="rounded-full bg-[#EEE8DB] px-3 py-1.5 text-xs text-[#183C32]">
//                     {initialLocation}
//                   </span>
//                 )}
//               </div>
//             </div>
//           )}

//           {apiStatus === "offline" && (
//             <div
//               role="status"
//               className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
//             >
//               <p className="font-semibold">
//                 The backend is not responding.
//               </p>
//               <p className="mt-1 leading-6">
//                 Start FastAPI and check the API URL in your{" "}
//                 <code className="rounded bg-amber-100 px-1">.env</code> file.
//                 You can fill out the form, but AI discovery requires the
//                 backend to be available.
//               </p>
//             </div>
//           )}

//           {!result ? (
//             <DiscoveryForm
//               key={formKey}
//               onComplete={(options) => {
//                 setResult(options);
//                 setSelectedSearch(null);
//               }}
//             />
//           ) : (
//             <>
//               <SpecificationCard
//                 result={result}
//                 onReset={resetSearch}
//               />

//               <ProductSelector
//                 products={
//                   Array.isArray(result)
//                     ? result
//                     : result.products ?? []
//                 }
//                 onSearch={(selection) => {
//                   setSelectedSearch(selection);

//                   console.log(
//                     "Selected product:",
//                     selection.product
//                   );
//                   console.log(
//                     "Search query:",
//                     selection.query
//                   );

//                   // Connect your supplier-search API here.
//                 }}
//               />
              
// <ProductSelector
//   products={
//     Array.isArray(result)
//       ? result
//       : result.products ?? []
//   }
//   onSearch={async (selection) => {
//     const query = selection.query?.trim();

//     if (!query) {
//       setSearchError("Please select a product and enter a search query.");
//       return;
//     }

//     setSelectedSearch(selection);
//     setIsSearching(true);
//     setSearchError("");
//     setSupplierResults(null);

//     try {
//       const data = await searchSuppliers(query);

//       console.log("Supplier API response:", data);
//       setSupplierResults(data);
//     } catch (error) {
//       console.error("Supplier search failed:", error);
//       setSearchError(error.message || "Supplier search failed.");
//     } finally {
//       setIsSearching(false);
//     }
//   }}
// />

// {isSearching && (
//   <p className="mt-4 text-sm text-slate-600">
//     Searching for suppliers...
//   </p>
// )}

// {searchError && (
//   <p role="alert" className="mt-4 text-sm text-red-600">
//     {searchError}
//   </p>
// )}

// {supplierResults && (
//   <div className="mt-5 rounded-2xl border p-5">
//     <h3 className="font-semibold text-slate-900">
//       Supplier search results
//     </h3>
//     <pre className="mt-3 overflow-auto whitespace-pre-wrap text-sm">
//       {JSON.stringify(supplierResults, null, 2)}
//     </pre>
//   </div>
// )}


//               {selectedSearch && (
//                 <div
//                   role="status"
//                   className="mt-5 rounded-2xl border border-[#C7A879]/40 bg-white p-5"
//                 >
//                   <p className="text-sm font-semibold text-[#183C32]">
//                     Product selected
//                   </p>
//                   <p className="mt-2 text-sm text-[#77786F]">
//                     Search: {selectedSearch.query || "No query provided"}
//                   </p>
//                   <p className="mt-1 text-xs text-[#8A8A7C]">
//                     Connect your supplier-search API to retrieve matching
//                     products and suppliers.
//                   </p>
//                 </div>
//               )}
//             </>
//           )}

//           <footer className="mt-12 flex flex-col justify-between gap-2 border-t border-[#183C32]/10 py-6 text-xs text-[#8A8A7C] sm:flex-row sm:items-center">
//             <p>© {new Date().getFullYear()} NeedwiseAI</p>
//             <p>
//               Intelligent product discovery · Built for B2C sourcing
//             </p>
//           </footer>
//         </div>
//       </main>
//     </div>
//   );
// }


import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Bell,
  CircleHelp,
  Command,
  Wifi,
  WifiOff,
  Sparkles,
  Search,
  LoaderCircle,
  RefreshCw,
  PackageSearch,
  AlertCircle,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import DiscoveryForm from "../components/DiscoveryForm";
import ProductSelector from "../components/ProductDiscovery";
import SpecificationCard from "../components/SpecificationCard";
import { api } from "../services/api";

export default function Discovery() {
  const [searchParams] = useSearchParams();

  const [result, setResult] = useState(null);
  const [apiStatus, setApiStatus] = useState("checking");
  const [formKey, setFormKey] = useState(0);

  const [selectedSearch, setSelectedSearch] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [supplierResults, setSupplierResults] = useState(null);
  const [searchError, setSearchError] = useState("");

  const initialNeed = searchParams.get("need") || "";
  const initialCategory = searchParams.get("category") || "";
  const initialLocation = searchParams.get("location") || "";

  const checkApiStatus = useCallback(async () => {
    setApiStatus("checking");

    try {
      await api.health();
      setApiStatus("online");
    } catch (error) {
      console.error("API health check failed:", error);
      setApiStatus("offline");
    }
  }, []);

  useEffect(() => {
    checkApiStatus();
  }, [checkApiStatus]);

  const resetSearch = () => {
    setResult(null);
    setSelectedSearch(null);
    setSupplierResults(null);
    setSearchError("");
    setIsSearching(false);
    setFormKey((previous) => previous + 1);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleSupplierSearch = async (selection) => {
    const query = String(selection?.query || "").trim();

    if (!query) {
      setSearchError(
        "Please select a product or enter a search query."
      );
      return;
    }

    if (isSearching) return;

    setSelectedSearch(selection);
    setIsSearching(true);
    setSearchError("");
    setSupplierResults(null);

    try {
      const data = await api.searchSuppliers(query);
      setSupplierResults(data);
      setApiStatus("online");
    } catch (error) {
      console.error("Supplier search failed:", error);

      setSearchError(
        error?.message ||
          "Unable to retrieve suppliers. Please try again."
      );
    } finally {
      setIsSearching(false);
    }
  };

  const products = Array.isArray(result)
    ? result
    : Array.isArray(result?.products)
      ? result.products
      : [];

  return (
    <div className="min-h-screen bg-[#F7F6F2] text-[#183C32]">
      <div className="flex min-h-screen">
        <Sidebar />

        <main className="min-w-0 flex-1">
          {/* Top navigation */}
          <header className="sticky top-0 z-20 border-b border-[#183C32]/10 bg-[#F7F6F2]/95 backdrop-blur">
            <div className="flex min-h-[76px] items-center justify-between gap-4 px-5 py-3 sm:px-8 lg:px-10">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#183C32] text-white">
                  <Command size={19} />
                </div>

                <div>
                  <h1 className="text-lg font-bold tracking-tight">
                    SupplyMind
                  </h1>
                  <p className="text-xs text-[#77786F]">
                    Intelligent product discovery
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden items-center gap-2 rounded-full border border-[#183C32]/10 bg-white px-3 py-2 sm:flex">
                  {apiStatus === "online" ? (
                    <Wifi size={15} className="text-emerald-600" />
                  ) : apiStatus === "offline" ? (
                    <WifiOff size={15} className="text-red-500" />
                  ) : (
                    <LoaderCircle
                      size={15}
                      className="animate-spin text-amber-600"
                    />
                  )}

                  <span className="text-xs font-medium text-[#77786F]">
                    {apiStatus === "online"
                      ? "API Connected"
                      : apiStatus === "offline"
                        ? "API Offline"
                        : "Connecting"}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={checkApiStatus}
                  disabled={apiStatus === "checking"}
                  title="Refresh backend status"
                  aria-label="Refresh backend status"
                  className="rounded-xl border border-[#183C32]/10 bg-white p-2.5 hover:bg-[#EFEEE7] disabled:opacity-50"
                >
                  <RefreshCw
                    size={17}
                    className={
                      apiStatus === "checking" ? "animate-spin" : ""
                    }
                  />
                </button>

                <button
                  type="button"
                  aria-label="Notifications"
                  className="rounded-xl border border-[#183C32]/10 bg-white p-2.5 hover:bg-[#EFEEE7]"
                >
                  <Bell size={17} />
                </button>

                <button
                  type="button"
                  aria-label="Help"
                  className="rounded-xl border border-[#183C32]/10 bg-white p-2.5 hover:bg-[#EFEEE7]"
                >
                  <CircleHelp size={17} />
                </button>
              </div>
            </div>
          </header>

          {/* Page content */}
          <div className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
            <section className="mb-8">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#C7A879]/40 bg-[#C7A879]/10 px-3 py-1.5 text-xs font-semibold text-[#80633B]">
                <Sparkles size={14} />
                AI-powered sourcing
              </div>

              <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                    Product Discovery
                  </h2>

                  <p className="mt-3 max-w-2xl text-sm leading-6 text-[#77786F] sm:text-base">
                    Describe what you need, define your requirements,
                    discover suitable products, and search for suppliers
                    through one workflow.
                  </p>
                </div>

                {result && (
                  <button
                    type="button"
                    onClick={resetSearch}
                    className="inline-flex w-fit items-center gap-2 rounded-xl border border-[#183C32]/15 bg-white px-4 py-2.5 text-sm font-semibold hover:bg-[#EFEEE7]"
                  >
                    <ArrowLeft size={16} />
                    New discovery
                  </button>
                )}
              </div>
            </section>

            {/* Workflow overview */}
            <section className="mb-7 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-[#183C32]/10 bg-white p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#183C32]/5">
                    <Search size={19} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Discover</p>
                    <p className="mt-1 text-xs text-[#77786F]">
                      Define your product needs
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-[#183C32]/10 bg-white p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#C7A879]/15">
                    <Sparkles size={19} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Specify</p>
                    <p className="mt-1 text-xs text-[#77786F]">
                      Review product requirements
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-[#183C32]/10 bg-white p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#183C32]/5">
                    <PackageSearch size={19} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Find suppliers</p>
                    <p className="mt-1 text-xs text-[#77786F]">
                      Search using your product query
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* API connection warning */}
            {apiStatus === "offline" && (
              <div
                role="alert"
                className="mb-6 flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-3">
                  <WifiOff
                    size={19}
                    className="mt-0.5 shrink-0 text-amber-700"
                  />
                  <div>
                    <p className="text-sm font-semibold text-amber-900">
                      Backend connection unavailable
                    </p>
                    <p className="mt-1 text-sm text-amber-800">
                      Check that FastAPI is running and your API URL is
                      configured correctly.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={checkApiStatus}
                  className="inline-flex w-fit items-center gap-2 rounded-lg border border-amber-300 px-3 py-2 text-sm font-medium text-amber-900 hover:bg-amber-100"
                >
                  <RefreshCw size={14} />
                  Retry
                </button>
              </div>
            )}

            {/* Discovery workflow */}
            <section className="rounded-3xl border border-[#183C32]/10 bg-white p-5 shadow-sm sm:p-7 lg:p-9">
              {!result ? (
                <>
                  <div className="mb-7">
                    <h3 className="text-xl font-bold">
                      What are you looking for?
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-[#77786F]">
                      Provide your requirements to start discovering
                      relevant products.
                    </p>
                  </div>

                  <DiscoveryForm
                    key={formKey}
                    initialNeed={initialNeed}
                    initialCategory={initialCategory}
                    initialLocation={initialLocation}
                    onComplete={(options) => {
                      setResult(options);
                      setSelectedSearch(null);
                      setSupplierResults(null);
                      setSearchError("");
                    }}
                  />
                </>
              ) : (
                <div className="space-y-7">
                  <SpecificationCard
                    result={result}
                    onReset={resetSearch}
                  />

                  <div className="border-t border-[#183C32]/10 pt-7">
                    <div className="mb-5">
                      <h3 className="text-xl font-bold">
                        Select a product
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-[#77786F]">
                        Choose a suggested product to search for
                        suppliers.
                      </p>
                    </div>

                    <ProductSelector
                      products={products}
                      onSearch={handleSupplierSearch}
                    />
                  </div>

                  {/* Selected product */}
                  {selectedSearch && (
                    <div className="rounded-2xl border border-[#C7A879]/40 bg-[#FBF9F4] p-5">
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#80633B]">
                        Current supplier search
                      </p>
                      <p className="mt-2 break-words text-base font-semibold">
                        {selectedSearch.query}
                      </p>
                    </div>
                  )}

                  {/* Loading */}
                  {isSearching && (
                    <div
                      role="status"
                      aria-live="polite"
                      className="rounded-2xl border border-[#183C32]/10 bg-[#F7F6F2] p-6"
                    >
                      <div className="flex items-center gap-3">
                        <LoaderCircle
                          size={22}
                          className="animate-spin"
                        />
                        <div>
                          <p className="font-semibold">
                            Searching for suppliers...
                          </p>
                          <p className="mt-1 text-sm text-[#77786F]">
                            Sending your query to the backend.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Errors */}
                  {searchError && (
                    <div
                      role="alert"
                      className="rounded-2xl border border-red-200 bg-red-50 p-5"
                    >
                      <div className="flex items-start gap-3">
                        <AlertCircle
                          size={20}
                          className="mt-0.5 shrink-0 text-red-600"
                        />
                        <div>
                          <p className="font-semibold text-red-800">
                            Supplier search failed
                          </p>
                          <p className="mt-1 break-words text-sm leading-6 text-red-700">
                            {searchError}
                          </p>

                          {selectedSearch?.query && (
                            <button
                              type="button"
                              onClick={() =>
                                handleSupplierSearch(selectedSearch)
                              }
                              disabled={isSearching}
                              className="mt-3 rounded-lg border border-red-300 px-3 py-2 text-sm font-semibold text-red-800 hover:bg-red-100 disabled:opacity-50"
                            >
                              Try again
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Supplier results */}
                  {supplierResults !== null && (
                    <div className="overflow-hidden rounded-2xl border border-[#183C32]/10">
                      <div className="flex flex-col justify-between gap-3 border-b border-[#183C32]/10 bg-[#F7F6F2] p-5 sm:flex-row sm:items-center">
                        <div>
                          <h3 className="text-lg font-bold">
                            Supplier search results
                          </h3>
                          <p className="mt-1 text-sm text-[#77786F]">
                            Results returned by your backend.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            handleSupplierSearch(selectedSearch)
                          }
                          disabled={isSearching}
                          className="inline-flex w-fit items-center gap-2 rounded-xl border border-[#183C32]/15 bg-white px-3 py-2 text-sm font-semibold hover:bg-[#EFEEE7] disabled:opacity-50"
                        >
                          <RefreshCw size={15} />
                          Search again
                        </button>
                      </div>

                      <div className="p-5">
                        {Array.isArray(supplierResults?.suppliers) &&
                        supplierResults.suppliers.length > 0 ? (
                          <div className="space-y-3">
                            {supplierResults.suppliers.map(
                              (supplier, index) => (
                                <div
                                  key={
                                    supplier.id ||
                                    supplier.url ||
                                    supplier.name ||
                                    index
                                  }
                                  className="rounded-xl border border-[#183C32]/10 p-4"
                                >
                                  <div className="flex flex-col justify-between gap-2 sm:flex-row">
                                    <div>
                                      <h4 className="font-semibold">
                                        {supplier.name ||
                                          supplier.title ||
                                          `Supplier ${index + 1}`}
                                      </h4>

                                      {supplier.location && (
                                        <p className="mt-1 text-sm text-[#77786F]">
                                          {supplier.location}
                                        </p>
                                      )}
                                    </div>

                                    {supplier.price != null && (
                                      <p className="font-semibold">
                                        {supplier.price}
                                      </p>
                                    )}
                                  </div>

                                  {supplier.description && (
                                    <p className="mt-3 text-sm leading-6 text-[#77786F]">
                                      {supplier.description}
                                    </p>
                                  )}

                                  {supplier.url && (
                                    <a
                                      href={supplier.url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="mt-3 inline-flex text-sm font-semibold text-[#183C32] underline underline-offset-4"
                                    >
                                      View supplier
                                    </a>
                                  )}
                                </div>
                              )
                            )}
                          </div>
                        ) : (
                          <pre className="max-h-[480px] overflow-auto whitespace-pre-wrap break-words rounded-xl bg-[#F7F6F2] p-4 text-xs leading-6 text-[#183C32]">
                            {JSON.stringify(
                              supplierResults,
                              null,
                              2
                            )}
                          </pre>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>

            <footer className="mt-7 flex flex-col justify-between gap-2 pb-5 text-xs text-[#77786F] sm:flex-row">
              <p>SupplyMind · Intelligent sourcing workflow</p>
              <p>
                Backend:{" "}
                {apiStatus === "online"
                  ? "Connected"
                  : apiStatus === "offline"
                    ? "Disconnected"
                    : "Checking connection"}
              </p>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}

