import { Link } from 'react-router';
import PageMeta from '../../components/common/PageMeta';

export const Landing = () => {
	return (
		<>
			<PageMeta title='Landing' description='Landing' />
			<div className='flex flex-col items-center justify-center h-screen'>
				<h1 className='text-4xl font-bold'>Landing</h1>
				<Link to='/signin' className='text-blue-500'>
					Sign in
				</Link>
			</div>
		</>
	);
};
