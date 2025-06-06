import { useEffect, useRef } from 'react';
import { apiPrivate } from '../api/axios';
import { useAuth } from './useAuth';
import { useLocation, useNavigate } from 'react-router';

export const useAxiosPrivate = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const { auth, refreshToken, logout, isAuthenticated } = useAuth();
	const isRefreshingRef = useRef(false);
	const failedQueueRef = useRef<
		Array<{
			resolve: (token: string) => void;
			reject: (error: any) => void;
		}>
	>([]);

	useEffect(() => {
		const requestIntercept = apiPrivate.interceptors.request.use(
			(config) => {
				// Solo agregar token si el usuario está autenticado
				if (
					isAuthenticated &&
					auth?.accessToken &&
					!config.headers['Authorization']
				) {
					config.headers['Authorization'] = `Bearer ${auth.accessToken}`;
				}
				return config;
			},
			(error) => Promise.reject(error)
		);

		const responseIntercept = apiPrivate.interceptors.response.use(
			(response) => response,
			async (error) => {
				const originalRequest = error.config;

				// Ignorar requests cancelados
				if (error.code === 'ERR_CANCELED') {
					return Promise.reject(error);
				}

				// Manejar errores 401 (token expirado)
				if (error.response?.status === 401 && !originalRequest._retry) {
					// Evitar reintentos infinitos
					if (originalRequest.url?.includes('/refresh-token')) {
						await logout();
						navigate('/signin', { replace: true });
						return Promise.reject(error);
					}

					originalRequest._retry = true;

					// Si ya se está refrescando el token, agregar a la cola
					if (isRefreshingRef.current) {
						return new Promise((resolve, reject) => {
							failedQueueRef.current.push({ resolve, reject });
						})
							.then((token) => {
								originalRequest.headers['Authorization'] = `Bearer ${token}`;
								return apiPrivate(originalRequest);
							})
							.catch((err) => {
								return Promise.reject(err);
							});
					}

					isRefreshingRef.current = true;

					try {
						const newAccessToken = await refreshToken();

						if (newAccessToken) {
							// Procesar cola de requests fallidos
							failedQueueRef.current.forEach(({ resolve }) => {
								resolve(newAccessToken);
							});
							failedQueueRef.current = [];

							// Reintentar request original
							originalRequest.headers[
								'Authorization'
							] = `Bearer ${newAccessToken}`;
							return apiPrivate(originalRequest);
						} else {
							// Token refresh falló - limpiar cola y redirigir
							failedQueueRef.current.forEach(({ reject }) => {
								reject(new Error('Token refresh failed'));
							});
							failedQueueRef.current = [];

							await logout();
							navigate('/signin', {
								replace: true,
								state: {
									from: location.pathname,
									message:
										'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
								},
							});
							return Promise.reject(error);
						}
					} catch (refreshError) {
						// Error en el refresh - limpiar cola y redirigir
						failedQueueRef.current.forEach(({ reject }) => {
							reject(refreshError);
						});
						failedQueueRef.current = [];

						await logout();
						navigate('/signin', {
							replace: true,
							state: {
								from: location.pathname,
								message:
									'Error al renovar la sesión. Por favor, inicia sesión nuevamente.',
							},
						});
						return Promise.reject(refreshError);
					} finally {
						isRefreshingRef.current = false;
					}
				}

				// Manejar otros errores de autorización
				if (error.response?.status === 403) {
					navigate('/unauthorized', {
						replace: true,
						state: { from: location.pathname },
					});
					return Promise.reject(error);
				}

				// Manejar errores de red
				if (error.code === 'ERR_NETWORK') {
					console.error('Network error in private API call:', error);
					// Podrías mostrar un toast o notification aquí
				}

				return Promise.reject(error);
			}
		);

		// Cleanup interceptors
		return () => {
			apiPrivate.interceptors.request.eject(requestIntercept);
			apiPrivate.interceptors.response.eject(responseIntercept);
		};
	}, [auth?.accessToken, refreshToken, logout, navigate, isAuthenticated]);

	// Cleanup al desmontar
	useEffect(() => {
		return () => {
			// Limpiar cola de requests pendientes
			failedQueueRef.current = [];
			isRefreshingRef.current = false;
		};
	}, []);

	return {
		api: apiPrivate,
		// Funciones de utilidad adicionales
		isRefreshing: isRefreshingRef.current,
		pendingRequests: failedQueueRef.current.length,
	};
};
