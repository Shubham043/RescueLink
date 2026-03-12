import { Navigate } from 'react-router-dom';

/*
  WHY ProtectedRoute?
  - Right now anyone can go to /dashboard without logging in
  - This component checks for token before rendering the page
  - If no token → redirect to /login automatically
  - Same concept as auth middleware on the backend
    backend  → protect middleware checks JWT
    frontend → ProtectedRoute checks localStorage token
*/

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');

  if (!token) {
    // WHY Navigate and not window.location.href?
    // Navigate is React Router's way — no full page reload
    // window.location.href reloads entire app — loses React state
    return <Navigate to="/login" replace />;
    // WHY replace?
    // Without it, user can press browser back button to get back to dashboard
    // replace removes /dashboard from history — back button goes to home instead
  }

  return children;
}