import { useState } from 'react';
import { Route, Routes } from 'react-router-dom';

import Header from '../components/admin/Header';
import MovieUpload from '../components/admin/MovieUpload';
import Navbar from '../components/admin/Navbar';
import ActorUpload from '../components/models/ActorUpload';
import ScrollToTop from '../components/ScrollToTop';
import Actors from '../pages/admin/Actors';
import Dashboard from '../pages/admin/Dashboard';
import Movies from '../pages/admin/Movies';
import SearchMovies from '../pages/admin/SearchMovies';
import NotFound from '../pages/public/NotFound';

export default function AdminNavigator() {
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
      <div className="flex bg-white dark:bg-primary">
        <ScrollToTop />
        <Navbar />
        <div className="max-w-screen-xl flex-1">
          <Header
            onAddMovieClick={displayMovieUploadModal}
            onAddActorClick={displayActorUploadModal}
          />
          <Routes>
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/movies" element={<Movies />} />
            <Route path="/admin/actors" element={<Actors />} />
            <Route path="/search" element={<SearchMovies />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </div>
      <MovieUpload
        visible={showMovieUploadModal}
        onClose={hideMovieUploadModal}
      />
      <ActorUpload
        visible={showActorUploadModal}
        onClose={hideActorUploadModal}
      />
    </>
  );
}
