import { createContext, useState, type ReactNode } from 'react';

import * as playlistApi from '@/api/playlist';
import { useNotification } from '@/hooks';

interface PlaylistContext {
  playlists: { id: string; name: string; isPublic: boolean }[];
  isLoading: boolean;
  fetchPlaylists: () => Promise<void>;
  createPlaylist: (playlist: {
    name: string;
    description?: string;
    isPublic?: boolean;
  }) => Promise<void>;
  addMovie: (playlistId: string, movieId: string) => Promise<void>;
  removeMovie: (playlistId: string, movieId: string) => Promise<void>;
  deletePlaylist: (playlistId: string) => Promise<void>;
}

export const PlaylistContext = createContext<PlaylistContext | null>(null);

export default function PlaylistProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [playlists, setPlaylists] = useState<
    { id: string; name: string; isPublic: boolean }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const { updateNotification } = useNotification();

  const fetchPlaylists = async () => {
    setIsLoading(true);
    const { data, error } = await playlistApi.getPlaylists();
    setIsLoading(false);

    if (error || !data) {
      updateNotification('error', error || 'Failed to fetch playlists');
      return;
    }

    setPlaylists(data.playlists);
  };

  const createPlaylist = async (playlist: {
    name: string;
    description?: string;
    isPublic?: boolean;
  }) => {
    const { data, error } = await playlistApi.createPlaylist(playlist);

    if (error || !data) {
      updateNotification('error', error || 'Failed to create playlist');
      return;
    }

    setPlaylists([...playlists, data.playlist]);
    updateNotification('success', 'Playlist created!');
  };

  const addMovie = async (playlistId: string, movieId: string) => {
    const { error } = await playlistApi.addMovieToPlaylist(playlistId, movieId);

    if (error) {
      updateNotification('error', error);
      return;
    }

    await fetchPlaylists();
    updateNotification('success', 'Movie added to playlist!');
  };

  const removeMovie = async (playlistId: string, movieId: string) => {
    const { error } = await playlistApi.removeMovieFromPlaylist(
      playlistId,
      movieId,
    );

    if (error) {
      updateNotification('error', error);
      return;
    }

    await fetchPlaylists();
    updateNotification('success', 'Movie removed from playlist!');
  };

  const deletePlaylist = async (playlistId: string) => {
    const { error } = await playlistApi.deletePlaylist(playlistId);

    if (error) {
      updateNotification('error', error);
      return;
    }

    setPlaylists(playlists.filter((p) => p.id !== playlistId));
    updateNotification('success', 'Playlist deleted!');
  };

  return (
    <PlaylistContext.Provider
      value={{
        playlists,
        isLoading,
        fetchPlaylists,
        createPlaylist,
        addMovie,
        removeMovie,
        deletePlaylist,
      }}
    >
      {children}
    </PlaylistContext.Provider>
  );
}
