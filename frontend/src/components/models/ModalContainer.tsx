import type { ReactNode } from 'react';

export default function ModalContainer({
  visible,
  ignoreContainer = false,
  children,
  onClose,
}: {
  visible: boolean;
  ignoreContainer?: boolean;
  children: ReactNode;
  onClose?: () => void;
}) {
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLDivElement).id === 'modal-container') {
      onClose?.();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      onClose?.();
    }
  };

  const renderChildren = () => {
    if (ignoreContainer) return children;

    return (
      <div className="custom-scroll-bar h-[40rem] w-[45rem] overflow-auto rounded bg-white p-2 dark:bg-primary">
        {children}
      </div>
    );
  };

  if (!visible) return null;
  return (
    <div
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      id="modal-container"
      role="button"
      tabIndex={0}
      className="fixed inset-0 flex cursor-default items-center justify-center bg-primary/50 backdrop-blur-sm dark:bg-white/50"
    >
      {renderChildren()}
    </div>
  );
}
