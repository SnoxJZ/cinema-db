import type { ReactNode } from 'react';

const Label = ({
  children,
  htmlFor,
}: {
  children: ReactNode;
  htmlFor: string;
}) => {
  return (
    <label
      htmlFor={htmlFor}
      className="font-semibold text-light-subtle dark:text-dark-subtle"
    >
      {children}
    </label>
  );
};

export default Label;
