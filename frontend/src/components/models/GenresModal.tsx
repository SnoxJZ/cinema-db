import { type ReactNode, useEffect, useState } from 'react';

import genres from '@/utils/genres';

import Submit from '../form/Submit';

import ModalContainer from './ModalContainer';

export default function GenresModal({
  visible,
  previousSelection,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  previousSelection: string[];
  onClose: () => void;
  onSubmit: (genres: string[]) => void;
}) {
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  const handleGenresSelector = (gen: string) => {
    let newGenres: string[] = [];

    if (selectedGenres.includes(gen))
      newGenres = selectedGenres.filter((genre) => genre !== gen);
    else newGenres = [...selectedGenres, gen];

    setSelectedGenres([...newGenres]);
  };

  const handleSubmit = () => {
    onSubmit(selectedGenres);
    onClose();
  };

  const handleClose = () => {
    setSelectedGenres(previousSelection);
    onClose();
  };

  useEffect(() => {
    setSelectedGenres(previousSelection);
  }, []);

  return (
    <ModalContainer visible={visible} onClose={handleClose}>
      <div className="flex h-full flex-col justify-between">
        <div>
          <h1 className="text-center text-2xl font-semibold text-primary dark:text-white">
            Select Genre
          </h1>

          <div className="space-y-3">
            {genres.map((gen) => {
              return (
                <Genre
                  onClick={() => handleGenresSelector(gen)}
                  selected={selectedGenres.includes(gen)}
                  key={gen}
                >
                  {gen}
                </Genre>
              );
            })}
          </div>
        </div>

        <div className="w-56 self-end">
          <Submit value="Select" type="button" onClick={handleSubmit} />
        </div>
      </div>
    </ModalContainer>
  );
}

const Genre = ({
  children,
  selected,
  onClick,
}: {
  children: ReactNode;
  selected: boolean;
  onClick: () => void;
}) => {
  const getSelectedStyle = () => {
    return selected
      ? 'dark:bg-white dark:text-primary bg-light-subtle text-white'
      : 'text-primary dark:text-white';
  };

  return (
    <button
      onClick={onClick}
      className={
        getSelectedStyle() +
        ' mr-3 rounded border-2 border-light-subtle p-1 dark:border-dark-subtle'
      }
    >
      {children}
    </button>
  );
};
