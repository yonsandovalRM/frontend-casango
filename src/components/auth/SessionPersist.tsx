import { useEffect, useState } from 'react';
import { Outlet } from 'react-router';
import { useRefreshToken } from '../../hooks/useRefreshToken';
import { useAuth } from '../../hooks/useAuth';

export const SessionPersist = () => {
	const [isLoading, setIsLoading] = useState(true);
	const { refresh } = useRefreshToken();
	const { auth } = useAuth();

	useEffect(() => {
		const checkSession = async () => {
			try {
				await refresh();
				setIsLoading(false);
			} catch (error) {
				console.error(error);
			} finally {
				setIsLoading(false);
			}
		};
		!auth?.accessToken ? checkSession() : setIsLoading(false);
	}, [auth]);

	return isLoading ? <div>Loading...</div> : <Outlet />;
};
