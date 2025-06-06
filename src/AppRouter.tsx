import { BrowserRouter as Router, Routes, Route } from 'react-router';
import AppLayout from './layout/AppLayout';
import Home from './pages/Dashboard/Home';
import UserProfiles from './pages/UserProfiles';
import SignIn from './pages/AuthPages/SignIn';
import SignUp from './pages/AuthPages/SignUp';
import NotFound from './pages/OtherPage/NotFound';
import { ScrollToTop } from './components/common/ScrollToTop';
import { AuthProvider } from './context/AuthContext';
import { RequireAuth } from './components/auth/RequireAuth';
import { Landing } from './pages/PublicPages/Landing';
import Unauthorized from './pages/OtherPage/Unauthorized';
import { Users } from './pages/Dashboard/Users';
import { RedirectIfAuthenticated } from './components/auth/RedirectIfAuthenticated';
import { Plans } from './pages/Dashboard/Plans';

const ROLES = {
	ADMIN: 'admin',
	USER: 'user',
	PROFESSIONAL: 'professional',
};

export default function AppRouter() {
	return (
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

					{/* Dashboard - solo para usuarios autenticados */}
					<Route
						element={
							<RequireAuth
								allowedRoles={[ROLES.ADMIN, ROLES.USER, ROLES.PROFESSIONAL]}
							/>
						}
					>
						<Route element={<AppLayout />}>
							<Route path='/dashboard' element={<Home />} />
							<Route path='/users' element={<Users />} />
							<Route path='/plans' element={<Plans />} />
							<Route path='/profile' element={<UserProfiles />} />
						</Route>
					</Route>

					{/* Ruta 404 */}
					<Route path='*' element={<NotFound />} />
				</Routes>
			</AuthProvider>
		</Router>
	);
}
