import { Routes, Route } from 'react-router-dom';

import AllMovies from '@/pages/public/AllMovies.tsx';
import Documentaries from '@/pages/public/Documentaries.tsx';
import TVSeries from '@/pages/public/TVSeries.tsx';
import WebSeries from '@/pages/public/WebSeries.tsx';

import ScrollToTop from './components/ScrollToTop';
import Navbar from './components/user/Navbar';
import { useAuth } from './hooks';
import AdminNavigator from './navigator/AdminNavigator';
import ConfirmPassword from './pages/auth/ConfirmPassword';
import EmailVerification from './pages/auth/EmailVerification';
import Favorites from './pages/auth/Favorites';
import ForgetPassword from './pages/auth/ForgetPassword';
import Signin from './pages/auth/Signin';
import Signup from './pages/auth/Signup';
import UserProfile from './pages/auth/UserProfile';
import ActorProfile from './pages/public/ActorProfile';
import Home from './pages/public/Home';
import NotFound from './pages/public/NotFound';
import SearchMovies from './pages/public/SearchMovies';
import SingleMovie from './pages/public/SingleMovie';

export default function App() {
  const { authInfo } = useAuth();
  const isAdmin = authInfo.profile?.role === 'admin';

  if (isAdmin) return <AdminNavigator />;

  return (
    <>
      <ScrollToTop />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth/signin" element={<Signin />} />
        <Route path="/auth/signup" element={<Signup />} />
        <Route path="/auth/verification" element={<EmailVerification />} />
        <Route path="/auth/forget-password" element={<ForgetPassword />} />
        <Route path="/auth/reset-password" element={<ConfirmPassword />} />
        <Route path="/movies" element={<AllMovies />} />
        <Route path="/webseries" element={<WebSeries />} />
        <Route path="/tv-series" element={<TVSeries />} />
        <Route path="/documentaries" element={<Documentaries />} />
        <Route path="/movie/:movieId" element={<SingleMovie />} />
        <Route path="/profile/:profileId" element={<ActorProfile />} />
        <Route path="/user/:userId" element={<UserProfile />} />
        <Route path="/user/:userId/favorites" element={<Favorites />} />
        <Route path="/movie/search" element={<SearchMovies />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
