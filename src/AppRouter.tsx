import { BrowserRouter as Router, Routes, Route } from 'react-router';
import AppLayout from './layout/AppLayout';
import Home from './pages/Dashboard/Home';
import UserProfiles from './pages/UserProfiles';
import SignIn from './pages/AuthPages/SignIn';
import SignUp from './pages/AuthPages/SignUp';
import NotFound from './pages/OtherPage/NotFound';
import { ScrollToTop } from './components/common/ScrollToTop';

export default function AppRouter() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout */}
          <Route element={<AppLayout />}>
            <Route index path='/' element={<Home />} />

            {/* Others Page */}
            <Route path='/profile' element={<UserProfiles />} />
          </Route>

          {/* Auth Layout */}
          <Route path='/signin' element={<SignIn />} />
          <Route path='/signup' element={<SignUp />} />

          {/* Fallback Route */}
          <Route path='*' element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
