// Interfaces básicas de autenticación
export interface User {
	id: string;
	email: string;
	name: string;
	role: string;
	avatar?: string;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface Auth {
	user: User;
	accessToken: string;
	tokenType?: string;
	expiresIn?: number;
}

// Interface del contexto de autenticación (original)
export interface AuthContextType {
	auth: Auth | null;
	setAuth: (auth: Auth | null) => void;
	persist: boolean;
	setPersist: (persist: boolean) => void;
	isLoading: boolean;
	isInitialized: boolean;
	refreshToken: () => Promise<string | null>;
}

// Enum para roles de usuario
export enum UserRole {
	ADMIN = 'admin',
	USER = 'user',
	PROFESSIONAL = 'professional',
}

// Interface para errores de autenticación
export interface AuthError {
	code: string;
	message: string;
	details?: any;
}

// Tipos para el estado de autenticación
export type AuthState =
	| 'loading'
	| 'authenticated'
	| 'unauthenticated'
	| 'error';

// Interface para respuestas de la API de autenticación
export interface LoginResponse {
	success: boolean;
	data?: Auth;
	message?: string;
	error?: AuthError;
}

export interface RefreshTokenResponse {
	success: boolean;
	data?: Auth;
	message?: string;
	error?: AuthError;
}

// Interface para credenciales de login
export interface LoginCredentials {
	email: string;
	password: string;
	remember?: boolean;
}

// Interface para datos de registro
export interface SignUpData {
	name: string;
	email: string;
	password: string;
	confirmPassword: string;
	role?: string;
}

// Interface para el estado de la location con información de auth
export interface AuthLocationState {
	from?: Location;
	message?: string;
	requiredRoles?: string[];
	currentRole?: string;
}
