import Navbar from '../Pages/navbar';
import { Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 overflow-y-auto min-h-0">
        <Outlet />
      </div>
    </div>
  );
}