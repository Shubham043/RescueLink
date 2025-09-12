// config.js
let BACKEND_URL;

if (import.meta.env.VITE_API_ENV === "hosted") {
  BACKEND_URL = import.meta.env.VITE_HOSTED_URL;
} else {
  BACKEND_URL = import.meta.env.VITE_LOCAL_HOST;
}

export { BACKEND_URL };
