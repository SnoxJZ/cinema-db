import clsx from 'clsx';
import type { ReactNode } from 'react';

export default function Container({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={clsx('mx-auto max-w-screen-xl', className)}>{children}</div>
  );
}
