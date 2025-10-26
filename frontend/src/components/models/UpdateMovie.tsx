import { useEffect, useState } from 'react';

import { getMovieForUpdate, updateMovie } from '@/api/movie';
import { useNotification } from '@/hooks';
import type { Movie } from '@/types';

import MovieForm from '../admin/MovieForm';

import ModalContainer from './ModalContainer';

export default function UpdateMovie({
  movieId,
  visible,
  onSuccess,
}: {
  movieId: string | null;
  visible: boolean;
  onSuccess: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const { updateNotification } = useNotification();

  const handleSubmit = async (data: FormData) => {
    setBusy(true);
    const { error, data: movie } = await updateMovie(movieId || '', data);
    setBusy(false);
    if (error || !movie)
      return updateNotification('error', error || 'An error occurred');

    updateNotification('success', movie.message);
    onSuccess();
  };

  const fetchMovieToUpdate = async () => {
    const { data, error } = await getMovieForUpdate(movieId || '');
    if (error || !data)
      return updateNotification('error', error || 'An error occurred');
    setReady(true);
    setSelectedMovie(data.movie);
  };

  useEffect(() => {
    if (movieId) fetchMovieToUpdate();
  }, [movieId]);

  return (
    <ModalContainer visible={visible}>
      {ready ? (
        <MovieForm
          initialState={selectedMovie}
          btnTitle="Update"
          onSubmit={!busy ? handleSubmit : null}
          busy={busy}
        />
      ) : (
        <div className="flex size-full items-center justify-center">
          <p className="animate-pulse text-xl text-light-subtle dark:text-dark-subtle">
            Please wait...
          </p>
        </div>
      )}
    </ModalContainer>
  );
}
