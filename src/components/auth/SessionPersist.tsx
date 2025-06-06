import { useEffect, useState } from 'react';
import { Outlet } from 'react-router';
import { useRefreshToken } from '../../hooks/useRefreshToken';
import { useAuth } from '../../hooks/useAuth';

export const SessionPersist = () => {
	const [isLoading, setIsLoading] = useState(true);
	const { refresh } = useRefreshToken();
	const { auth, persist } = useAuth();

	useEffect(() => {
		let isMounted = true;
		const checkSession = async () => {
			try {
				await refresh();
				setIsLoading(false);
			} catch (error) {
				console.error(error);
			} finally {
				isMounted && setIsLoading(false);
			}
		};
		!auth?.accessToken ? checkSession() : setIsLoading(false);

		return () => {
			isMounted = false;
		};
	}, [auth]);

	return !persist ? <Outlet /> : isLoading ? <div>Loading...</div> : <Outlet />;
};
