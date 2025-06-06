import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '../../hooks/useAuth';
import { AuthStatus } from '../../context/AuthContext';

interface RedirectIfAuthenticatedProps {
	redirectTo?: string;
}

// Componente de loading
const LoadingSpinner = () => (
	<div className='flex flex-col items-center justify-center min-h-screen bg-gray-50'>
		<div className='animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mb-4'></div>
		<p className='text-gray-600 text-sm'>Verificando estado de sesión...</p>
	</div>
);

export const RedirectIfAuthenticated = ({
	redirectTo = '/dashboard',
}: RedirectIfAuthenticatedProps) => {
	const { authStatus, isAuthenticated, isInitialized } = useAuth();
	const location = useLocation();

	// Mostrar loading mientras se inicializa la autenticación
	if (!isInitialized || authStatus === AuthStatus.LOADING) {
		return <LoadingSpinner />;
	}

	// Si el usuario está autenticado, redirigir
	if (isAuthenticated) {
		// Obtener la ruta de destino desde el state o usar la por defecto
		const destination = location.state?.from?.pathname || redirectTo;

		return (
			<Navigate
				to={destination}
				replace
				state={{
					message: 'Ya tienes una sesión activa.',
				}}
			/>
		);
	}

	// Si no está autenticado, mostrar las páginas de auth (signin/signup)
	return <Outlet />;
};
