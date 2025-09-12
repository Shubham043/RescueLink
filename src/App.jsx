import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "../Pages/Home";
import Dashboard from "../Pages/Dashboard"; 
import Signup from "../Pages/signup";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
         <Route path="/signup" element={<Signup/>} />

        </Routes>
      </BrowserRouter>

      {/* ToastContainer added once globally */}
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
