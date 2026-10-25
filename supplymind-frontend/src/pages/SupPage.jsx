
"use client";

import { useState } from "react";

const API_URL =
  "https://njh45jg4-8000.inc1.devtunnels.ms/agent/supplier-search";

const inputClass =
  "w-full rounded-xl border border-[#E7D9A4] bg-[#FFFDF5] px-4 py-3 text-[#403A29] placeholder:text-[#A49A78] outline-none transition focus:border-[#B99A36] focus:ring-2 focus:ring-[#E8DCA8]/60";

const cardClass =
  "rounded-2xl border border-[#EAE0BC] bg-[#FFFBEB] p-6 shadow-sm";

export default function SupplierSearchPage() {
  const [form, setForm] = useState({
    category: "microcontroller",
    price: "350",
    quantity: "2",
    mode: "online",
  });

  const [specifications, setSpecifications] = useState([
    { key: "", value: "" },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [response, setResponse] = useState(null);

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: String(value),
    }));
  }

  function handleSpecificationChange(index, field, value) {
    setSpecifications((prev) =>
      prev.map((item, i) =>
        i === index
          ? { ...item, [field]: String(value) }
          : item
      )
    );
  }

  function addSpecification() {
    setSpecifications((prev) => [
      ...prev,
      { key: "", value: "" },
    ]);
  }

  function removeSpecification(index) {
    setSpecifications((prev) =>
      prev.filter((_, i) => i !== index)
    );
  }

  function getPayload() {
    return {
      category: String(form.category).trim(),
      price: String(form.price),
      quantity: String(form.quantity),
      mode: String(form.mode),
      specifications: Object.fromEntries(
        specifications
          .filter((item) => item.key.trim() !== "")
          .map((item) => [
            item.key.trim(),
            String(item.value),
          ])
      ),
    };
  }

  function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setResponse(null);

    if (!form.category.trim()) {
      setError("Please enter a product category.");
      return;
    }

    if (
      form.price.trim() === "" ||
      !Number.isFinite(Number(form.price)) ||
      Number(form.price) < 0
    ) {
      setError("Enter a valid, non-negative price.");
      return;
    }

    if (!/^[1-9]\d*$/.test(form.quantity.trim())) {
      setError("Quantity must be a positive integer.");
      return;
    }

    const payload = getPayload();

    if (
      Object.keys(payload.specifications).length !==
      specifications.filter(
        (item) => item.key.trim() !== ""
      ).length
    ) {
      setError("Please check your specification fields.");
      return;
    }

    console.log("Request payload:", payload);

    setLoading(true);

    fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((res) =>
        res.text().then((text) => {
          let data;

          try {
            data = text ? JSON.parse(text) : {};
          } catch {
            data = { message: text };
          }

          if (!res.ok) {
            const detail =
              typeof data.detail === "string"
                ? data.detail
                : data.detail
                  ? JSON.stringify(data.detail)
                  : data.message;

            throw new Error(
              detail || `Request failed (${res.status})`
            );
          }

          return data;
        })
      )
      .then((data) => {
        setResponse(data);
      })
      .catch((err) => {
        console.error("Supplier search error:", err);
        setError(
          err.message ||
            "Unable to connect. Check your API and CORS settings."
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }

  return (
    <main className="min-h-screen bg-[#FFFDF5] px-4 py-10 text-[#403A29] sm:px-8">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <header className="mb-8">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#E8DCA8] bg-[#FFF5C9] px-4 py-2 text-sm font-semibold text-[#80691F]">
            <span>✦</span>
            Intelligent B2B Procurement
          </div>

          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
            SupplyMind
            <span className="text-[#B69A39]">.</span>
          </h1>

          <p className="mt-3 max-w-2xl leading-7 text-[#81775B]">
            Discover suppliers, compare requirements, and
            simplify your procurement workflow.
          </p>
        </header>

        {/* Main content */}
        <div className="grid items-start gap-6 lg:grid-cols-2">

          {/* Form */}
          <section className={cardClass}>
            <div className="mb-6">
              <h2 className="text-xl font-bold">
                Supplier Search
              </h2>
              <p className="mt-1 text-sm text-[#81775B]">
                Tell us what your business needs.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

              <div>
                <label
                  htmlFor="category"
                  className="mb-2 block text-sm font-semibold"
                >
                  Product category
                </label>

                <input
                  id="category"
                  name="category"
                  type="text"
                  value={form.category}
                  onChange={handleChange}
                  placeholder="e.g. microcontroller"
                  required
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="price"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Budget / Price
                  </label>

                  <input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="any"
                    value={form.price}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </div>

                <div>
                  <label
                    htmlFor="quantity"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Quantity
                  </label>

                  <input
                    id="quantity"
                    name="quantity"
                    type="number"
                    min="1"
                    step="1"
                    value={form.quantity}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="mode"
                  className="mb-2 block text-sm font-semibold"
                >
                  Supplier search mode
                </label>

                <select
                  id="mode"
                  name="mode"
                  value={form.mode}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="online">
                    Online suppliers
                  </option>
                  <option value="local">
                    Local suppliers
                  </option>
                  <option value="both">
                    Online + local
                  </option>
                </select>
              </div>

              {/* Specifications */}
              <div>
                <div className="mb-3 flex items-center justify-between gap-2">
                  <label className="text-sm font-semibold">
                    Specifications
                  </label>

                  <button
                    type="button"
                    onClick={addSpecification}
                    className="rounded-lg px-2 py-1 text-sm font-semibold text-[#8C7224] transition hover:bg-[#F8EDC4]"
                  >
                    + Add field
                  </button>
                </div>

                <div className="space-y-3">
                  {specifications.map((spec, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-[1fr_1fr_auto] gap-2"
                    >
                      <input
                        type="text"
                        value={spec.key}
                        onChange={(e) =>
                          handleSpecificationChange(
                            index,
                            "key",
                            e.target.value
                          )
                        }
                        placeholder="Property"
                        aria-label={`Specification ${index + 1} property`}
                        className="min-w-0 rounded-xl border border-[#E7D9A4] bg-[#FFFDF5] px-3 py-3 text-sm outline-none focus:border-[#B99A36]"
                      />

                      <input
                        type="text"
                        value={spec.value}
                        onChange={(e) =>
                          handleSpecificationChange(
                            index,
                            "value",
                            e.target.value
                          )
                        }
                        placeholder="Value"
                        aria-label={`Specification ${index + 1} value`}
                        className="min-w-0 rounded-xl border border-[#E7D9A4] bg-[#FFFDF5] px-3 py-3 text-sm outline-none focus:border-[#B99A36]"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          removeSpecification(index)
                        }
                        aria-label="Remove specification"
                        className="rounded-xl border border-[#E7D9A4] px-3 text-[#8C6A55] transition hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Error */}
              {error && (
                <div
                  role="alert"
                  className="break-words rounded-xl border border-[#E8B8A6] bg-[#FFF0E9] p-4 text-sm text-[#9A432E]"
                >
                  <strong>Request error</strong>
                  <p className="mt-1">{error}</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#E8D17D] px-5 py-3.5 font-bold text-[#403A29] shadow-sm transition hover:bg-[#DFC15A] focus:outline-none focus:ring-2 focus:ring-[#B99A36] focus:ring-offset-2 focus:ring-offset-[#FFFBEB] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Searching suppliers..."
                  : "Find Suppliers  →"}
              </button>

              <p className="text-center text-xs text-[#978C6B]">
                Your requirements will be sent to the
                SupplyMind API.
              </p>
            </form>
          </section>

          {/* Response */}
          <section className={cardClass}>
            <div className="mb-6">
              <h2 className="text-xl font-bold">
                Search Results
              </h2>
              <p className="mt-1 text-sm text-[#81775B]">
                Your supplier-search API response appears here.
              </p>
            </div>

            {loading && (
              <div
                role="status"
                className="flex min-h-56 flex-col items-center justify-center gap-4 rounded-xl border border-[#EAE0BC] bg-[#FFFDF5] p-6"
              >
                <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#E9DFB9] border-t-[#B99A36]" />
                <p className="text-sm font-medium text-[#81775B]">
                  Finding suitable suppliers...
                </p>
              </div>
            )}

            {!loading && response === null && (
              <div className="flex min-h-56 flex-col items-center justify-center rounded-xl border border-dashed border-[#DFD2A5] bg-[#FFFDF5] p-6 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF0B5] text-2xl text-[#8C7224]">
                  ✦
                </div>

                <h3 className="font-semibold">
                  Ready to discover suppliers?
                </h3>

                <p className="mt-2 max-w-xs text-sm leading-6 text-[#81775B]">
                  Submit your requirements to see the
                  response returned by your backend.
                </p>
              </div>
            )}

            {!loading && response !== null && (
              <div className="space-y-4">
                <div className="rounded-xl border border-[#C9D9A7] bg-[#F1F7E6] p-3 text-sm font-medium text-[#4E6C32]">
                  Request completed successfully.
                </div>

                <pre className="max-h-[500px] overflow-auto whitespace-pre-wrap break-words rounded-xl border border-[#EAE0BC] bg-[#FFFDF5] p-4 text-sm leading-6 text-[#655622]">
                  {JSON.stringify(response, null, 2)}
                </pre>

                <button
                  type="button"
                  onClick={() => {
                    const json = JSON.stringify(
                      response,
                      null,
                      2
                    );

                    if (navigator.clipboard?.writeText) {
                      navigator.clipboard
                        .writeText(json)
                        .catch((err) =>
                          console.error("Copy failed:", err)
                        );
                    }
                  }}
                  className="rounded-xl border border-[#E1D3A0] bg-[#FFFDF5] px-4 py-2.5 text-sm font-semibold text-[#6D5B25] transition hover:bg-[#FFF2C3]"
                >
                  Copy response JSON
                </button>
              </div>
            )}
          </section>
        </div>

        {/* Request preview */}
        <section className={`${cardClass} mt-6`}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">
                Request Body Preview
              </h2>
              <p className="mt-1 text-sm text-[#81775B]">
                Updates automatically as you type.
              </p>
            </div>

            <span className="rounded-full border border-[#E5D69C] bg-[#FFF0B5] px-3 py-1 text-xs font-semibold text-[#80691F]">
              JSON
            </span>
          </div>

         
<div className="results-panel">
  <h2>Search Results</h2>
  <p>
    {result
      ? `${result.suppliers_found ?? result.suppliers?.length ?? 0} suppliers found`
      : "Your supplier-search API response appears here."}
  </p>

  {loading && <p>Searching suppliers...</p>}

  {error && (
    <p className="error-message">{error}</p>
  )}

  {result && (
    <>
      {Array.isArray(result.suppliers) &&
      result.suppliers.length > 0 ? (
        <div className="table-wrapper">
          <table className="supplier-table">
            <thead>
              <tr>
                <th>Supplier Name</th>
                <th>Match Score</th>
                <th>Estimated Price</th>
                <th>MOQ</th>
                <th>Mode</th>
              </tr>
            </thead>

            <tbody>
              {result.suppliers.map((supplier, index) => (
                <tr key={supplier.supplier_id ?? index}>
                  <td>
                    {supplier.supplier_name ?? "—"}
                  </td>
                  <td>
                    {supplier.match_score ?? "—"}
                  </td>
                  <td>
                    {supplier.estimated_price != null
                      ? `₹${supplier.estimated_price}`
                      : "—"}
                  </td>
                  <td>{supplier.moq ?? "—"}</td>
                  <td>{supplier.mode ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No suppliers found for this search.</p>
      )}
    </>
  )}
</div>


          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-[#978C6B]">
            <span>POST /agent/supplier-search</span>

            <button
              type="button"
              onClick={() => {
                const json = JSON.stringify(
                  getPayload(),
                  null,
                  2
                );

                if (navigator.clipboard?.writeText) {
                  navigator.clipboard
                    .writeText(json)
                    .catch((err) =>
                      console.error("Copy failed:", err)
                    );
                }
              }}
              className="font-semibold text-[#8C7224] hover:underline"
            >
              Copy request body
            </button>
          </div>
        </section>

        <footer className="mt-8 pb-4 text-center text-xs text-[#A49A78]">
          SupplyMind · Smarter sourcing, simpler procurement.
        </footer>
      </div>
    </main>
  );
}
