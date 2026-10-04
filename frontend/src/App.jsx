import { BrowserRouter, Link, Navigate, Route, Routes } from "react-router-dom";

// Public pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";

// Citizen pages
import Dashboard from "./pages/Dashboard";
import ReportIssue from "./pages/ReportIssue";
import MyComplaints from "./pages/MyComplaints";
import ComplaintDetails from "./pages/ComplaintDetails";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Help from "./pages/Help";

// Admin pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProfile from "./pages/admin/AdminProfile";
import AdminComplaints from "./pages/admin/AdminComplaints";
import AdminComplaintDetails from "./pages/admin/AdminComplaintDetails";
import AdminReports from "./pages/admin/AdminReports";
import AdminCategories from "./pages/admin/AdminCategories";

import AuthProvider from "./context/AuthProvider";
import useAuth from "./hooks/useAuth";
import Loader from "./components/Loader";
import ProtectedRoute from "./components/ProtectedRoute";
import EmptyState from "./components/EmptyState";

const citizen = (element) => <ProtectedRoute>{element}</ProtectedRoute>;
const admin = (element) => <ProtectedRoute adminOnly>{element}</ProtectedRoute>;

// "/" is the public Home page for logged-out visitors only.
function HomeRoute() {
  const { user, admin, loading } = useAuth();

  if (loading) return <Loader label="Checking your session…" />;
  if (admin) return <Navigate to="/admin" replace />;
  if (user) return <Navigate to="/dashboard" replace />;

  return <Home />;
}

function NotFound() {
  return (
    <div className="not-found-page">
      <EmptyState
        type="notfound"
        title="Page not found"
        message="The page you are looking for does not exist."
        action={<Link to="/" className="primary-button">Go back to Home</Link>}
      />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/" element={<HomeRoute />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Citizen (protected) */}
          <Route path="/dashboard" element={citizen(<Dashboard />)} />
          <Route path="/report-issue" element={citizen(<ReportIssue />)} />
          <Route path="/my-complaints" element={citizen(<MyComplaints />)} />
          <Route path="/complaints/:id" element={citizen(<ComplaintDetails />)} />
          <Route path="/profile" element={citizen(<Profile />)} />
          <Route path="/settings" element={citizen(<Settings />)} />
          <Route path="/help" element={citizen(<Help />)} />

          {/* Admin (protected) */}
          <Route path="/admin" element={admin(<AdminDashboard />)} />
          <Route path="/admin/complaints" element={admin(<AdminComplaints />)} />
          <Route path="/admin/complaints/:id" element={admin(<AdminComplaintDetails />)} />
          <Route path="/admin/reports" element={admin(<AdminReports />)} />
          <Route path="/admin/categories" element={admin(<AdminCategories />)} />
          <Route path="/admin/profile" element={admin(<AdminProfile />)} />
          <Route path="/admin/settings" element={admin(<Settings area="admin" />)} />
          <Route path="/admin/help" element={admin(<Help area="admin" />)} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
