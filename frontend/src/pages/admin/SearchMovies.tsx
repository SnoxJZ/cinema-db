import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { searchMovieForAdmin } from '@/api/movie';
import { useNotification } from '@/hooks';
import type { MovieListItem as MovieListItemType } from '@/types';

import MovieListItem from '../../components/MovieListItem';
import NotFoundText from '../../components/NotFoundText';

export default function SearchMovies() {
  const [movies, setMovies] = useState<MovieListItemType[] | undefined>(
    undefined,
  );
  const [resultNotFound, setResultNotFound] = useState(false);

  const [searchParams] = useSearchParams();
  const query = searchParams.get('title');

  const { updateNotification } = useNotification();

  const searchMovies = async (val: string) => {
    const { error, data } = await searchMovieForAdmin(val);
    if (error || !data)
      return updateNotification('error', error || 'An error occurred');

    if (!data.results.length) {
      setResultNotFound(true);
      return setMovies([]);
    }

    setResultNotFound(false);
    setMovies([...data.results]);
  };

  const handleUIUpdate = async () => {
    if (query?.trim()) {
      await searchMovies(query);
    }
  };

  useEffect(() => {
    if (query?.trim()) searchMovies(query);
  }, [query]);

  return (
    <div className="space-y-3 p-5">
      <NotFoundText text="Not found!" visible={resultNotFound} />
      {!resultNotFound &&
        movies?.map((movie) => {
          return (
            <MovieListItem
              movie={movie}
              key={movie.id}
              onUIUpdate={handleUIUpdate}
            />
          );
        })}
    </div>
  );
}
