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
import { AuthStatus } from '../../context/AuthContext';
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
	const { login, persist, setPersist, authStatus, error, clearError } =
		useAuth();
	const { notify } = useNotify();
	const [showPassword, setShowPassword] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const navigate = useNavigate();
	const location = useLocation();

	// Obtener destino desde el state o usar default
	const from = location.state?.from?.pathname || '/dashboard';
	const locationMessage = location.state?.message;

	const {
		handleSubmit,
		control,
		reset,
		setError: setFormError,
	} = useForm({
		resolver: yupResolver(loginSchema),
		defaultValues: {
			email: 'dr@test.com',
			password: '123456',
		},
	});

	// Mostrar mensaje de ubicación anterior si existe
	useState(() => {
		if (locationMessage) {
			notify(locationMessage, 'info');
		}
	});

	// Limpiar error de auth cuando el usuario empiece a escribir
	const handleClearAuthError = () => {
		if (error) {
			clearError();
		}
	};

	const handleChangePersist = (checked: boolean) => {
		setPersist(checked);
	};

	const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
		// Limpiar errores previos
		clearError();
		setIsSubmitting(true);

		try {
			const response = await api.post('/core/auth/login', data, {
				withCredentials: true,
				timeout: 15000, // 15 segundos timeout
			});

			// Validar respuesta
			if (!response.data?.accessToken || !response.data?.user) {
				throw new Error('Respuesta de login inválida');
			}

			// Usar la función login del contexto
			login(response.data);

			// Limpiar formulario
			reset();

			// Navegar al destino
			navigate(from, {
				replace: true,
				state: {
					message: `¡Bienvenido/a ${
						response.data.user.name || response.data.user.email
					}!`,
				},
			});
		} catch (error: any) {
			console.error('Login error:', error);

			// Manejar diferentes tipos de errores
			if (error.code === 'ECONNABORTED') {
				notify(
					'La solicitud ha tardado demasiado. Intenta nuevamente.',
					'error'
				);
			} else if (error.code === 'ERR_NETWORK') {
				notify(
					'Error de conexión: No se pudo conectar con el servidor. Verifica tu conexión a internet.',
					'error'
				);
			} else if (error.response?.status === 401) {
				const errorMessage =
					error.response.data?.message || 'Credenciales incorrectas';
				notify(errorMessage, 'error');

				// Marcar campos del formulario con error si es necesario
				if (errorMessage.toLowerCase().includes('email')) {
					setFormError('email', {
						type: 'manual',
						message: 'Email no encontrado',
					});
				} else if (errorMessage.toLowerCase().includes('password')) {
					setFormError('password', {
						type: 'manual',
						message: 'Contraseña incorrecta',
					});
				}
			} else if (error.response?.status === 429) {
				notify(
					'Demasiados intentos de inicio de sesión. Intenta nuevamente más tarde.',
					'error'
				);
			} else if (error.response?.status === 422) {
				notify(
					'Los datos enviados no son válidos. Verifica la información.',
					'error'
				);
			} else {
				const errorMessage =
					error.response?.data?.message ||
					'Error inesperado al iniciar sesión. Intenta nuevamente.';
				notify(errorMessage, 'error');
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	// Determinar si mostrar loading
	const isLoading = isSubmitting || authStatus === AuthStatus.LOADING;

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

					{/* Mostrar error de autenticación si existe */}
					{error && (
						<div className='mb-4 p-3 bg-red-50 border border-red-200 rounded-lg'>
							<div className='flex items-center'>
								<div className='text-red-500 mr-2'>
									<svg
										className='h-4 w-4'
										fill='currentColor'
										viewBox='0 0 20 20'
									>
										<path
											fillRule='evenodd'
											d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
											clipRule='evenodd'
										/>
									</svg>
								</div>
								<p className='text-sm text-red-700'>{error}</p>
								<button
									onClick={clearError}
									className='ml-auto text-red-500 hover:text-red-700'
								>
									<svg
										className='h-4 w-4'
										fill='currentColor'
										viewBox='0 0 20 20'
									>
										<path
											fillRule='evenodd'
											d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
											clipRule='evenodd'
										/>
									</svg>
								</button>
							</div>
						</div>
					)}

					<div>
						<div className='grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5'>
							<button
								className='inline-flex items-center justify-center gap-3 py-3 text-sm font-normal text-gray-700 transition-colors bg-gray-100 rounded-lg px-7 hover:bg-gray-200 hover:text-gray-800 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed'
								disabled={isLoading}
							>
								<GoogleIcon className='size-5' />
								Sign in with Google
							</button>
							<button
								className='inline-flex items-center justify-center gap-3 py-3 text-sm font-normal text-gray-700 transition-colors bg-gray-100 rounded-lg px-7 hover:bg-gray-200 hover:text-gray-800 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed'
								disabled={isLoading}
							>
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
												autoComplete='email'
												disabled={isLoading}
												onChange={(e) => {
													field.onChange(e);
													handleClearAuthError();
												}}
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
													autoComplete='current-password'
													disabled={isLoading}
													onChange={(e) => {
														field.onChange(e);
														handleClearAuthError();
													}}
												/>
											)}
										/>
										<button
											type='button'
											onClick={() => setShowPassword(!showPassword)}
											className='absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2 disabled:cursor-not-allowed'
											disabled={isLoading}
										>
											{showPassword ? (
												<EyeIcon className='fill-gray-500 dark:fill-gray-400 size-5' />
											) : (
												<EyeCloseIcon className='fill-gray-500 dark:fill-gray-400 size-5' />
											)}
										</button>
									</div>
								</div>

								<div className='flex items-center justify-between'>
									<div className='flex items-center gap-3'>
										<Checkbox
											checked={persist}
											onChange={handleChangePersist}
											disabled={isLoading}
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
									<Button className='w-full' size='sm' disabled={isLoading}>
										{isLoading ? (
											<div className='flex items-center justify-center'>
												<div className='animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2'></div>
												Signing in...
											</div>
										) : (
											'Sign in'
										)}
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
