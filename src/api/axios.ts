import axios, { AxiosError } from 'axios';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL;

const axiosInstance = axios.create({
	baseURL: API_URL,
	headers: {
		'Content-Type': 'application/json',
	},
});

export const apiPrivate = axios.create({
	baseURL: API_URL,
	headers: {
		'Content-Type': 'application/json',
	},
});

const handleNetworkError = (error: AxiosError) => {
	if (error.code === 'ERR_NETWORK') {
		console.error('Error de conexión: No se pudo conectar con el servidor');
	}
	if (error.response?.status === 403) {
		toast.error('No tienes permisos para esta acción');
	}
	return Promise.reject(error);
};

axiosInstance.interceptors.response.use(
	(response) => response,
	handleNetworkError
);

apiPrivate.interceptors.response.use(
	(response) => response,
	handleNetworkError
);

export default axiosInstance;
