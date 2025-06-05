import api from '../api/axios';
import { useAuth } from './useAuth';

export const useRefreshToken = () => {
	const { setAuth } = useAuth();
	const refresh = async () => {
		try {
			const response = await api.get('/core/auth/refresh-token', {
				withCredentials: true,
			});
			setAuth(response.data);
			return response.data.accessToken;
		} catch (error) {
			console.log(error);
			return null;
		}
	};

	return refresh;
};
