import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '../../hooks/useAuth';

export const RedirectIfAuthenticated = () => {
	const { auth } = useAuth();
	const location = useLocation();

	if (auth?.user) {
		return (
			<Navigate to={location.state?.from?.pathname || '/dashboard'} replace />
		);
	}

	return <Outlet />;
};
