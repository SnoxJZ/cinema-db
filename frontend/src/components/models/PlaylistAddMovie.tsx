import { useEffect, useState } from 'react';

import { useNotification, usePlaylist } from '@/hooks';

import ModalContainer from './ModalContainer';

const PlaylistAddMovie = ({
  visible,
  onClose,
  movieId,
  onCreatePlaylist,
}: {
  visible: boolean;
  onClose: () => void;
  movieId: string;
  onCreatePlaylist: () => void;
}) => {
  const [playlistId, setPlaylistId] = useState<string | undefined>(undefined);
  const { fetchPlaylists, addMovie, playlists, isLoading } = usePlaylist();
  const { updateNotification } = useNotification();

  useEffect(() => {
    if (visible) {
      fetchPlaylists();
    }
  }, [visible]);

  const handleAdd = async () => {
    if (!playlistId) {
      updateNotification('error', 'Please select a playlist');
      return;
    }

    await addMovie(playlistId, movieId);
    onClose();
  };

  return (
    <ModalContainer visible={visible} onClose={onClose} ignoreContainer>
      <div className="flex w-96 cursor-default flex-col space-y-3 rounded-md bg-secondary p-4">
        <h3 className="text-lg font-semibold text-primary dark:text-white">
          Select a playlist to add the movie to
        </h3>
        <select
          onChange={(e) => setPlaylistId(e.target.value)}
          value={playlistId}
          className="rounded border border-gray-300 bg-white px-4 py-2 dark:border-gray-600 dark:bg-secondary dark:text-white"
        >
          <option value="">Select playlist</option>
          {playlists.map((playlist) => (
            <option key={playlist.id} value={playlist.id}>
              {playlist.name}
            </option>
          ))}
        </select>
        <p className="dark:text-dark-subtle">
          or{' '}
          <button
            onClick={onCreatePlaylist}
            className="border-b border-transparent text-highlight hover:border-b-highlight dark:text-highlight-dark dark:hover:border-b-highlight-dark"
          >
            Create a new playlist
          </button>
        </p>
        <button
          onClick={handleAdd}
          disabled={isLoading}
          className="w-full rounded-md bg-primary p-2 text-white dark:bg-dark-subtle"
        >
          Add
        </button>
      </div>
    </ModalContainer>
  );
};
export default PlaylistAddMovie;
