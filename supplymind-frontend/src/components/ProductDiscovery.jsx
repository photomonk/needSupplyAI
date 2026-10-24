import { useState } from "react";
import { Search, ArrowRight, Check } from "lucide-react";

export default function ProductSelector({ products = [], onSearch }) {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [search, setSearch] = useState("");

  const handleSelect = (product) => {
    setSelectedProduct(product);
    setSearch(product.name);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!search.trim()) return;

    onSearch?.({
      product: selectedProduct,
      query: search.trim(),
    });
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">

      {/* Product options */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          Choose your product
        </h2>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {products.map((product, index) => {
            const isSelected =
              selectedProduct?.id === product.id;

            return (
              <button
                key={product.id ?? index}
                type="button"
                onClick={() => handleSelect(product)}
                className={`rounded-xl border p-5 text-left transition ${
                  isSelected
                    ? "border-violet-500 bg-violet-50 ring-2 ring-violet-100"
                    : "border-slate-200 bg-white hover:border-violet-300"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-slate-900">
                    {product.name}
                  </span>

                  {isSelected && (
                    <Check size={18} className="text-violet-600" />
                  )}
                </div>

                {product.description && (
                  <p className="mt-2 text-sm text-slate-500">
                    {product.description}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Search-style input */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-3 rounded-full border border-slate-200 bg-white p-2 pl-5 shadow-sm transition focus-within:border-violet-400 focus-within:ring-4 focus-within:ring-violet-100"
      >
        <Search size={20} className="shrink-0 text-slate-400" />

        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setSelectedProduct(null);
          }}
          placeholder="Search or edit your product..."
          aria-label="Search product"
          className="min-w-0 flex-1 bg-transparent py-3 text-sm text-slate-800 outline-none"
        />

        <button
          type="submit"
          disabled={!search.trim()}
          className="flex shrink-0 items-center gap-2 rounded-full bg-violet-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Search
          <ArrowRight size={16} />
        </button>
      </form>
    </div>
  );
}