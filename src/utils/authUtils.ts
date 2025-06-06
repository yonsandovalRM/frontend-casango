import { Auth, User, UserRole } from '../interfaces/auth';

// Utilidades para validación de tokens
export const isTokenExpired = (token: string): boolean => {
	try {
		const payload = JSON.parse(atob(token.split('.')[1]));
		const currentTime = Date.now() / 1000;
		return payload.exp < currentTime;
	} catch (error) {
		console.error('Error parsing token:', error);
		return true;
	}
};

export const getTokenExpirationTime = (token: string): number | null => {
	try {
		const payload = JSON.parse(atob(token.split('.')[1]));
		return payload.exp * 1000; // Convert to milliseconds
	} catch (error) {
		console.error('Error parsing token:', error);
		return null;
	}
};

// Utilidades para manejo de roles
export const hasRole = (user: User, role: UserRole): boolean => {
	return user.role === role;
};

export const hasAnyRole = (user: User, roles: UserRole[]): boolean => {
	return roles.includes(user.role as UserRole);
};

export const isAdmin = (user: User): boolean => {
	return hasRole(user, UserRole.ADMIN);
};

export const isProfessional = (user: User): boolean => {
	return hasRole(user, UserRole.PROFESSIONAL);
};

export const canAccessAdminPanel = (user: User): boolean => {
	return isAdmin(user);
};

export const canAccessProfessionalFeatures = (user: User): boolean => {
	return hasAnyRole(user, [UserRole.ADMIN, UserRole.PROFESSIONAL]);
};

// Utilidades para localStorage
export const clearAuthStorage = (): void => {
	try {
		localStorage.removeItem('persist');
		localStorage.removeItem('sessionStartedWithPersist');
		sessionStorage.clear();
	} catch (error) {
		console.error('Error clearing auth storage:', error);
	}
};

export const getStoredPersistSetting = (): boolean => {
	try {
		const stored = localStorage.getItem('persist');
		return stored ? JSON.parse(stored) : false;
	} catch (error) {
		console.warn('Error reading persist setting:', error);
		return false;
	}
};

// Utilidades para validación de datos de autenticación
export const validateAuthData = (auth: Auth): boolean => {
	if (!auth || !auth.user || !auth.accessToken) {
		return false;
	}

	const { user, accessToken } = auth;

	// Validar estructura del usuario
	if (!user.id || !user.email || !user.role) {
		return false;
	}

	// Validar que el token no esté expirado
	if (isTokenExpired(accessToken)) {
		return false;
	}

	return true;
};

// Utilidades para manejo de errores de autenticación
export const getAuthErrorMessage = (error: any): string => {
	if (error?.response?.data?.message) {
		return error.response.data.message;
	}

	if (error?.message) {
		return error.message;
	}

	switch (error?.response?.status) {
		case 401:
			return 'Credenciales inválidas o sesión expirada';
		case 403:
			return 'No tienes permisos para realizar esta acción';
		case 404:
			return 'Recurso no encontrado';
		case 429:
			return 'Demasiados intentos. Intenta nuevamente más tarde';
		case 500:
			return 'Error interno del servidor';
		default:
			return 'Ha ocurrido un error inesperado';
	}
};

// Utilidades para formateo de datos de usuario
export const formatUserDisplayName = (user: User): string => {
	return user.name || user.email || 'Usuario';
};

export const getRoleDisplayName = (role: string): string => {
	switch (role) {
		case UserRole.ADMIN:
			return 'Administrador';
		case UserRole.PROFESSIONAL:
			return 'Profesional';
		case UserRole.USER:
			return 'Usuario';
		default:
			return 'Rol desconocido';
	}
};

// Utilidad para generar headers de autorización
export const getAuthHeaders = (token: string) => ({
	Authorization: `Bearer ${token}`,
	'Content-Type': 'application/json',
});

// Utilidad para debugging (solo en desarrollo)
export const debugAuthState = (auth: Auth | null, context: string = '') => {
	if (import.meta.env.NODE_ENV === 'development') {
		console.group(`🔒 Auth Debug - ${context}`);
		console.log('Auth state:', auth);
		console.log('User:', auth?.user);
		console.log('Token present:', !!auth?.accessToken);
		console.log(
			'Token expired:',
			auth?.accessToken ? isTokenExpired(auth.accessToken) : 'N/A'
		);
		console.groupEnd();
	}
};

// Utilidad para tiempo de expiración legible
export const getTokenTimeRemaining = (token: string): string => {
	const expirationTime = getTokenExpirationTime(token);
	if (!expirationTime) return 'Desconocido';

	const now = Date.now();
	const timeLeft = expirationTime - now;

	if (timeLeft <= 0) return 'Expirado';

	const minutes = Math.floor(timeLeft / (1000 * 60));
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);

	if (days > 0) return `${days} días`;
	if (hours > 0) return `${hours} horas`;
	return `${minutes} minutos`;
};
