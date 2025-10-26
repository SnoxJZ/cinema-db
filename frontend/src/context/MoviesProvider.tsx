import { useState, createContext, type ReactNode } from 'react';

import type { MovieListItem } from '@/types';

import { getMovies } from '../api/movie';
import { useNotification } from '../hooks';

export const MovieContext = createContext<MovieContextType | null>(null);

const limit = 10;
let currentPageNo = 0;

interface MovieContextType {
  movies: MovieListItem[] | undefined;
  latestUploads: MovieListItem[] | undefined;
  fetchLatestUploads: (qty?: number) => Promise<void>;
  fetchMovies: (pageNo: number) => Promise<void>;
  fetchNextPage: () => void;
  fetchPrevPage: () => void;
}

const MoviesProvider = ({ children }: { children: ReactNode }) => {
  const [movies, setMovies] = useState<MovieListItem[] | undefined>(undefined);
  const [latestUploads, setLatestUploads] = useState<
    MovieListItem[] | undefined
  >(undefined);
  const [reachedToEnd, setReachedToEnd] = useState(false);

  const { updateNotification } = useNotification();

  const fetchLatestUploads = async (qty = 5) => {
    const { error, data } = await getMovies({ pageNo: 0, limit: qty });
    if (error || !data)
      return updateNotification('error', error || 'An error occurred');

    setLatestUploads([...data.movies]);
  };

  const fetchMovies = async (pageNo = currentPageNo) => {
    const { error, data } = await getMovies({ pageNo, limit });
    if (error || !data)
      updateNotification('error', error || 'An error occurred');

    if (!data?.movies.length) {
      currentPageNo = pageNo - 1;
      return setReachedToEnd(true);
    }

    setMovies([...data.movies]);
  };

  const fetchNextPage = () => {
    if (reachedToEnd) return;
    currentPageNo += 1;
    fetchMovies(currentPageNo);
  };

  const fetchPrevPage = () => {
    if (currentPageNo <= 0) return;
    if (reachedToEnd) setReachedToEnd(false);

    currentPageNo -= 1;
    fetchMovies(currentPageNo);
  };

  return (
    <MovieContext.Provider
      value={{
        movies,
        latestUploads,
        fetchLatestUploads,
        fetchMovies,
        fetchNextPage,
        fetchPrevPage,
      }}
    >
      {children}
    </MovieContext.Provider>
  );
};

export default MoviesProvider;
