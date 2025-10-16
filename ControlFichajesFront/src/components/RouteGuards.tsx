import { Navigate } from "react-router-dom";
import { isLoggedIn, isAdmin } from "../auth";
import type { JSX } from "@emotion/react/jsx-runtime";

export function PrivateRoute({ children }: { children: JSX.Element }) {
  return isLoggedIn() ? children : <Navigate to="/login" replace />;
}

export function AdminRoute({ children }: { children: JSX.Element }) {
  if (!isLoggedIn()) return <Navigate to="/login" replace />;
  return isAdmin() ? children : <Navigate to="/" replace />;
}