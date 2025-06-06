import { toast } from 'react-toastify';
import { useTheme } from '../context/ThemeContext';

export const useNotify = () => {
	const { theme } = useTheme();
	const notify = (
		message: string,
		type: 'success' | 'error' | 'warning' | 'info'
	) => {
		toast[type](message, {
			theme: theme === 'dark' ? 'dark' : 'light',
		});
	};

	return { notify };
};
