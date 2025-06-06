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

	// Inicializar autenticación al montar el componente
	useEffect(() => {
		if (persist) {
			console.log('Persist');
			checkSession();
		} else {
			console.log('No persist');
			setIsLoading(false);
			setIsInitialized(true);
		}
	}, [persist]);

	// Actualizar localStorage cuando cambie persist
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
