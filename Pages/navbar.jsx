import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  function handleHome() {
    navigate("/");
  }

  function handleDashboard() {
    navigate("/dashboard");
  }

  return (
    <nav className="flex justify-between items-center px-6 py-3 bg-transparent text-white shadow-md">
      <h1 className="text-xl font-bold">MyApp</h1>
      <div className="flex gap-4">
        <button
          onClick={handleHome}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
        >
          Home
        </button>
        <button
          onClick={handleDashboard}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition"
        >
          Dashboard
        </button>
      </div>
    </nav>
  );
}
