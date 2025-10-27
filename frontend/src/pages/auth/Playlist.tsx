import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { getPlaylist } from '@/api/playlist';
import Container from '@/components/Container';
import Loading from '@/components/Loading';
import MovieList from '@/components/user/MovieList';
import { useNotification, usePlaylist } from '@/hooks';
import type { PlaylistI } from '@/types';

const Playlist = () => {
  const [playlist, setPlaylist] = useState<PlaylistI | undefined>(undefined);
  const { playlistId } = useParams();
  const { updateNotification } = useNotification();

  const { removeMovie } = usePlaylist();

  const fetchPlaylist = async () => {
    const { error, data } = await getPlaylist(playlistId || '');
    if (error || !data)
      return updateNotification('error', error || 'An error occurred');
    setPlaylist(data.playlist);
  };

  useEffect(() => {
    fetchPlaylist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDeleteMovie = async (
    playlistId: string,
    movieId: string,
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    e.stopPropagation();
    await removeMovie(playlistId, movieId);
    setPlaylist((prev) =>
      prev
        ? { ...prev, movies: prev.movies?.filter((m) => m.id !== movieId) }
        : undefined,
    );
  };

  if (!playlist) return <Loading />;

  return (
    <div className="min-h-screen bg-white pb-10 dark:bg-primary">
      <Container className="space-y-6 p-4 xl:px-0">
        <MovieList
          movies={playlist.movies}
          title={playlist.name}
          description={playlist.description}
          onDelete={(movieId, e) =>
            handleDeleteMovie(playlistId || '', movieId, e)
          }
        />
      </Container>
    </div>
  );
};

export default Playlist;
