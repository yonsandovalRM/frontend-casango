import { createContext, useState, useEffect, ReactNode } from 'react';
import api from '../api/axios';

interface User {
	id: string;
	email: string;
	role: string;
	createdAt: string;
	updatedAt: string;
}

interface Auth {
	user: User | null;
	accessToken: string | null;
}

interface AuthContextType {
	auth: Auth | null;
	setAuth: (auth: Auth | null) => void;
	persist: boolean;
	setPersist: (persist: boolean) => void;
	isLoading: boolean;
	isInitialized: boolean;
	refreshToken: () => Promise<string | null>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [auth, setAuth] = useState<Auth | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isInitialized, setIsInitialized] = useState(false);

	const [persist, setPersist] = useState(() => {
		try {
			return JSON.parse(localStorage.getItem('persist') || 'false');
		} catch {
			return false;
		}
	});

	// Función centralizada para refresh token
	const refreshToken = async (): Promise<string | null> => {
		try {
			const response = await api.get('/core/auth/refresh-token', {
				withCredentials: true,
			});

			if (response.status === 200) {
				setAuth(response.data);
				return response.data.accessToken;
			}

			setAuth(null);
			return null;
		} catch (error) {
			console.error('Refresh token failed:', error);
			setAuth(null);
			return null;
		}
	};

	// Función para verificar la sesión (usa refreshToken)
	const checkSession = async () => {
		try {
			setIsLoading(true);
			await refreshToken();
		} finally {
			setIsLoading(false);
			setIsInitialized(true);
		}
	};

	// Función para hacer logout limpio
	const performLogout = async () => {
		setAuth(null);
		try {
			await api.post('/core/auth/logout', {}, { withCredentials: true });
		} catch (error) {
			console.error('Logout error:', error);
		}
	};

	// Inicializar autenticación al montar el componente (solo una vez)
	useEffect(() => {
		if (persist) {
			console.log('Initial check - Persist enabled');
			checkSession();
		} else {
			console.log('Initial check - No persist');
			setIsLoading(false);
			setIsInitialized(true);
		}
	}, []); // ← Solo se ejecuta al montar, no cuando persist cambia

	// Manejar cambios en persist después de la inicialización
	useEffect(() => {
		// Solo actuar si ya está inicializado (evita ejecutarse en el primer render)
		if (!isInitialized) return;

		// Si persist cambia a false y hay una sesión activa, hacer logout
		if (!persist && auth?.user) {
			console.log('Persist disabled - Performing logout');
			performLogout();
		}

		// Si persist cambia a true, NO restaurar automáticamente la sesión
		// El usuario debe iniciar sesión manualmente

		// Actualizar localStorage
		localStorage.setItem('persist', JSON.stringify(persist));
	}, [persist, isInitialized, auth?.user]);

	// Efecto separado para actualizar localStorage (mantener compatibilidad)
	useEffect(() => {
		localStorage.setItem('persist', JSON.stringify(persist));
	}, [persist]);

	return (
		<AuthContext.Provider
			value={{
				auth,
				setAuth,
				persist,
				setPersist,
				isLoading,
				isInitialized,
				refreshToken,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}
