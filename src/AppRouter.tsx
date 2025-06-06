import { BrowserRouter as Router, Routes, Route } from 'react-router';
import AppLayout from './layout/AppLayout';
import Home from './pages/Dashboard/Home';
import UserProfiles from './pages/UserProfiles';
import SignIn from './pages/AuthPages/SignIn';
import SignUp from './pages/AuthPages/SignUp';
import NotFound from './pages/OtherPage/NotFound';
import { ScrollToTop } from './components/common/ScrollToTop';
import { AuthProvider } from './context/AuthContext';
import { RequireAuth, RequireRole } from './components/auth/RequireAuth';
import { Landing } from './pages/PublicPages/Landing';
import Unauthorized from './pages/OtherPage/Unauthorized';
import { Users } from './pages/Dashboard/Users';
import { RedirectIfAuthenticated } from './components/auth/RedirectIfAuthenticated';
import { Plans } from './pages/Dashboard/Plans';
import { AuthErrorBoundary } from './components/auth/AuthErrorBoundary';
import { UserRole } from './interfaces/auth';

// Constantes de roles centralizadas
const ROLES = {
	ADMIN: UserRole.ADMIN,
	USER: UserRole.USER,
	PROFESSIONAL: UserRole.PROFESSIONAL,
} as const;

// Componente para manejar rutas protegidas por rol
const AdminRoute = ({ children }: { children: React.ReactNode }) => (
	<RequireRole role={ROLES.ADMIN} fallback={<Unauthorized />}>
		{children}
	</RequireRole>
);

export default function AppRouter() {
	return (
		<AuthErrorBoundary>
			<Router>
				<AuthProvider>
					<ScrollToTop />
					<Routes>
						{/* Página pública */}
						<Route path='/' element={<Landing />} />

						{/* Páginas de autenticación - solo para usuarios no autenticados */}
						<Route element={<RedirectIfAuthenticated />}>
							<Route path='/signin' element={<SignIn />} />
							<Route path='/signup' element={<SignUp />} />
						</Route>

						{/* Página de no autorizado */}
						<Route path='/unauthorized' element={<Unauthorized />} />

						{/* Dashboard - rutas protegidas por autenticación */}
						<Route
							element={
								<RequireAuth
									allowedRoles={[ROLES.ADMIN, ROLES.USER, ROLES.PROFESSIONAL]}
								/>
							}
						>
							<Route element={<AppLayout />}>
								{/* Rutas accesibles para todos los usuarios autenticados */}
								<Route path='/dashboard' element={<Home />} />
								<Route path='/profile' element={<UserProfiles />} />

								{/* Rutas específicas por rol */}
								<Route
									path='/users'
									element={
										<AdminRoute>
											<Users />
										</AdminRoute>
									}
								/>

								{/* Rutas para admin y professional */}
								<Route
									element={
										<RequireAuth
											allowedRoles={[ROLES.ADMIN, ROLES.PROFESSIONAL]}
										/>
									}
								>
									<Route path='/plans' element={<Plans />} />
								</Route>
							</Route>
						</Route>

						{/* Ruta 404 */}
						<Route path='*' element={<NotFound />} />
					</Routes>
				</AuthProvider>
			</Router>
		</AuthErrorBoundary>
	);
}
