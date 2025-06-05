import { useEffect, useState } from 'react';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import { useAxiosPrivate } from '../../hooks/useAxiosPrivate';

interface User {
	id: string;
	name: string;
	email: string;
	role: string;
}

export const Users = () => {
	const [users, setUsers] = useState<User[]>([]);
	const { api } = useAxiosPrivate();

	useEffect(() => {
		let isMounted = true;
		const controller = new AbortController();

		const fetchUsers = async () => {
			try {
				const response = await api.get('/core/tenants', {
					signal: controller.signal,
				});
				isMounted && setUsers(response.data);
			} catch (error) {
				console.log(error);
			}
		};
		fetchUsers();
		return () => {
			isMounted = false;
			controller.abort();
		};
	}, []);

	return (
		<>
			<PageMeta title='Usuarios' description='Usuarios de la aplicación' />
			<PageBreadcrumb pageTitle='Usuarios' />
			<div className='min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12'>
				<div className='mx-auto w-full max-w-[630px] text-center'>
					<h3 className='mb-4 font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl'>
						Usuarios
					</h3>
					<div className='grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5'>
						{users.map((user) => (
							<div key={user.id}>{user.name}</div>
						))}
					</div>
				</div>
			</div>
		</>
	);
};
