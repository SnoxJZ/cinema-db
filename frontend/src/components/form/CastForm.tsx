import { useState } from 'react';

import { searchActor } from '@/api/actor';
import { useNotification, useSearch } from '@/hooks';
import type { Actor, ActorSearchResponse } from '@/types';
import { renderItem } from '@/utils/helper';
import { commonInputClasses } from '@/utils/theme';

import LiveSearch from '../LiveSearch.tsx';

interface CastInfo {
  actor: Actor;
  roleAs: string;
  leadActor: boolean;
}

const defaultCastInfo: CastInfo = {
  actor: { id: '', name: '', about: '', gender: '' },
  roleAs: '',
  leadActor: false,
};

export default function CastForm({
  onSubmit,
}: {
  onSubmit: (castInfo: CastInfo) => void;
}) {
  const [castInfo, setCastInfo] = useState<CastInfo>({ ...defaultCastInfo });
  const [profiles, setProfiles] = useState<
    { name: string; avatar: string; id: string }[] | undefined
  >(undefined);

  const { updateNotification } = useNotification();
  const { handleSearch, resetSearch } = useSearch();

  const handleOnChange = ({ target }: React.ChangeEvent<HTMLInputElement>) => {
    const { checked, name, value } = target;

    if (name === 'leadActor')
      return setCastInfo({ ...castInfo, leadActor: checked });

    setCastInfo({ ...castInfo, [name]: value });
  };

  const handleProfileSelect = (actor: {
    name: string;
    avatar: string;
    id: string;
  }) => {
    setCastInfo((prev) => ({
      ...prev,
      actor: {
        ...prev.actor,
        name: actor.name,
        avatar: { url: actor.avatar, public_id: actor.id },
      },
    }));
  };

  const handleSubmit = () => {
    const { actor, roleAs } = castInfo;
    if (!actor.name) return updateNotification('error', 'Cannot be empty!');
    if (!roleAs.trim()) return updateNotification('error', 'Cannot be empty!');

    onSubmit(castInfo);
    setCastInfo({ ...defaultCastInfo });
    resetSearch();
  };

  const handleProfileChange = ({
    target,
  }: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = target;

    setCastInfo((prev) => ({ ...prev, actor: { ...prev.actor, name: value } }));
    handleSearch(searchActor, value, (data: ActorSearchResponse) =>
      setProfiles(
        data.results.map((result) => ({
          name: result.name,
          avatar: result?.avatar?.url || '',
          id: result.avatar?.public_id || '',
        })),
      ),
    );
  };

  const { leadActor, actor, roleAs } = castInfo;
  return (
    <div className="flex items-center space-x-2">
      <input
        type="checkbox"
        name="leadActor"
        className="size-4"
        checked={leadActor}
        onChange={handleOnChange}
        title="Set as lead actor"
      />
      <LiveSearch
        placeholder="Search Profile"
        value={actor.name}
        results={profiles}
        onSelect={handleProfileSelect}
        renderItem={renderItem}
        onChange={handleProfileChange}
      />
      <span className="font-semibold text-light-subtle dark:text-dark-subtle">
        as
      </span>

      <div className="grow">
        <input
          type="text"
          className={commonInputClasses + ' rounded border-2 p-1 text-lg'}
          placeholder="Role"
          name="roleAs"
          value={roleAs}
          onChange={handleOnChange}
        />
      </div>

      <button
        onClick={handleSubmit}
        className="rounded bg-secondary px-1 text-white dark:bg-white dark:text-primary"
      >
        Add
      </button>
    </div>
  );
}
