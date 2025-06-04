import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '../../hooks/useAuth';

export const RequireAuth = ({ allowedRoles }: { allowedRoles?: string[] }) => {
	const { isAuthenticated, user } = useAuth();
	const location = useLocation();

	if (!isAuthenticated) {
		return <Navigate to='/signin' state={{ from: location }} replace />;
	}

	if (
		allowedRoles &&
		allowedRoles.length > 0 &&
		!allowedRoles.includes(user.role)
	) {
		return <Navigate to='/unauthorized' state={{ from: location }} replace />;
	}

	return <Outlet />;
};
