import clsx from 'clsx';

export default function CustomButtonLink({
  label,
  clickable = true,
  onClick,
  className,
  isLast = true,
}: {
  label: string;
  clickable?: boolean;
  onClick?: () => void;
  className?: string;
  isLast?: boolean;
}) {
  const clazzName = clickable ? ' hover:underline' : ' cursor-default';

  return (
    <button
      onClick={onClick}
      className={clsx(
        'whitespace-nowrap text-highlight dark:text-highlight-dark',
        clazzName,
        className,
      )}
      type="button"
    >
      {label}
      {!isLast && ','}
    </button>
  );
}
