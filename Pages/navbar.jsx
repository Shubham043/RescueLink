import { useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const user = (() => {
    try { return JSON.parse(localStorage.getItem("user")); } 
    catch { return null; }
  })();

  const isLoggedIn = !!localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="w-full flex justify-between items-center px-6 py-3 bg-slate-900/90 backdrop-blur border-b border-white/10 text-white shadow-lg z-50">
      {/* Brand */}
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 group"
      >
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow shadow-blue-600/40 group-hover:bg-blue-500 transition-colors">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <span className="font-bold text-lg tracking-tight">RescueLink</span>
      </button>

      {/* Nav Links + Auth */}
      <div className="flex items-center gap-2">
        {/* Home — always visible */}
        <button
          onClick={() => navigate("/")}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            isActive("/")
              ? "bg-white/15 text-white"
              : "text-white/60 hover:text-white hover:bg-white/10"
          }`}
        >
          Home
        </button>

        {/* Dashboard — only if logged in */}
        {isLoggedIn && (
          <button
            onClick={() => navigate("/dashboard")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              isActive("/dashboard")
                ? "bg-white/15 text-white"
                : "text-white/60 hover:text-white hover:bg-white/10"
            }`}
          >
            Dashboard
          </button>
        )}

        <div className="w-px h-5 bg-white/15 mx-1" />

        {isLoggedIn ? (
          /* Logged in state */
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/8 rounded-lg border border-white/10">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                {user?.username?.[0]?.toUpperCase() || "R"}
              </div>
              <span className="text-sm text-white/80 font-medium max-w-[100px] truncate">
                {user?.username || "Rescuer"}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 hover:text-red-300 rounded-lg text-sm font-medium transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        ) : (
          /* Logged out state */
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/login")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                isActive("/login")
                  ? "bg-white/15 text-white"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition-all shadow shadow-blue-600/30"
            >
              Sign Up
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}