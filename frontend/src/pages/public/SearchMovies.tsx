import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { searchPublicMovies } from '@/api/movie';
import { useNotification } from '@/hooks';
import type { MovieListItem } from '@/types';

import Container from '../../components/Container';
import NotFoundText from '../../components/NotFoundText';
import MovieList from '../../components/user/MovieList';

export default function SearchMovies() {
  const [movies, setMovies] = useState<MovieListItem[] | undefined>(undefined);
  const [resultNotFound, setResultNotFound] = useState(false);

  const [searchParams] = useSearchParams();
  const query = searchParams.get('title');

  const { updateNotification } = useNotification();

  const searchMovies = async (val: string) => {
    const { error, data } = await searchPublicMovies(val);
    if (error || !data)
      return updateNotification('error', error || 'An error occurred');

    if (!data.results.length) {
      setResultNotFound(true);
      return setMovies([]);
    }

    setResultNotFound(false);
    setMovies([...data.results]);
  };

  useEffect(() => {
    if (query?.trim()) searchMovies(query);
  }, [query]);

  return (
    <div className="min-h-screen bg-white py-8 dark:bg-primary">
      <Container className="px-2 xl:p-0">
        <NotFoundText text="Not found!" visible={resultNotFound} />
        <MovieList movies={movies} />
      </Container>
    </div>
  );
}
