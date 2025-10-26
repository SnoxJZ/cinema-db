import { useEffect, useState } from 'react';

import { getMostRatedMovies } from '@/api/admin';
import { useNotification } from '@/hooks';
import type { MostRatedMovie } from '@/types';
import { convertReviewCount } from '@/utils/helper';

import RatingStar from './RatingStar';

export default function MostRatedMovies() {
  const [movies, setMovies] = useState<MostRatedMovie[] | undefined>(undefined);

  const { updateNotification } = useNotification();

  const fetchMostRatedMovies = async () => {
    const { error, data } = await getMostRatedMovies();
    if (error || !data)
      return updateNotification('error', error || 'An error occurred');

    setMovies([...data.movies]);
  };

  useEffect(() => {
    fetchMostRatedMovies();
  }, []);

  return (
    <div className="rounded bg-white p-5 shadow dark:bg-secondary dark:shadow">
      <h1 className="mb-2 text-2xl font-semibold text-primary dark:text-white">
        Most Rated Movies
      </h1>
      <ul className="space-y-3">
        {movies?.map((movie) => {
          return (
            <li key={movie.id}>
              <h1 className="font-semibold text-secondary dark:text-white">
                {movie.title}
              </h1>
              <div className="flex space-x-2">
                <RatingStar rating={movie.reviews?.ratingAvg} />
                <p className="text-light-subtle dark:text-dark-subtle">
                  {convertReviewCount(movie.reviews?.reviewCount)} Reviews
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
