import type { ReactNode } from 'react';

export default function Title({ children }: { children: ReactNode }) {
  return (
    <h1 className="text-center text-xl font-semibold text-secondary dark:text-white">
      {children}
    </h1>
  );
}
