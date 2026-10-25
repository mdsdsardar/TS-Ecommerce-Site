import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { useEffect } from "react";
import Loader from "../layout/Loader";
import type { RootState } from "../../store/store";

interface ProtectedRouteProps {
  isAdmin?: boolean;
}

const ProtectedRoute = ({ isAdmin = false }: ProtectedRouteProps) => {
  const { isAuthenticated, loading, userLoaded, user } = useSelector(
    (state: RootState) => state.auth,
  );

  useEffect(() => {
    if (userLoaded && !isAuthenticated) {
      toast.error("Login first to access this resource.");
    } else if (
      userLoaded &&
      isAuthenticated &&
      isAdmin &&
      user?.role !== "admin"
    ) {
      toast.error("Access denied. Admin privileges required.");
    }
  }, [userLoaded, isAuthenticated, isAdmin, user]);

  if (!userLoaded || loading) {
    return <Loader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (isAdmin && user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;

// if (!userLoaded || loading) {
//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50">
//       <div className="text-center">
//         <Loader />
//         <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//         <p className="mt-4 text-gray-600">Checking authentication...</p>
//       </div>
//     </div>
//   );
// }
