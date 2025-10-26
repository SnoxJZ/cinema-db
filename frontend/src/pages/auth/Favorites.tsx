import { useEffect, useState } from 'react';

import { getFavorites } from '@/api/auth';
import Container from '@/components/Container';
import Loading from '@/components/Loading';
import MovieList from '@/components/user/MovieList';
import { useNotification } from '@/hooks';
import type { MovieListItem } from '@/types';

const Favorites = () => {
  const [favorites, setFavorites] = useState<MovieListItem[]>([]);
  const { updateNotification } = useNotification();

  const fetchFavorites = async () => {
    const { error, data } = await getFavorites();
    if (error || !data)
      return updateNotification('error', error || 'An error occurred');
    setFavorites(data.movies);
  };

  useEffect(() => {
    fetchFavorites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!favorites.length) return <Loading />;

  return (
    <div className="min-h-screen bg-white pb-10 dark:bg-primary">
      <Container className="space-y-6 p-4 xl:px-0">
        <MovieList movies={favorites} title="Favorites" />
      </Container>
    </div>
  );
};

export default Favorites;
