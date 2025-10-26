import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';

export default function CustomLink({
  to,
  children,
}: {
  to: string;
  children: ReactNode;
}) {
  return (
    <Link
      className="text-light-subtle transition hover:text-primary dark:text-dark-subtle dark:hover:text-white"
      to={to}
    >
      {children}
    </Link>
  );
}
