export const fetchAuth = async (url, options = {}) => {
  const token = localStorage.getItem("sih_token");
  const headers = {
    "ngrok-skip-browser-warning": "true",
    ...options.headers,
    ...(token ? { "Authorization": `Bearer ${token}` } : {})
  };

  let response;
  try {
    response = await fetch(url, { ...options, headers });
  } catch (err) {
    // Automatic fallback between port 8001 and 8000 for local dev resilience
    if (typeof url === "string") {
      let alternateUrl = null;
      if (url.includes("localhost:8001")) alternateUrl = url.replace("localhost:8001", "localhost:8000");
      else if (url.includes("127.0.0.1:8001")) alternateUrl = url.replace("127.0.0.1:8001", "127.0.0.1:8000");
      else if (url.includes("localhost:8000")) alternateUrl = url.replace("localhost:8000", "localhost:8001");
      else if (url.includes("127.0.0.1:8000")) alternateUrl = url.replace("127.0.0.1:8000", "127.0.0.1:8001");

      if (alternateUrl) {
        try {
          response = await fetch(alternateUrl, { ...options, headers });
        } catch (_) {
          throw err;
        }
      } else {
        throw err;
      }
    } else {
      throw err;
    }
  }

  // Cleanly handle stale/invalid tokens across the entire application
  if (response.status === 401) {
    localStorage.removeItem("sih_token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("traineeId");
    localStorage.removeItem("traineeEmail");
    localStorage.removeItem("organizationId");
    localStorage.removeItem("organizationName");
    localStorage.removeItem("employerEmail");
    window.location.href = "/login";
  }

  return response;
};
