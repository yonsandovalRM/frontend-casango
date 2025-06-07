export const Card = ({ children }: { children: React.ReactNode }) => {
	return (
		<div className='rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] px-4 py-4'>
			{children}
		</div>
	);
};
