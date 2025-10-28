import { useState } from 'react';
import { BsTrash, BsPencilSquare, BsBoxArrowUpRight } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';

import { deleteMovie } from '@/api/movie';
import { useAuth, useNotification } from '@/hooks';
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
  const { isAdmin } = useAuth();

  const { updateNotification } = useNotification();
  const navigate = useNavigate();
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
        onOpenClick={() => navigate(`/movie/${movie.id}`)}
        isAdmin={isAdmin}
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
  isAdmin,
}: {
  movie: MovieListItemType;
  onDeleteClick: () => void;
  onEditClick: () => void;
  onOpenClick?: () => void;
  isAdmin: boolean;
}) => {
  const { poster, title, responsivePosters, genres = [], status } = movie;
  return (
    <div className="flex w-full flex-wrap items-center justify-between gap-2 border-b">
      <div className="flex items-center sm:max-w-[50%]">
        <div className="w-24 shrink-0">
          <img
            className="w-full"
            src={getPoster(responsivePosters) || poster}
            alt={title}
          />
        </div>

        <div className="w-full pl-5">
          <h1 className="text-base font-semibold text-primary dark:text-white md:text-lg">
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
      </div>

      <div className="flex items-center justify-center gap-1">
        <p className="text-primary dark:text-white">{status}</p>

        <div className="flex items-center justify-center gap-1 text-lg text-primary dark:text-white max-sm:flex-wrap">
          {isAdmin && (
            <button onClick={onDeleteClick} type="button">
              <BsTrash className="size-4 text-red-500" />
            </button>
          )}
          <button onClick={onEditClick} type="button">
            <BsPencilSquare className="size-4 text-orange-400" />
          </button>
          <button onClick={onOpenClick} type="button">
            <BsBoxArrowUpRight className="size-4 text-blue-500" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MovieListItem;
