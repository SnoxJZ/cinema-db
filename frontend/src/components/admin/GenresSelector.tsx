import { ImTree } from 'react-icons/im';

export default function GenresSelector({
  badge,
  onClick,
}: {
  badge: number | undefined;
  onClick: () => void;
}) {
  const renderBadge = () => {
    if (!badge) return null;
    return (
      <span className="absolute right-0 top-0 flex size-5 -translate-y-1 translate-x-2 items-center justify-center rounded-full bg-light-subtle text-xs text-white dark:bg-dark-subtle">
        {badge <= 9 ? badge : '9+'}
      </span>
    );
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex items-center space-x-2 rounded border-2 border-light-subtle px-3 py-1 text-light-subtle transition hover:border-primary hover:text-primary dark:border-dark-subtle dark:text-dark-subtle dark:hover:border-white dark:hover:text-white"
    >
      <ImTree />
      <span>Select Genre</span>
      {renderBadge()}
    </button>
  );
}
