import { useEffect, useRef, useState } from 'react';
import { AiOutlinePlus, AiOutlineHome } from 'react-icons/ai';
import { BiMoviePlay } from 'react-icons/bi';
import { FaUser, FaUserNinja } from 'react-icons/fa';
import { NavLink, useNavigate } from 'react-router-dom';

import AppSearchForm from '../form/AppSearchForm';

export default function Header({
  onAddActorClick,
  onAddMovieClick,
}: {
  onAddActorClick: () => void;
  onAddMovieClick: () => void;
}) {
  const [showOptions, setShowOptions] = useState(false);

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
    <div className="relative flex flex-wrap items-center justify-between bg-white p-5 dark:bg-primary">
      <ul className="flex flex-wrap items-center space-x-2 sm:space-x-4">
        <li>
          <NavItem to="/admin">
            <AiOutlineHome />
            <span>Dashboard</span>
          </NavItem>
        </li>
        <li>
          <NavItem to="/admin/movies">
            <BiMoviePlay />
            <span>Movies</span>
          </NavItem>
        </li>
        <li>
          <NavItem to="/admin/actors">
            <FaUserNinja />
            <span>Actors</span>
          </NavItem>
        </li>
        <li>
          <NavItem to="/admin/users">
            <FaUser />
            <span>Users</span>
          </NavItem>
        </li>
      </ul>
      <div className="flex items-center space-x-3">
        <AppSearchForm
          onSubmit={handleSearchSubmit}
          placeholder="Search Movie..."
        />
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

const NavItem = ({
  children,
  to,
}: {
  children: React.ReactNode;
  to: string;
}) => {
  const commonClasses =
    ' flex items-center text-lg space-x-2 p-2 hover:opacity-80';
  return (
    <NavLink
      className={({ isActive }) =>
        (isActive ? 'text-primary dark:text-white' : 'text-gray-400') +
        commonClasses
      }
      to={to}
    >
      {children}
    </NavLink>
  );
};
