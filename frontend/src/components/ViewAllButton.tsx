import type { ReactNode } from 'react';

const ViewAllBtn = ({
  visible,
  children,
  onClick,
}: {
  visible: boolean;
  children: ReactNode;
  onClick: () => void;
}) => {
  if (!visible) return null;
  return (
    <button
      onClick={onClick}
      type="button"
      className="text-primary transition hover:underline dark:text-white"
    >
      {children}
    </button>
  );
};

export default ViewAllBtn;
