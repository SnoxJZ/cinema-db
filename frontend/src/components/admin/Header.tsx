import { useEffect, useRef, useState } from 'react';
import { AiOutlinePlus } from 'react-icons/ai';
import { BsFillSunFill } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';

import { useTheme } from '@/hooks';

import AppSearchForm from '../form/AppSearchForm';

export default function Header({
  onAddActorClick,
  onAddMovieClick,
}: {
  onAddActorClick: () => void;
  onAddMovieClick: () => void;
}) {
  const [showOptions, setShowOptions] = useState(false);
  const { toggleTheme } = useTheme();

  const navigate = useNavigate();

  const options = [
    { title: 'Add Movie', onClick: onAddMovieClick },
    { title: 'Add Actor', onClick: onAddActorClick },
  ];

  const handleSearchSubmit = (query: string) => {
    if (!query.trim()) return;

    navigate('/search?title=' + query);
  };

  return (
    <div className="relative flex items-center justify-between p-5">
      <AppSearchForm
        onSubmit={handleSearchSubmit}
        placeholder="Search Movie..."
      />

      <div className="flex items-center space-x-3">
        <button
          onClick={toggleTheme}
          className="text-light-subtle dark:text-white"
        >
          <BsFillSunFill size={24} />
        </button>

        <button
          onClick={() => setShowOptions(true)}
          className="flex items-center space-x-2 rounded border-2 border-light-subtle px-3 py-1 text-lg font-semibold text-light-subtle transition hover:opacity-80 dark:border-dark-subtle dark:text-dark-subtle"
        >
          <span>Create</span>
          <AiOutlinePlus />
        </button>

        <CreateOptions
          visible={showOptions}
          onClose={() => setShowOptions(false)}
          options={options}
        />
      </div>
    </div>
  );
}

const CreateOptions = ({
  options,
  visible,
  onClose,
}: {
  options: { title: string; onClick: () => void }[];
  visible: boolean;
  onClose: () => void;
}) => {
  const container = useRef<HTMLDivElement>(null);
  const containerID = 'options-container';

  useEffect(() => {
    const handleClose = (e: MouseEvent) => {
      if (!visible) return;
      const { parentElement, id } = e.target as HTMLElement;

      if (parentElement?.id === containerID || id === containerID) return;

      if (container.current) {
        if (!container.current.classList.contains('animate-scale'))
          container.current.classList.add('animate-scale-reverse');
      }
    };

    document.addEventListener('click', handleClose);
    return () => {
      document.removeEventListener('click', handleClose);
    };
  }, [visible]);

  const handleClick = (fn: () => void) => {
    fn();
    onClose();
  };

  if (!visible) return null;

  return (
    <div
      id={containerID}
      ref={container}
      className="animate-scale absolute right-0 top-12 z-50 flex flex-col space-y-3 rounded bg-white p-5 drop-shadow-lg dark:bg-secondary"
      onAnimationEnd={(e: React.AnimationEvent<HTMLDivElement>) => {
        if (
          (e.target as HTMLElement).classList.contains('animate-scale-reverse')
        )
          onClose();
        (e.target as HTMLElement).classList.remove('animate-scale');
      }}
    >
      {options.map(({ title, onClick }) => {
        return (
          <Option key={title} onClick={() => handleClick(onClick)}>
            {title}
          </Option>
        );
      })}
    </div>
  );
};

const Option = ({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) => {
  return (
    <button
      onClick={onClick}
      className="text-secondary transition hover:opacity-80 dark:text-white"
    >
      {children}
    </button>
  );
};
