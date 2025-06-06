import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '../../hooks/useAuth';

export const RequireAuth = ({ allowedRoles }: { allowedRoles?: string[] }) => {
	const { auth, isLoading, isInitialized } = useAuth();
	const location = useLocation();

	// Mostrar loading mientras se inicializa la autenticación
	if (!isInitialized || isLoading) {
		return (
			<div className='flex items-center justify-center min-h-screen'>
				<div className='animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900'></div>
			</div>
		);
	}

	// Si no hay usuario autenticado, redirigir a signin
	if (!auth?.user) {
		return <Navigate to='/signin' state={{ from: location }} replace />;
	}

	// Si hay roles permitidos y el usuario no tiene el rol correcto
	if (
		allowedRoles &&
		allowedRoles.length > 0 &&
		!allowedRoles.includes(auth.user.role)
	) {
		return <Navigate to='/unauthorized' state={{ from: location }} replace />;
	}

	return <Outlet />;
};
