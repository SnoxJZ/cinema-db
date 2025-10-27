import { useState } from 'react';

import { usePlaylist } from '@/hooks';

import ModalContainer from './ModalContainer';

const PlaylistCreate = ({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) => {
  const [playlistName, setPlaylistName] = useState('');
  const [playlistDescription, setPlaylistDescription] = useState('');

  const { createPlaylist } = usePlaylist();

  const handleCreatePlaylist = () => {
    createPlaylist({ name: playlistName, description: playlistDescription });
    onClose();
  };
  return (
    <ModalContainer visible={visible} onClose={onClose} ignoreContainer>
      <div className="flex w-96 cursor-default flex-col space-y-3 rounded-md bg-secondary p-4">
        <h3 className="text-lg font-semibold text-primary dark:text-white">
          Create Playlist
        </h3>
        <input
          className="rounded border border-gray-300 bg-white px-4 py-1 dark:border-gray-600 dark:bg-secondary dark:text-white"
          type="text"
          placeholder="Playlist Name"
          value={playlistName}
          onChange={(e) => setPlaylistName(e.target.value)}
        />
        <textarea
          className="rounded border border-gray-300 bg-white px-4 py-1 dark:border-gray-600 dark:bg-secondary dark:text-white"
          placeholder="Playlist Description"
          value={playlistDescription}
          onChange={(e) => setPlaylistDescription(e.target.value)}
        />
        <button
          onClick={handleCreatePlaylist}
          className="w-full rounded-md bg-primary p-2 text-white dark:bg-dark-subtle"
        >
          Create
        </button>
      </div>
    </ModalContainer>
  );
};

export default PlaylistCreate;
