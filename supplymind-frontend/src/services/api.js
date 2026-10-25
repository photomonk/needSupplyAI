
const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000"
).replace(/\/+$/, "");

/**
 * Common HTTP client for the SupplyMind FastAPI backend.
 */
async function request(path, options = {}) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        Accept: "application/json",
        ...(options.body !== undefined
          ? { "Content-Type": "application/json" }
          : {}),
        ...options.headers,
      },
    });
  } catch (error) {
    console.error("SupplyMind API connection error:", error);

    throw new Error(
      "Cannot connect to SupplyMind API. Check your backend URL and ensure FastAPI is running."
    );
  }

  // Handle empty or non-JSON responses safely.
  const responseText = await response.text();
  let data = {};

  if (responseText) {
    try {
      data = JSON.parse(responseText);
    } catch {
      data = { message: responseText };
    }
  }

  if (!response.ok) {
    const detail = data.detail;
    const message = Array.isArray(detail)
      ? detail.map((item) => item.msg || String(item)).join(", ")
      : typeof detail === "string"
        ? detail
        : data.message || `Request failed with status ${response.status}`;

    throw new Error(message);
  }

  return data;
}

/**
 * SupplyMind API methods.
 */
export const api = {
  // Start a product discovery session.
  startSession(payload) {
    return request("/sessions/start", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  // Submit an answer in the discovery flow.
  submitAnswer(payload) {
    return request("/sessions/answer", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  // Save the user's location for the current session.
  saveLocation(sessionId, location) {
    return request(
      `/sessions/${encodeURIComponent(sessionId)}/location`,
      {
        method: "POST",
        body: JSON.stringify(location),
      }
    );
  },

  // Retrieve the generated product specification.
  getSpecification(sessionId) {
    return request(
      `/sessions/${encodeURIComponent(sessionId)}/search-specification`
    );
  },

  // Check backend connectivity.
  health() {
    return request("/health");
  },

  // Search suppliers using a selected product query.
  // The endpoint and payload must match your FastAPI implementation.
  searchSuppliers(query) {
    if (typeof query !== "string" || !query.trim()) {
      throw new Error("Please select a product or enter a search query.");
    }

    return request("/supplier-search", {
      method: "POST",
      body: JSON.stringify({
        query: query.trim(),
      }),
    });
  },
};




export default api;


