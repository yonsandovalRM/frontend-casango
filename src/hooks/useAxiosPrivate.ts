import { useEffect } from 'react';
import { apiPrivate } from '../api/axios';
import { useAuth } from './useAuth';
import { useRefreshToken } from './useRefreshToken';
import { useNavigate } from 'react-router';

export const useAxiosPrivate = () => {
	const { refresh } = useRefreshToken();
	const navigate = useNavigate();
	const { auth } = useAuth();

	useEffect(() => {
		const requestIntercept = apiPrivate.interceptors.request.use(
			(config) => {
				if (!config.headers['Authorization']) {
					config.headers['Authorization'] = `Bearer ${auth?.accessToken}`;
				}
				return config;
			},
			(error) => Promise.reject(error)
		);

		const responseIntercept = apiPrivate.interceptors.response.use(
			(response) => response,
			async (error) => {
				const originalRequest = error.config;
				if (error.response.status === 401 && !originalRequest._retry) {
					originalRequest._retry = true;
					const newAccessToken = await refresh();
					if (!newAccessToken) {
						navigate('/signin', { replace: true });
						return Promise.reject(error);
					}
					originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
					return apiPrivate(originalRequest);
				}
				return Promise.reject(error);
			}
		);

		return () => {
			apiPrivate.interceptors.request.eject(requestIntercept);
			apiPrivate.interceptors.response.eject(responseIntercept);
		};
	}, [auth, refresh]);

	return { api: apiPrivate };
};
