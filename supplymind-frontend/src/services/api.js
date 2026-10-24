const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000"
).replace(/\/$/, "");

async function request(path, options = {}) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
  } catch {
    throw new Error(
      "Cannot connect to SupplyMind API. Check that FastAPI is running."
    );
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const detail = data.detail;
    const message = Array.isArray(detail)
      ? detail.map((item) => item.msg).join(", ")
      : detail || "Something went wrong.";

    throw new Error(message);
  }

  return data;
}

export const api = {
  startSession(payload) {
    return request("/sessions/start", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  

  submitAnswer(payload) {
    return request("/sessions/answer", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  saveLocation(sessionId, location) {
    return request(
      `/sessions/${encodeURIComponent(sessionId)}/location`,
      {
        method: "POST",
        body: JSON.stringify(location),
      }
    );
  },

  getSpecification(sessionId) {
    return request(
      `/sessions/${encodeURIComponent(sessionId)}/search-specification`
    );
  },

  health() {
    return request("/health");
  },
};