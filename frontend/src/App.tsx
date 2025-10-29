import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';

import AllMovies from '@/pages/public/AllMovies.tsx';
import Documentaries from '@/pages/public/Documentaries.tsx';
import TVSeries from '@/pages/public/TVSeries.tsx';
import WebSeries from '@/pages/public/WebSeries.tsx';

import Header from './components/admin/Header';
import MovieUpload from './components/admin/MovieUpload';
import ActorUpload from './components/models/ActorUpload';
import ScrollToTop from './components/ScrollToTop';
import Navbar from './components/user/Navbar';
import { useAuth } from './hooks';
import ActivityLogs from './pages/admin/ActivityLogs';
import Actors from './pages/admin/Actors';
import Dashboard from './pages/admin/Dashboard';
import Movies from './pages/admin/Movies';
import AdminSearchMovies from './pages/admin/SearchMovies';
import Users from './pages/admin/Users';
import ConfirmPassword from './pages/auth/ConfirmPassword';
import EmailVerification from './pages/auth/EmailVerification';
import Favorites from './pages/auth/Favorites';
import ForgetPassword from './pages/auth/ForgetPassword';
import Playlist from './pages/auth/Playlist';
import Signin from './pages/auth/Signin';
import Signup from './pages/auth/Signup';
import UserProfile from './pages/auth/UserProfile';
import ActorProfile from './pages/public/ActorProfile';
import Home from './pages/public/Home';
import NotFound from './pages/public/NotFound';
import SearchMovies from './pages/public/SearchMovies';
import SingleMovie from './pages/public/SingleMovie';

export default function App() {
  const { isPrivilegedUser, isAdmin } = useAuth();
  const [showMovieUploadModal, setShowMovieUploadModal] = useState(false);
  const [showActorUploadModal, setShowActorUploadModal] = useState(false);

  const displayMovieUploadModal = () => {
    setShowMovieUploadModal(true);
  };

  const hideMovieUploadModal = () => {
    setShowMovieUploadModal(false);
  };

  const displayActorUploadModal = () => {
    setShowActorUploadModal(true);
  };

  const hideActorUploadModal = () => {
    setShowActorUploadModal(false);
  };

  return (
    <>
      <ScrollToTop />
      <Navbar />
      {isPrivilegedUser && (
        <Header
          isAdmin={isAdmin}
          onAddMovieClick={displayMovieUploadModal}
          onAddActorClick={displayActorUploadModal}
        />
      )}
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
        <Route path="/playlist/:playlistId" element={<Playlist />} />
        <Route path="/movie/search" element={<SearchMovies />} />

        {isPrivilegedUser && (
          <>
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/movies" element={<Movies />} />
            <Route path="/admin/actors" element={<Actors />} />
            <Route path="/admin/users" element={<Users />} />
            <Route path="/search" element={<AdminSearchMovies />} />
            <Route path="/admin/activity-logs" element={<ActivityLogs />} />
          </>
        )}

        <Route path="*" element={<NotFound />} />
      </Routes>

      {isPrivilegedUser && (
        <>
          <MovieUpload
            visible={showMovieUploadModal}
            onClose={hideMovieUploadModal}
          />
          <ActorUpload
            visible={showActorUploadModal}
            onClose={hideActorUploadModal}
          />
        </>
      )}
    </>
  );
}
