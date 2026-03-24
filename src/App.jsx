import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "../Pages/Home";
import Dashboard from "../Pages/Dashboard";
import Login from "../Pages/login";
import Signup from "../Pages/signup";
import TrackingPage from '../Pages/TrackingPage';
import Layout from "./Layout";
import { ToastContainer } from "react-toastify";
import ProtectedRoute from "../components/protectedRoutes";
import "react-toastify/dist/ReactToastify.css";
import { syncSOS } from "./utils/syncSOS";
import { useEffect } from "react";

function App() {
   useEffect(() => {
    const handleOnline = () => {
      console.log("Internet back. Syncing...");
      syncSOS();
    };

    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, []);
  useEffect(() => {
    syncSOS();
  },[])
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* All routes share the same Navbar via Layout */}
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/track/:alertId" element={<TrackingPage />} />
            <Route path="/dashboard" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />
            <Route path="/signup" element={<Signup />} />
          </Route>
        </Routes>
      </BrowserRouter>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      />
    </>
  );
}

export default App;