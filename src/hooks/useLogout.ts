import api from '../api/axios';
import { useAuth } from './useAuth';

export const useLogout = () => {
	const { setAuth } = useAuth();

	const logout = async () => {
		setAuth(null);
		// Limpiar marca de sesión persistente
		localStorage.removeItem('sessionStartedWithPersist');
		try {
			const response = await api.post(
				'/core/auth/logout',
				{},
				{ withCredentials: true }
			);
			if (response.status !== 201) {
				console.warn('Logout endpoint failed, but local state cleared');
			}
		} catch (error) {
			console.error(error);
		}
	};

	return { logout };
};
