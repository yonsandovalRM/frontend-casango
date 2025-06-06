import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
	children: ReactNode;
	fallback?: ReactNode;
}

interface State {
	hasError: boolean;
	error?: Error;
}

export class AuthErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		console.error('Auth Error Boundary caught an error:', error, errorInfo);

		// Aquí puedes enviar el error a un servicio de logging
		// logErrorToService(error, errorInfo);
	}

	render() {
		if (this.state.hasError) {
			return (
				this.props.fallback || (
					<div className='flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4'>
						<div className='bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center'>
							<div className='text-red-500 mb-4'>
								<svg
									className='mx-auto h-12 w-12'
									fill='none'
									stroke='currentColor'
									viewBox='0 0 24 24'
								>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z'
									/>
								</svg>
							</div>
							<h3 className='text-lg font-semibold text-gray-900 mb-2'>
								Error de Autenticación
							</h3>
							<p className='text-gray-600 mb-6'>
								Ha ocurrido un error inesperado con la autenticación. Por favor,
								recarga la página.
							</p>
							<button
								onClick={() => window.location.reload()}
								className='bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors duration-200'
							>
								Recargar Página
							</button>
						</div>
					</div>
				)
			);
		}

		return this.props.children;
	}
}

// Hook para usar el error boundary de forma funcional
export const useAuthErrorHandler = () => {
	const handleAuthError = (error: Error, errorInfo?: any) => {
		console.error('Auth error handled:', error, errorInfo);

		// Aquí puedes agregar lógica adicional para manejar errores
		// Por ejemplo, enviar a un servicio de logging, mostrar notificaciones, etc.
	};

	return { handleAuthError };
};
