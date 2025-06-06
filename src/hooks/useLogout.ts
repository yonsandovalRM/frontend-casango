import { useAuth } from './useAuth';
import { useNavigate } from 'react-router';

export const useLogout = () => {
	const { logout: contextLogout } = useAuth();
	const navigate = useNavigate();

	const logout = async (redirectTo: string = '/signin', message?: string) => {
		try {
			await contextLogout();

			// Navegar a la página especificada
			navigate(redirectTo, {
				replace: true,
				state: {
					message: message || 'Has cerrado sesión exitosamente.',
				},
			});
		} catch (error) {
			console.error('Error during logout:', error);
			// Aún así navegar, ya que el estado local se limpió
			navigate(redirectTo, {
				replace: true,
				state: {
					message: 'Sesión cerrada (con errores en el servidor).',
				},
			});
		}
	};

	return { logout };
};
