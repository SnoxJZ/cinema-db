import { useState } from 'react';
import { BsTrash, BsPencilSquare, BsBoxArrowUpRight } from 'react-icons/bs';

import { deleteMovie } from '@/api/movie';
import { useNotification } from '@/hooks';
import type { MovieListItem as MovieListItemType } from '@/types';
import { getPoster } from '@/utils/helper';

import ConfirmModal from './models/ConfirmModal';
import UpdateMovie from './models/UpdateMovie';

const MovieListItem = ({
  movie,
  onUIUpdate,
}: {
  movie: MovieListItemType;
  onUIUpdate: () => Promise<void>;
}) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [busy, setBusy] = useState(false);
  const [selectedMovieId, setSelectedMovieId] = useState<string | null>(null);

  const { updateNotification } = useNotification();

  const handleOnDeleteConfirm = async () => {
    setBusy(true);
    const { error, data } = await deleteMovie(movie.id);
    setBusy(false);

    if (error || !data)
      return updateNotification('error', error || 'An error occurred');

    hideConfirmModal();
    updateNotification('success', data.message);
    onUIUpdate();
  };

  const handleOnEditClick = () => {
    setShowUpdateModal(true);
    setSelectedMovieId(movie.id);
  };

  const handleOnUpdate = () => {
    onUIUpdate();
    setShowUpdateModal(false);
    setSelectedMovieId(null);
  };

  const displayConfirmModal = () => setShowConfirmModal(true);
  const hideConfirmModal = () => setShowConfirmModal(false);

  return (
    <>
      <MovieCard
        movie={movie}
        onDeleteClick={displayConfirmModal}
        onEditClick={handleOnEditClick}
      />
      <div className="p-0">
        <ConfirmModal
          visible={showConfirmModal}
          onConfirm={handleOnDeleteConfirm}
          onCancel={hideConfirmModal}
          title="Are you sure?"
          subtitle="This action will permanently remove this movie!"
          busy={busy}
        />
        <UpdateMovie
          movieId={selectedMovieId}
          visible={showUpdateModal}
          onSuccess={handleOnUpdate}
        />
      </div>
    </>
  );
};

const MovieCard = ({
  movie,
  onDeleteClick,
  onEditClick,
  onOpenClick,
}: {
  movie: MovieListItemType;
  onDeleteClick: () => void;
  onEditClick: () => void;
  onOpenClick?: () => void;
}) => {
  const { poster, title, responsivePosters, genres = [], status } = movie;
  return (
    <table className="w-full border-b">
      <tbody>
        <tr>
          <td>
            <div className="w-24">
              <img
                className="aspect-video w-full"
                src={getPoster(responsivePosters) || poster}
                alt={title}
              />
            </div>
          </td>

          <td className="w-full pl-5">
            <div>
              <h1 className="text-lg font-semibold text-primary dark:text-white">
                {title}
              </h1>
              <div className="space-x-1">
                {genres.map((g, index) => {
                  return (
                    <span
                      key={g + index}
                      className="text-xs text-primary dark:text-white"
                    >
                      {g}
                    </span>
                  );
                })}
              </div>
            </div>
          </td>

          <td className="px-5">
            <p className="text-primary dark:text-white">{status}</p>
          </td>

          <td>
            <div className="flex items-center space-x-3 text-lg text-primary dark:text-white">
              <button onClick={onDeleteClick} type="button">
                <BsTrash />
              </button>
              <button onClick={onEditClick} type="button">
                <BsPencilSquare />
              </button>
              <button onClick={onOpenClick} type="button">
                <BsBoxArrowUpRight />
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  );
};

export default MovieListItem;
