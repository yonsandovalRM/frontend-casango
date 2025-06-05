import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '../../hooks/useAuth';

export const RequireAuth = ({ allowedRoles }: { allowedRoles?: string[] }) => {
	const { auth } = useAuth();
	const location = useLocation();

	if (!auth?.user) {
		return <Navigate to='/signin' state={{ from: location }} replace />;
	}

	if (
		allowedRoles &&
		allowedRoles.length > 0 &&
		!allowedRoles.includes(auth.user.role)
	) {
		return <Navigate to='/unauthorized' state={{ from: location }} replace />;
	}

	return <Outlet />;
};
