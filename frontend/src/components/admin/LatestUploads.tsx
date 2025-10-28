import { useEffect } from 'react';

import { useMovies } from '@/hooks';

import MovieListItem from '../MovieListItem';

export default function LatestUploads() {
  const { fetchLatestUploads, latestUploads } = useMovies();

  const handleUIUpdate = () => fetchLatestUploads();

  useEffect(() => {
    fetchLatestUploads();
  }, []);

  return (
    <>
      <div className="col-span-1 rounded bg-white p-5 shadow dark:bg-secondary dark:shadow md:col-span-2">
        <h1 className="mb-2 text-2xl font-semibold text-primary dark:text-white">
          Latest Uploads
        </h1>

        <div className="space-y-3">
          {latestUploads?.map((movie) => {
            return (
              <MovieListItem
                key={movie.id}
                movie={movie}
                onUIUpdate={handleUIUpdate}
              />
            );
          })}
        </div>
      </div>
    </>
  );
}
