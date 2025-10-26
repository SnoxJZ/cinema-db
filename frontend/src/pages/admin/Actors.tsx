import { useEffect, useState } from 'react';
import { BsPencilSquare, BsTrash } from 'react-icons/bs';

import { deleteActor, getActors, searchActor } from '@/api/actor';
import { useNotification, useSearch } from '@/hooks';
import type { Actor } from '@/types';

import AppSearchForm from '../../components/form/AppSearchForm';
import ConfirmModal from '../../components/models/ConfirmModal';
import UpdateActor from '../../components/models/UpdateActor';
import NextAndPrevButton from '../../components/NextAndPrevButton';
import NotFoundText from '../../components/NotFoundText';

let currentPageNo = 0;
const limit = 20;

export default function Actors() {
  const [actors, setActors] = useState<Actor[] | undefined>(undefined);
  const [results, setResults] = useState<Actor[] | undefined>(undefined);
  const [reachedToEnd, setReachedToEnd] = useState(false);
  const [busy, setBusy] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Actor | null>(null);
  const { updateNotification } = useNotification();
  const { handleSearch, resetSearch, resultNotFound } = useSearch();

  const fetchActors = async (pageNo: number) => {
    const { data, error } = await getActors(pageNo, limit);
    if (error || !data)
      return updateNotification('error', error || 'An error occurred');

    if (!data.profiles.length) {
      currentPageNo = pageNo - 1;
      return setReachedToEnd(true);
    }

    setActors([...data.profiles]);
  };

  const handleOnNextClick = () => {
    if (reachedToEnd) return;
    currentPageNo += 1;
    fetchActors(currentPageNo);
  };

  const handleOnPrevClick = () => {
    if (currentPageNo <= 0) return;
    if (reachedToEnd) setReachedToEnd(false);

    currentPageNo -= 1;
    fetchActors(currentPageNo);
  };

  const handleOnEditClick = (profile: Actor) => {
    setShowUpdateModal(true);
    setSelectedProfile(profile);
  };

  const hideUpdateModal = () => {
    setShowUpdateModal(false);
  };

  const handleOnSearchSubmit = (value: string) => {
    const searchWrapper = async (query: string) => {
      const { data, error } = await searchActor(query);
      return { error, results: data?.results || [] };
    };

    handleSearch(searchWrapper, value, (results) =>
      setResults(results as Actor[]),
    );
  };

  const handleSearchFormReset = () => {
    resetSearch();
    setResults(undefined);
  };

  const handleOnActorUpdate = (profile: Actor) => {
    const updatedActors = actors?.map((actor) => {
      if (profile.id === actor.id) {
        return profile;
      }

      return actor;
    });
    if (updatedActors) {
      setActors([...updatedActors]);
    }
  };

  const handleOnDeleteClick = (profile: Actor) => {
    setSelectedProfile(profile);
    setShowConfirmModal(true);
  };

  const handleOnDeleteConfirm = async () => {
    if (!selectedProfile) return;
    setBusy(true);
    const { error, data } = await deleteActor(selectedProfile.id);
    setBusy(false);
    if (error) return updateNotification('error', error);
    updateNotification(
      'success',
      data?.message || 'Actor deleted successfully',
    );
    hideConfirmModal();
    fetchActors(currentPageNo);
  };

  const hideConfirmModal = () => setShowConfirmModal(false);

  useEffect(() => {
    fetchActors(currentPageNo);
  }, []);

  return (
    <>
      <div className="p-5">
        <div className="mb-5 flex justify-end">
          <AppSearchForm
            onReset={handleSearchFormReset}
            onSubmit={handleOnSearchSubmit}
            placeholder="Search Actor..."
            showResetIcon={!!results?.length || resultNotFound}
          />
        </div>
        <NotFoundText visible={resultNotFound} text="Not found" />

        <div className="grid grid-cols-4 gap-5">
          {results?.length || resultNotFound
            ? results?.map((actor) => (
                <ActorProfile
                  profile={actor}
                  key={actor.id}
                  onEditClick={() => handleOnEditClick(actor)}
                  onDeleteClick={() => handleOnDeleteClick(actor)}
                />
              ))
            : actors?.map((actor) => (
                <ActorProfile
                  profile={actor}
                  key={actor.id}
                  onEditClick={() => handleOnEditClick(actor)}
                  onDeleteClick={() => handleOnDeleteClick(actor)}
                />
              ))}
        </div>

        {!results?.length && !resultNotFound ? (
          <NextAndPrevButton
            className="mt-5"
            onNextClick={handleOnNextClick}
            onPrevClick={handleOnPrevClick}
          />
        ) : null}
      </div>

      <ConfirmModal
        visible={showConfirmModal}
        title="Are you sure?"
        subtitle="This action will permanently remove this profile!"
        busy={busy}
        onConfirm={handleOnDeleteConfirm}
        onCancel={hideConfirmModal}
      />

      <UpdateActor
        visible={showUpdateModal}
        onClose={hideUpdateModal}
        initialState={selectedProfile}
        onSuccess={handleOnActorUpdate}
      />
    </>
  );
}

const ActorProfile = ({
  profile,
  onEditClick,
  onDeleteClick,
}: {
  profile: Actor;
  onEditClick: () => void;
  onDeleteClick: () => void;
}) => {
  const [showOptions, setShowOptions] = useState(false);
  const acceptedNameLength = 15;

  const handleOnMouseEnter = () => {
    setShowOptions(true);
  };

  const handleOnMouseLeave = () => {
    setShowOptions(false);
  };

  const getName = (name: string) => {
    if (name.length <= acceptedNameLength) return name;

    return name.substring(0, acceptedNameLength) + '..';
  };

  const { name, about = '', avatar } = profile;

  if (!profile) return null;

  return (
    <div className="h-20 overflow-hidden rounded bg-white shadow dark:bg-secondary dark:shadow">
      <div
        onMouseEnter={handleOnMouseEnter}
        onMouseLeave={handleOnMouseLeave}
        className="relative flex cursor-pointer"
      >
        <img
          src={avatar?.url}
          alt={name}
          className="aspect-square w-20 object-cover"
        />

        <div className="px-2">
          <h1 className="whitespace-nowrap text-xl font-semibold text-primary dark:text-white">
            {getName(name)}
          </h1>
          <p className="text-primary opacity-70 dark:text-white">
            {about.substring(0, 50)}
          </p>
        </div>
        <Options
          onEditClick={onEditClick}
          onDeleteClick={onDeleteClick}
          visible={showOptions}
        />
      </div>
    </div>
  );
};

const Options = ({
  visible,
  onDeleteClick,
  onEditClick,
}: {
  visible: boolean;
  onDeleteClick: () => void;
  onEditClick: () => void;
}) => {
  if (!visible) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center space-x-5 bg-primary/25 backdrop-blur-sm">
      <button
        onClick={onDeleteClick}
        className="rounded-full bg-white p-2 text-primary transition hover:opacity-80"
        type="button"
      >
        <BsTrash />
      </button>
      <button
        onClick={onEditClick}
        className="rounded-full bg-white p-2 text-primary transition hover:opacity-80"
        type="button"
      >
        <BsPencilSquare />
      </button>
    </div>
  );
};
