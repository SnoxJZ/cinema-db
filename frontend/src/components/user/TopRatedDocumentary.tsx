import { useState, useEffect } from 'react';

import { getTopRatedMovies } from '@/api/movie';
import { useNotification } from '@/hooks';
import type { MovieListItem } from '@/types';

import { Skeleton } from '../Skeleton';

import MovieList from './MovieList';

export default function TopRatedDocumentary() {
  const [movies, setMovies] = useState<MovieListItem[] | undefined>(undefined);
  const { updateNotification } = useNotification();

  const fetchMovies = async (signal: AbortSignal) => {
    const { error, data } = await getTopRatedMovies('Documentary', signal);
    if (error || !data)
      return updateNotification('error', error || 'An error occurred');

    setMovies([...data.movies]);
  };

  useEffect(() => {
    const ac = new AbortController();
    fetchMovies(ac.signal);
    return () => {
      ac.abort();
    };
  }, []);

  return movies ? (
    <MovieList
      movies={movies}
      link="/documentaries"
      title="Popular Documentaries"
    />
  ) : (
    <Skeleton className="h-[400px] w-full" />
  );
}
