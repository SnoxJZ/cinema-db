import { useState } from 'react';

import type { ActorSearchResponse } from '@/types/index.js';

import { searchActor } from '../../api/actor.js';
import { useSearch } from '../../hooks/index.js';
import { renderItem } from '../../utils/helper.js';
import Label from '../Label.js';
import LiveSearch from '../LiveSearch.js';

export default function DirectorSelector({
  onSelect,
}: {
  onSelect: (profile: { id: string; name: string }) => void;
}) {
  const [value, setValue] = useState('');
  const [profiles, setProfiles] = useState<
    { name: string; avatar: string; id: string }[] | undefined
  >(undefined);

  const { handleSearch, resetSearch } = useSearch();

  const handleOnChange = ({ target }: { target: HTMLInputElement }) => {
    const { value } = target;
    setValue(value);
    handleSearch(searchActor, value, (data: ActorSearchResponse) =>
      setProfiles(
        data.results.map((result) => ({
          name: result.name,
          avatar: result?.avatar?.url || '',
          id: result.id || '',
        })),
      ),
    );
  };

  const handleOnSelect = (profile: {
    name: string;
    avatar: string;
    id: string;
  }) => {
    setValue(profile.name);
    onSelect(profile);
    setProfiles(undefined);
    resetSearch();
  };

  return (
    <div>
      <Label htmlFor="director">Director</Label>
      <LiveSearch
        name="director"
        value={value}
        placeholder="Search"
        results={profiles}
        renderItem={renderItem}
        onSelect={handleOnSelect}
        onChange={handleOnChange}
      />
    </div>
  );
}
