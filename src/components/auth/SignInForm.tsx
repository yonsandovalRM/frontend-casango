import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import {
	ChevronLeftIcon,
	EyeCloseIcon,
	EyeIcon,
	GoogleIcon,
	XIcon,
} from '../../icons';
import Label from '../form/Label';
import Input from '../form/input/InputField';
import Checkbox from '../form/input/Checkbox';
import Button from '../ui/button/Button';

import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../../hooks/useAuth';
import api from '../../api/axios';
import { useNotify } from '../../hooks/useNotify';

interface IFormInputs {
	email: string;
	password: string;
}

const loginSchema = yup
	.object({
		email: yup
			.string()
			.email('El email no es válido')
			.required('Este campo es requerido'),
		password: yup
			.string()
			.required('Este campo es requerido')
			.min(6, 'Contraseña debe tener al menos 6 caracteres'),
	})
	.required();

export default function SignInForm() {
	const { setAuth, persist, setPersist } = useAuth();
	const { notify } = useNotify();
	const [showPassword, setShowPassword] = useState(false);
	const navigate = useNavigate();
	const location = useLocation();
	const from = location.state?.from?.pathname || '/dashboard';

	const { handleSubmit, control, reset } = useForm({
		resolver: yupResolver(loginSchema),
		defaultValues: {
			email: 'dr@test.com',
			password: '123456',
		},
	});

	const handleChangePersist = (checked: boolean) => {
		setPersist(checked);
	};

	const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
		try {
			const response = await api.post('/core/auth/login', data, {
				withCredentials: true,
			});

			setAuth(response.data);

			// Marcar si la sesión se inició con persist activado
			if (persist) {
				localStorage.setItem('sessionStartedWithPersist', 'true');
			} else {
				localStorage.removeItem('sessionStartedWithPersist');
			}

			reset();
			navigate(from, {
				replace: true,
			});
		} catch (error: any) {
			if (error.code === 'ERR_NETWORK') {
				notify(
					'Error de conexión: No se pudo conectar con el servidor',
					'error'
				);
			} else {
				notify(error.response.data.message, 'error');
			}
		}
	};
	return (
		<div className='flex flex-col flex-1'>
			<div className='w-full max-w-md pt-10 mx-auto'>
				<Link
					to='/'
					className='inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
				>
					<ChevronLeftIcon className='size-5' />
					Back to home
				</Link>
			</div>
			<div className='flex flex-col justify-center flex-1 w-full max-w-md mx-auto'>
				<div>
					<div className='mb-5 sm:mb-8'>
						<h1 className='mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md'>
							Sign In
						</h1>
						<p className='text-sm text-gray-500 dark:text-gray-400'>
							Enter your email and password to sign in!
						</p>
					</div>
					<div>
						<div className='grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5'>
							<button className='inline-flex items-center justify-center gap-3 py-3 text-sm font-normal text-gray-700 transition-colors bg-gray-100 rounded-lg px-7 hover:bg-gray-200 hover:text-gray-800 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10'>
								<GoogleIcon className='size-5' />
								Sign in with Google
							</button>
							<button className='inline-flex items-center justify-center gap-3 py-3 text-sm font-normal text-gray-700 transition-colors bg-gray-100 rounded-lg px-7 hover:bg-gray-200 hover:text-gray-800 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10'>
								<XIcon className='size-5 fill-current' />
								Sign in with X
							</button>
						</div>
						<div className='relative py-3 sm:py-5'>
							<div className='absolute inset-0 flex items-center'>
								<div className='w-full border-t border-gray-200 dark:border-gray-800'></div>
							</div>
							<div className='relative flex justify-center text-sm'>
								<span className='p-2 text-gray-400 bg-white dark:bg-gray-900 sm:px-5 sm:py-2'>
									Or
								</span>
							</div>
						</div>

						<form onSubmit={handleSubmit(onSubmit)}>
							<div className='space-y-6'>
								<div>
									<Label required>Email</Label>
									<Controller
										control={control}
										name='email'
										render={({ field, fieldState: { error } }) => (
											<Input
												{...field}
												placeholder='info@gmail.com'
												error={!!error}
												hint={error?.message}
												autoComplete='off'
											/>
										)}
									/>
								</div>
								<div>
									<Label required>Password</Label>
									<div className='relative'>
										<Controller
											control={control}
											name='password'
											render={({ field, fieldState: { error } }) => (
												<Input
													{...field}
													type={showPassword ? 'text' : 'password'}
													placeholder='Enter your password'
													error={!!error}
													hint={error?.message}
												/>
											)}
										/>
										<span
											onClick={() => setShowPassword(!showPassword)}
											className='absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2'
										>
											{showPassword ? (
												<EyeIcon className='fill-gray-500 dark:fill-gray-400 size-5' />
											) : (
												<EyeCloseIcon className='fill-gray-500 dark:fill-gray-400 size-5' />
											)}
										</span>
									</div>
								</div>
								<div className='flex items-center justify-between'>
									<div className='flex items-center gap-3'>
										<Checkbox
											checked={persist}
											onChange={handleChangePersist}
										/>

										<span className='block font-normal text-gray-700 text-theme-sm dark:text-gray-400'>
											Keep me logged in
										</span>
									</div>
									<Link
										to='/reset-password'
										className='text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400'
									>
										Forgot password?
									</Link>
								</div>
								<div>
									<Button className='w-full' size='sm'>
										Sign in
									</Button>
								</div>
							</div>
						</form>

						<div className='mt-5'>
							<p className='text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start'>
								Don&apos;t have an account? {''}
								<Link
									to='/signup'
									className='text-brand-500 hover:text-brand-600 dark:text-brand-400'
								>
									Sign Up
								</Link>
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
