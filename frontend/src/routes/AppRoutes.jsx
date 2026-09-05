import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/auth/Login";
import AuthLayout from "../layouts/AuthLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import ProtectedRoute from "./ProtectedRoute";
import Materials from "../pages/Materials";
import Machines from "../pages/Machines";
import Dashboard from "../pages/Dashboard";
import Transactions from "../pages/Transactions";
import Employees from "../pages/Employees";
import StockHistory from "../pages/StockHistory";
import ChangePassword from "../pages/ChangePassword";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
        </Route>

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/materials" element={<Materials />} />
            <Route path="/machines" element={<Machines />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/stock-history" element={<StockHistory />} />
            <Route path="/change-password" element={<ChangePassword />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
