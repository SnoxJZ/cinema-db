import { type ReactNode } from 'react';

export default function FormContainer({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-0 -z-10 flex items-center justify-center bg-white dark:bg-primary">
      {children}
    </div>
  );
}
