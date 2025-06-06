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
	persist: boolean;
	setPersist: (persist: boolean) => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [auth, setAuth] = useState<Auth | null>(null);

	const [persist, setPersist] = useState(
		JSON.parse(localStorage.getItem('persist') || 'false')
	);
	return (
		<AuthContext.Provider value={{ auth, setAuth, persist, setPersist }}>
			{children}
		</AuthContext.Provider>
	);
}
