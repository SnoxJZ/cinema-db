import { useEffect } from 'react';

import { useMovies } from '@/hooks';

import MovieListItem from '../../components/MovieListItem';
import NextAndPrevButton from '../../components/NextAndPrevButton';

const currentPageNo = 0;

export default function Movies() {
  const {
    fetchMovies,
    movies: newMovies,
    fetchPrevPage,
    fetchNextPage,
  } = useMovies();

  const handleUIUpdate = () => {
    return fetchMovies(currentPageNo);
  };

  useEffect(() => {
    fetchMovies(currentPageNo);
  }, []);

  return (
    <>
      <div className="space-y-3 p-5 dark:bg-primary">
        {newMovies?.map((movie) => {
          return (
            <MovieListItem
              key={movie.id}
              movie={movie}
              onUIUpdate={handleUIUpdate}
            />
          );
        })}

        <NextAndPrevButton
          className="mt-5"
          onNextClick={fetchNextPage}
          onPrevClick={fetchPrevPage}
        />
      </div>
    </>
  );
}
