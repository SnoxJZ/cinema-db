import { useEffect, useState } from 'react';

import { getRelatedMovies } from '@/api/movie';
import { useNotification } from '@/hooks';
import type { MovieListItem } from '@/types';

import MovieList from './MovieList';

export default function RelatedMovies({ movieId }: { movieId: string }) {
  const [movies, setMovies] = useState<MovieListItem[]>([]);
  const { updateNotification } = useNotification();

  useEffect(() => {
    const fetchRelatedMovies = async () => {
      try {
        const { data, error } = await getRelatedMovies(movieId);
        if (error || !data)
          return updateNotification('error', error || 'An error occurred');

        setMovies(data.movies);
      } catch (error) {
        updateNotification(
          'error',
          error instanceof Error ? error.message : 'An error occurred',
        );
      }
    };

    if (movieId) {
      fetchRelatedMovies();
    }
  }, [movieId]);

  return <MovieList title="Related Movies" movies={movies} />;
}
