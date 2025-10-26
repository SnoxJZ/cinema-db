import { useState, type ChangeEvent } from 'react';

import type { ActorSearchResponse } from '@/types';

import { searchActor } from '../api/actor';
import { useSearch } from '../hooks';
import { renderItem } from '../utils/helper';

import LiveSearch from './LiveSearch';

export default function WriterSelector({
  onSelect,
}: {
  onSelect: (profile: { id: string; name: string; avatar: string }) => void;
}) {
  const [value, setValue] = useState('');
  const [profiles, setProfiles] = useState<
    { name: string; avatar: string; id: string }[] | undefined
  >(undefined);

  const { handleSearch, resetSearch } = useSearch();

  const handleOnChange = ({ target }: ChangeEvent<HTMLInputElement>) => {
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
    setValue('');
    onSelect(profile);
    setProfiles([]);
    resetSearch();
  };

  return (
    <LiveSearch
      name="writers"
      placeholder="Search"
      results={profiles}
      renderItem={renderItem}
      onSelect={handleOnSelect}
      onChange={handleOnChange}
      value={value}
    />
  );
}
