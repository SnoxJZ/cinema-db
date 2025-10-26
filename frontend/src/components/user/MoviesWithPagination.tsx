import clsx from 'clsx';
import { useEffect, useState } from 'react';

import { getMovies } from '@/api/movie.ts';
import Container from '@/components/Container.tsx';
import Loading from '@/components/Loading.tsx';
import MovieList from '@/components/user/MovieList.tsx';
import { useNotification } from '@/hooks';
import type { MovieListItem, MovieType } from '@/types';
import genres from '@/utils/genres.ts';

const AllMovies = ({ type, title }: { type: MovieType; title: string }) => {
  const [movies, setMovies] = useState<MovieListItem[] | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    genre: '',
  });
  const [sortBy, setSortBy] = useState<'releseDate' | 'ratingAvg' | undefined>(
    undefined,
  );
  const { updateNotification } = useNotification();
  console.log(sortBy);

  const fetchMovies = async () => {
    setIsLoading(true);
    const { error, data } = await getMovies({
      ...filters,
      pageNo: currentPage - 1,
      limit: 30,
      type,
      sortBy,
    });
    if (error || !data)
      return updateNotification('error', error || 'An error occurred');

    setMovies(data.movies);
    setTotalPages(data.pageCount);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchMovies();
  }, [filters, sortBy, currentPage]);

  const generatePageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (isLoading || !movies) return <Loading />;

  return (
    <div className="min-h-screen bg-white pb-10 dark:bg-primary">
      <Container className="space-y-4 px-2 py-4 xl:px-0">
        <div className="flex flex-wrap gap-4 sm:justify-end">
          <div className="flex flex-col gap-2">
            <label htmlFor="sort" className="text-sm dark:text-white">
              Sort by
            </label>
            <select
              id="sort"
              onChange={(e) =>
                setSortBy(e.target.value as 'releseDate' | 'ratingAvg')
              }
              value={sortBy}
              className="rounded border border-gray-300 bg-white px-4 py-2 dark:border-gray-600 dark:bg-secondary dark:text-white"
            >
              <option value={undefined}>Default</option>
              <option value="releseDate">Sort by Date</option>
              <option value="ratingAvg">Sort by Rating</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="genre" className="text-sm dark:text-white">
              Genre
            </label>
            <select
              id="genre"
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, genre: e.target.value }))
              }
              value={filters.genre}
              className="rounded border border-gray-300 bg-white px-4 py-2 dark:border-gray-600 dark:bg-secondary dark:text-white"
            >
              <option value="">Default</option>
              {genres.map((genre) => (
                <option value={genre} key={genre}>
                  {genre}
                </option>
              ))}
            </select>
          </div>
        </div>
        <MovieList title={title} movies={movies} />
        {totalPages > 1 && (
          <div className="flex w-full flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              className={clsx(
                'rounded border border-gray-300 bg-white p-2 dark:border-gray-600 dark:bg-secondary dark:text-white sm:px-4 sm:py-2',
                currentPage === 1 && 'pointer-events-none opacity-50',
              )}
            >
              Previous
            </button>
            {generatePageNumbers().map((page, index) => (
              <button
                type="button"
                key={index}
                onClick={() => setCurrentPage(page as number)}
                className={clsx(
                  'rounded border border-gray-300 bg-white p-2 dark:border-gray-600 dark:bg-secondary dark:text-white sm:px-4 sm:py-2',
                  currentPage === page &&
                    '!text-highlight dark:!text-highlight-dark',
                  page === '...' && 'pointer-events-none opacity-50',
                )}
              >
                {page}
              </button>
            ))}
            <button
              type="button"
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              className={clsx(
                'rounded border border-gray-300 bg-white p-2 dark:border-gray-600 dark:bg-secondary dark:text-white sm:px-4 sm:py-2',
                currentPage === totalPages && 'pointer-events-none opacity-50',
              )}
            >
              Next
            </button>
          </div>
        )}
      </Container>
    </div>
  );
};

export default AllMovies;
