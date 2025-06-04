import { createContext, useState } from 'react';
import api from '../api/axios';

interface AuthContextType {
	user: any;
	isAuthenticated: boolean;
	login: (credentials: { email: string; password: string }) => Promise<any>;
	logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
	user: null,
	isAuthenticated: false,
	login: async () => {},
	logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState(null);
	const [isAuthenticated, setIsAuthenticated] = useState(false);

	const login = async (credentials: { email: string; password: string }) => {
		try {
			const response = await api.post('/core/auth/login', credentials, {
				withCredentials: true,
			});
			setUser(response.data.user);
			setIsAuthenticated(true);
			return response;
		} catch (error) {
			console.log(error);
			throw error;
		}
	};

	const logout = () => {
		setUser(null);
		setIsAuthenticated(false);
	};

	return (
		<AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
}
