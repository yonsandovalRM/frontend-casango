import api from '../api/axios';
import { useAuth } from './useAuth';

export const useLogout = () => {
	const { setAuth } = useAuth();

	const logout = async () => {
		setAuth({ user: null, accessToken: null });
		try {
			await api.post('/core/auth/logout', {}, { withCredentials: true });
		} catch (error) {
			console.error(error);
		}
	};

	return { logout };
};
