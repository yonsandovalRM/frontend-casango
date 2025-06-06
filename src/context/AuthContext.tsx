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

	// Función para verificar la sesión
	const checkSession = async () => {
		try {
			const response = await api.get('/core/auth/refresh-token', {
				withCredentials: true,
			});
			if (response.status === 200) {
				setAuth(response.data);
			} else {
				setAuth(null);
			}
		} catch (error) {
			console.error('Session check failed:', error);
			setAuth(null);
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
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}
