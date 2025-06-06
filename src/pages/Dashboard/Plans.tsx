import { useEffect, useState } from 'react';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import { useAxiosPrivate } from '../../hooks/useAxiosPrivate';
import { Plan } from '../../api/models/plans';

export const Plans = () => {
	const [plans, setPlans] = useState<Plan[]>([]);
	const { api } = useAxiosPrivate();

	useEffect(() => {
		let isMounted = true;
		const controller = new AbortController();

		const fetchPlans = async () => {
			try {
				const response = await api.get('/core/plans', {
					signal: controller.signal,
				});
				isMounted && setPlans(response.data);
			} catch (error) {
				console.log(error);
			}
		};
		fetchPlans();
		return () => {
			isMounted = false;
			controller.abort();
		};
	}, []);

	return (
		<>
			<PageMeta title='Planes' description='Planes de la aplicación' />
			<PageBreadcrumb pageTitle='Planes' />
			<div className='min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12'>
				<div className='mx-auto w-full max-w-[630px] text-center'>
					<h3 className='mb-4 font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl'>
						Planes
					</h3>
					<div className='grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5'>
						{plans.map((plan) => (
							<div key={plan.id}>{plan.name}</div>
						))}
					</div>
				</div>
			</div>
		</>
	);
};
