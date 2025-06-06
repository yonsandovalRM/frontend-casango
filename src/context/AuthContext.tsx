import {
	createContext,
	useState,
	useEffect,
	ReactNode,
	useCallback,
} from 'react';
import api from '../api/axios';
import { Auth, AuthContextType } from '../interfaces/auth';

// Enum para estados de autenticación
export enum AuthStatus {
	LOADING = 'loading',
	AUTHENTICATED = 'authenticated',
	UNAUTHENTICATED = 'unauthenticated',
	ERROR = 'error',
}

// Interfaz extendida para mejor gestión de estado
interface ExtendedAuthContextType extends AuthContextType {
	authStatus: AuthStatus;
	error: string | null;
	clearError: () => void;
	login: (authData: Auth) => void;
	logout: () => Promise<void>;
}

export const AuthContext = createContext<ExtendedAuthContextType | null>(null);

// Constantes para localStorage
const STORAGE_KEYS = {
	PERSIST: 'persist',
	SESSION_STARTED_WITH_PERSIST: 'sessionStartedWithPersist',
} as const;

export function AuthProvider({ children }: { children: ReactNode }) {
	const [auth, setAuth] = useState<Auth | null>(null);
	const [authStatus, setAuthStatus] = useState<AuthStatus>(AuthStatus.LOADING);
	const [error, setError] = useState<string | null>(null);
	const [isInitialized, setIsInitialized] = useState(false);

	// Inicializar persist desde localStorage
	const [persist, setPersist] = useState(() => {
		try {
			const stored = localStorage.getItem(STORAGE_KEYS.PERSIST);
			return stored ? JSON.parse(stored) : false;
		} catch (error) {
			console.warn('Error parsing persist from localStorage:', error);
			return false;
		}
	});

	// Función para limpiar errores
	const clearError = useCallback(() => {
		setError(null);
	}, []);

	// Función para establecer error
	const setAuthError = useCallback((errorMessage: string) => {
		setError(errorMessage);
		setAuthStatus(AuthStatus.ERROR);
	}, []);

	// Función centralizada para refresh token con mejor manejo de errores
	const refreshToken = useCallback(async (): Promise<string | null> => {
		try {
			setAuthStatus(AuthStatus.LOADING);
			clearError();

			const response = await api.get('/core/auth/refresh-token', {
				withCredentials: true,
				timeout: 15000, // 15 segundos timeout
			});

			if (response.status === 200 && response.data?.accessToken) {
				setAuth(response.data);
				setAuthStatus(AuthStatus.AUTHENTICATED);
				return response.data.accessToken;
			}

			// Si la respuesta no tiene el formato esperado
			throw new Error('Invalid refresh token response format');
		} catch (error: any) {
			console.error('Refresh token failed:', error);

			// Limpiar estado de autenticación
			setAuth(null);
			setAuthStatus(AuthStatus.UNAUTHENTICATED);

			// Manejar diferentes tipos de errores
			if (error.code === 'ECONNABORTED') {
				setAuthError(
					'Timeout al renovar la sesión. Intenta iniciar sesión nuevamente.'
				);
			} else if (error.response?.status === 401) {
				setAuthError('Sesión expirada. Por favor, inicia sesión nuevamente.');
			} else if (error.code === 'ERR_NETWORK') {
				setAuthError('Error de conexión. Verifica tu conexión a internet.');
			} else {
				setAuthError(
					'Error al renovar la sesión. Por favor, inicia sesión nuevamente.'
				);
			}

			return null;
		}
	}, [clearError]);

	// Función para verificar la sesión
	const checkSession = useCallback(async () => {
		try {
			setAuthStatus(AuthStatus.LOADING);
			const token = await refreshToken();

			if (!token) {
				setAuthStatus(AuthStatus.UNAUTHENTICATED);
			}
		} catch (error) {
			console.error('Session check failed:', error);
			setAuthStatus(AuthStatus.UNAUTHENTICATED);
		} finally {
			setIsInitialized(true);
		}
	}, [refreshToken]);

	// Función para login
	const login = useCallback(
		(authData: Auth) => {
			setAuth(authData);
			setAuthStatus(AuthStatus.AUTHENTICATED);
			clearError();

			// Si persist está activado, marcar que la sesión se inició con persist
			if (persist) {
				localStorage.setItem(STORAGE_KEYS.SESSION_STARTED_WITH_PERSIST, 'true');
			}
		},
		[persist, clearError]
	);

	// Función para logout mejorada
	const logout = useCallback(async () => {
		try {
			setAuthStatus(AuthStatus.LOADING);

			// Limpiar estado local primero (para UX inmediato)
			setAuth(null);
			clearError();

			// Limpiar localStorage
			localStorage.removeItem(STORAGE_KEYS.SESSION_STARTED_WITH_PERSIST);

			// Intentar logout en el servidor
			try {
				await api.post(
					'/core/auth/logout',
					{},
					{
						withCredentials: true,
						timeout: 10000, // 10 segundos timeout para logout
					}
				);
			} catch (logoutError: any) {
				// Log del error pero no bloquear el logout local
				console.warn('Server logout failed:', logoutError);
			}
		} catch (error) {
			console.error('Logout error:', error);
		} finally {
			setAuthStatus(AuthStatus.UNAUTHENTICATED);
		}
	}, [clearError]);

	// Inicialización del contexto de autenticación
	useEffect(() => {
		const initializeAuth = async () => {
			if (persist) {
				console.log('Initializing auth with persist enabled');
				await checkSession();
			} else {
				console.log('Initializing auth without persist');
				setAuthStatus(AuthStatus.UNAUTHENTICATED);
				setIsInitialized(true);
			}
		};

		initializeAuth();
	}, []); // Solo se ejecuta al montar

	// Manejar cambios en persist después de la inicialización
	useEffect(() => {
		if (!isInitialized) return;

		const wasPersistedSession =
			localStorage.getItem(STORAGE_KEYS.SESSION_STARTED_WITH_PERSIST) ===
			'true';

		// Si persist se desactiva y había una sesión persistente, hacer logout
		if (!persist && auth?.user && wasPersistedSession) {
			console.log('Persist disabled on persisted session - Performing logout');
			logout();
		}

		// Actualizar localStorage
		try {
			localStorage.setItem(STORAGE_KEYS.PERSIST, JSON.stringify(persist));
		} catch (error) {
			console.warn('Failed to save persist setting:', error);
		}
	}, [persist, isInitialized, auth?.user, logout]);

	// Derivar isLoading del authStatus
	const isLoading = authStatus === AuthStatus.LOADING;

	const contextValue: ExtendedAuthContextType = {
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
	};

	return (
		<AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
	);
}
