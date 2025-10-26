import type { ReactNode } from 'react';

export default function GridContainer({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={
        'grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6 ' + className
      }
    >
      {children}
    </div>
  );
}
