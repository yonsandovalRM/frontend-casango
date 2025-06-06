import { useContext } from 'react';
import { AuthContext, AuthStatus } from '../context/AuthContext';

export const useAuth = () => {
	const context = useContext(AuthContext);

	if (!context) {
		throw new Error('useAuth must be used within an AuthProvider');
	}

	const {
		auth,
		setAuth,
		persist,
		setPersist,
		isLoading,
		isInitialized,
		refreshToken,
		authStatus,
		error,
		clearError,
		login,
		logout,
	} = context;

	// Funciones de utilidad derivadas
	const isAuthenticated =
		authStatus === AuthStatus.AUTHENTICATED && !!auth?.user;
	const isUnauthenticated = authStatus === AuthStatus.UNAUTHENTICATED;
	const hasError = authStatus === AuthStatus.ERROR && !!error;
	const isReady = isInitialized && !isLoading;

	// Función para obtener el rol del usuario
	const getUserRole = () => auth?.user?.role || null;

	// Función para verificar si el usuario tiene un rol específico
	const hasRole = (role: string) => getUserRole() === role;

	// Función para verificar si el usuario tiene alguno de los roles permitidos
	const hasAnyRole = (roles: string[]) => {
		const userRole = getUserRole();
		return userRole ? roles.includes(userRole) : false;
	};

	return {
		// Estado básico
		auth,
		setAuth,
		persist,
		setPersist,
		isLoading,
		isInitialized,

		// Estado extendido
		authStatus,
		error,

		// Estados derivados
		isAuthenticated,
		isUnauthenticated,
		hasError,
		isReady,

		// Funciones
		refreshToken,
		clearError,
		login,
		logout,

		// Utilidades de roles
		getUserRole,
		hasRole,
		hasAnyRole,

		// Información del usuario
		user: auth?.user || null,
		accessToken: auth?.accessToken || null,
	};
};
