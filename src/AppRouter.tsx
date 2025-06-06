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
import { SessionPersist } from './components/auth/SessionPersist';
import { RedirectIfAuthenticated } from './components/auth/RedirectIfAuthenticated';

const ROLES = {
	ADMIN: 'admin',
	USER: 'user',
	PROFESSIONAL: 'professional',
};

export default function AppRouter() {
	return (
		<>
			<Router>
				<AuthProvider>
					<ScrollToTop />
					<Routes>
						<Route path='/' element={<Landing />} />
						{/* Auth Layout */}

						<Route path='/unauthorized' element={<Unauthorized />} />
						{/* Dashboard Layout */}
						<Route element={<SessionPersist />}>
							<Route element={<RedirectIfAuthenticated />}>
								<Route path='/signin' element={<SignIn />} />
								<Route path='/signup' element={<SignUp />} />
							</Route>
							<Route
								element={
									<RequireAuth
										allowedRoles={[ROLES.ADMIN, ROLES.USER, ROLES.PROFESSIONAL]}
									/>
								}
							>
								<Route element={<AppLayout />}>
									<Route index path='/dashboard' element={<Home />} />

									<Route path='/users' element={<Users />} />

									{/* Others Page */}
									<Route path='/profile' element={<UserProfiles />} />
								</Route>
							</Route>
						</Route>

						{/* Fallback Route */}
						<Route path='*' element={<NotFound />} />
					</Routes>
				</AuthProvider>
			</Router>
		</>
	);
}
