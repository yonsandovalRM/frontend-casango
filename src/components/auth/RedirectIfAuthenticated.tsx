import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '../../hooks/useAuth';

export const RedirectIfAuthenticated = () => {
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

	// Si el usuario está autenticado, redirigir a la ruta de origen o dashboard
	if (auth?.user) {
		const redirectTo = location.state?.from?.pathname || '/dashboard';
		return <Navigate to={redirectTo} replace />;
	}

	return <Outlet />;
};
