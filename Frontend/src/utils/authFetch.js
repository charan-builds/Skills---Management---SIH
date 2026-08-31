export const fetchAuth = async (url, options = {}) => {
  const token = localStorage.getItem("sih_token");
  const headers = {
    "ngrok-skip-browser-warning": "true",
    ...options.headers,
    ...(token ? { "Authorization": `Bearer ${token}` } : {})
  };
  
  const response = await fetch(url, { ...options, headers });
  
  // Cleanly handle stale/invalid tokens across the entire application
  if (response.status === 401) {
    localStorage.removeItem("sih_token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("traineeId");
    localStorage.removeItem("traineeEmail");
    localStorage.removeItem("organizationId");
    localStorage.removeItem("organizationName");
    localStorage.removeItem("employerEmail");
    window.location.href = "/";
  }
  
  return response;
};
