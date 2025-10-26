import clsx from 'clsx';
import type { ButtonHTMLAttributes } from 'react';
import { ImSpinner3 } from 'react-icons/im';

export default function Submit({
  value,
  busy,
  type,
  onClick,
  className,
}: {
  value: string;
  busy?: boolean;
  type?: ButtonHTMLAttributes<HTMLButtonElement>['type'];
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type={type || 'submit'}
      className={clsx(
        'flex h-10 w-full cursor-pointer items-center justify-center rounded bg-secondary text-lg font-semibold text-white transition hover:bg-secondary/90 dark:bg-white dark:text-secondary dark:hover:bg-white/90',
        className,
      )}
      onClick={onClick}
    >
      {busy ? <ImSpinner3 className="animate-spin" /> : value}
    </button>
  );
}
