import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '../../hooks/useAuth';
import { AuthStatus } from '../../context/AuthContext';

interface RequireAuthProps {
	allowedRoles?: string[];
	fallbackPath?: string;
}

// Componente de loading mejorado
const AuthLoadingSpinner = () => (
	<div className='flex flex-col items-center justify-center min-h-screen bg-gray-50'>
		<div className='animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mb-4'></div>
		<p className='text-gray-600 text-sm'>Verificando autenticación...</p>
	</div>
);

// Componente de error mejorado
const AuthErrorDisplay = ({
	error,
	onRetry,
}: {
	error: string;
	onRetry: () => void;
}) => (
	<div className='flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4'>
		<div className='bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center'>
			<div className='text-red-500 mb-4'>
				<svg
					className='mx-auto h-12 w-12'
					fill='none'
					stroke='currentColor'
					viewBox='0 0 24 24'
				>
					<path
						strokeLinecap='round'
						strokeLinejoin='round'
						strokeWidth={2}
						d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z'
					/>
				</svg>
			</div>
			<h3 className='text-lg font-semibold text-gray-900 mb-2'>
				Error de Autenticación
			</h3>
			<p className='text-gray-600 mb-6'>{error}</p>
			<button
				onClick={onRetry}
				className='bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors duration-200'
			>
				Reintentar
			</button>
		</div>
	</div>
);

export const RequireAuth = ({
	allowedRoles,
	fallbackPath = '/signin',
}: RequireAuthProps) => {
	const {
		authStatus,
		isAuthenticated,
		isInitialized,
		hasAnyRole,
		error,
		clearError,
		user,
	} = useAuth();
	const location = useLocation();

	// Mostrar loading mientras se inicializa o está cargando
	if (!isInitialized || authStatus === AuthStatus.LOADING) {
		return <AuthLoadingSpinner />;
	}

	// Mostrar error si hay un error de autenticación
	if (authStatus === AuthStatus.ERROR && error) {
		return <AuthErrorDisplay error={error} onRetry={clearError} />;
	}

	// Si no hay usuario autenticado, redirigir a signin
	if (!isAuthenticated || !user) {
		return (
			<Navigate
				to={fallbackPath}
				state={{
					from: location,
					message: 'Debes iniciar sesión para acceder a esta página.',
				}}
				replace
			/>
		);
	}

	// Verificar roles si están especificados
	if (allowedRoles && allowedRoles.length > 0) {
		if (!hasAnyRole(allowedRoles)) {
			return (
				<Navigate
					to='/unauthorized'
					state={{
						from: location,
						requiredRoles: allowedRoles,
						currentRole: user.role,
					}}
					replace
				/>
			);
		}
	}

	// Si todo está bien, renderizar el contenido protegido
	return <Outlet />;
};

// Componente de utilidad para rutas que requieren roles específicos
export const RequireRole = ({
	role,
	children,
	fallback,
}: {
	role: string;
	children: React.ReactNode;
	fallback?: React.ReactNode;
}) => {
	const { hasRole } = useAuth();

	if (!hasRole(role)) {
		return fallback || null;
	}

	return <>{children}</>;
};

// Componente de utilidad para rutas que requieren cualquiera de varios roles
export const RequireAnyRole = ({
	roles,
	children,
	fallback,
}: {
	roles: string[];
	children: React.ReactNode;
	fallback?: React.ReactNode;
}) => {
	const { hasAnyRole } = useAuth();

	if (!hasAnyRole(roles)) {
		return fallback || null;
	}

	return <>{children}</>;
};
