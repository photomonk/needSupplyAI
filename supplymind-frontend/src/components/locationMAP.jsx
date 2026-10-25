import { useState } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";
import "./LocationMap.css";

const WORLD_CENTER = [20, 0];

function MapController({ position }) {
  const map = useMap();

  if (position) {
    map.setView(position, 13, { animate: true });
  }

  return null;
}

function MapClickHandler({ onSelect }) {
  useMapEvents({
    click(event) {
      onSelect([
        event.latlng.lat,
        event.latlng.lng,
      ]);
    },
  });

  return null;
}

export default function LocationMap({
  onLocationSelect,
  initialPosition = null,
}) {
  const [position, setPosition] = useState(initialPosition);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function selectLocation(coords) {
    setPosition(coords);
    setError("");

    onLocationSelect?.({
      latitude: coords[0],
      longitude: coords[1],
    });
  }

  function detectLocation() {
    if (!navigator.geolocation) {
      setError(
        "Your browser does not support location detection."
      );
      return;
    }

    setLoading(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      (result) => {
        const coords = [
          result.coords.latitude,
          result.coords.longitude,
        ];

        selectLocation(coords);
        setLoading(false);
      },
      (err) => {
        const messages = {
          1: "Location permission denied. Allow location access in your browser settings.",
          2: "Your location is currently unavailable. Please try again.",
          3: "Location request timed out. Please try again.",
        };

        setError(
          messages[err.code] ||
          "Unable to detect your location."
        );

        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000,
      }
    );
  }

  return (
    <section className="location-card">
      <div className="location-header">
        <div>
          <span className="location-eyebrow">
            YOUR LOCATION
          </span>

          <h2>Where are you exploring from?</h2>

          <p>
            Find relevant products and services for your area.
          </p>
        </div>

        <button
          type="button"
          className="location-button"
          onClick={detectLocation}
          disabled={loading}
        >
          {loading
            ? "Detecting..."
            : "◎ Detect my location"}
        </button>
      </div>

      <div className="location-map">
        <MapContainer
          center={position || WORLD_CENTER}
          zoom={position ? 13 : 2}
          scrollWheelZoom
          className="leaflet-map"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapController position={position} />

          <MapClickHandler
            onSelect={selectLocation}
          />

          {position && (
            <CircleMarker
              center={position}
              radius={9}
              pathOptions={{
                color: "#194737",
                fillColor: "#8A987D",
                fillOpacity: 0.9,
              }}
            >
              <Popup>
                <strong>Your selected location</strong>
                <br />
                Latitude: {position[0].toFixed(5)}
                <br />
                Longitude: {position[1].toFixed(5)}
              </Popup>
            </CircleMarker>
          )}
        </MapContainer>
      </div>

      {position && (
        <div className="location-coordinates">
          <span>Selected coordinates</span>

          <strong>
            {position[0].toFixed(5)},{" "}
            {position[1].toFixed(5)}
          </strong>

          <button
            type="button"
            onClick={() => selectLocation(position)}
          >
            Use this location
          </button>
        </div>
      )}

      {!position && (
        <p className="location-hint">
          Select "Detect my location" or click anywhere
          on the map to choose a location.
        </p>
      )}

      {error && (
        <p className="location-error" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
