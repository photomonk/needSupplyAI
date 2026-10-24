import { useState } from "react";
import {
  MapPin,
  LocateFixed,
  CheckCircle2,
  LoaderCircle,
  Keyboard,
} from "lucide-react";

export default function LocationPicker({ value, onChange }) {
  const [mode, setMode] = useState(value?.mode || "typed");
  const [address, setAddress] = useState(value?.address || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function chooseMode(nextMode) {
    setMode(nextMode);
    setError("");

    onChange(
      nextMode === "typed"
        ? { mode: "typed", address }
        : null
    );
  }

  function updateAddress(nextAddress) {
    setAddress(nextAddress);
    setError("");

    onChange({
      mode: "typed",
      address: nextAddress,
    });
  }

  function useLiveLocation() {
    setError("");

    if (!navigator.geolocation) {
      setError("Your browser does not support geolocation.");
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          mode: "live",
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        onChange(location);
        setMode("live");
        setLoading(false);
      },
      (geoError) => {
        const messages = {
          1: "Location permission was denied. You can type your location instead.",
          2: "Your current location could not be determined.",
          3: "Location request timed out. Please try again.",
        };

        setError(
          messages[geoError.code] ||
            "Unable to access your location."
        );

        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 60000,
      }
    );
  }

  const liveSelected = mode === "live" && value?.mode === "live";
  const typedSelected = mode === "typed";

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <MapPin size={20} />
        </div>

        <div>
          <h3 className="font-semibold text-slate-900">
            Where should we find suppliers?
          </h3>
          <p className="mt-1 text-sm leading-5 text-slate-500">
            Choose your current location or enter a delivery area.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => chooseMode("live")}
          className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${
            mode === "live"
              ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
              : "border-slate-200 hover:border-slate-300"
          }`}
        >
          <LocateFixed
            size={20}
            className={
              mode === "live" ? "text-blue-600" : "text-slate-500"
            }
          />
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Use live location
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Share your device coordinates
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => chooseMode("typed")}
          className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${
            mode === "typed"
              ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
              : "border-slate-200 hover:border-slate-300"
          }`}
        >
          <Keyboard
            size={20}
            className={
              mode === "typed" ? "text-blue-600" : "text-slate-500"
            }
          />
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Enter manually
            </p>
            <p className="mt-1 text-xs text-slate-500">
              City, area, or PIN code
            </p>
          </div>
        </button>
      </div>

      {typedSelected && (
        <div className="mt-4">
          <label
            htmlFor="supplier-location"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Search area
          </label>

          <input
            id="supplier-location"
            type="text"
            value={address}
            onChange={(event) => updateAddress(event.target.value)}
            placeholder="e.g. Kharar, Punjab or 140301"
            maxLength={300}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
          />

          <p className="mt-2 text-xs text-slate-500">
            Use the area where you want to source or receive materials.
          </p>
        </div>
      )}

      {mode === "live" && (
        <div className="mt-4">
          <button
            type="button"
            onClick={useLiveLocation}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <LoaderCircle className="animate-spin" size={18} />
            ) : (
              <LocateFixed size={18} />
            )}
            {loading ? "Getting location..." : "Get my current location"}
          </button>

          {liveSelected && (
            <div className="mt-3 flex items-start gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">
              <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold">Coordinates captured</p>
                <p className="mt-1 break-all text-xs">
                  {value.latitude.toFixed(5)},{" "}
                  {value.longitude.toFixed(5)}
                </p>
                <p className="mt-1 text-xs text-emerald-700">
                  This is a coordinate location, not a verified street address.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <p role="alert" className="mt-3 text-sm text-red-600">
          {error}
        </p>
      )}
    </section>
  );
}