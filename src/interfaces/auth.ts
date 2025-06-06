export interface User {
	id: string;
	email: string;
	role: string;
	createdAt: string;
	updatedAt: string;
}

export interface Auth {
	user: User | null;
	accessToken: string | null;
}

export interface AuthContextType {
	auth: Auth | null;
	setAuth: (auth: Auth | null) => void;
	persist: boolean;
	setPersist: (persist: boolean) => void;
	isLoading: boolean;
	isInitialized: boolean;
	refreshToken: () => Promise<string | null>;
}
