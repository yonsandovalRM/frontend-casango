import { createContext, useState } from 'react';

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
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [auth, setAuth] = useState<Auth | null>(null);

	return (
		<AuthContext.Provider value={{ auth, setAuth }}>
			{children}
		</AuthContext.Provider>
	);
}
