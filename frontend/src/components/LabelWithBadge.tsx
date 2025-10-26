import type { ReactNode } from 'react';

import Label from './Label';

const LabelWithBadge = ({
  children,
  htmlFor,
  badge = 0,
}: {
  children: ReactNode;
  htmlFor?: string;
  badge?: number;
}) => {
  const renderBadge = () => {
    if (!badge) return null;
    return (
      <span className="absolute right-0 top-0 flex size-5 -translate-y-1 translate-x-2 items-center justify-center rounded-full bg-light-subtle text-xs text-white dark:bg-dark-subtle">
        {badge <= 9 ? badge : '9+'}
      </span>
    );
  };

  return (
    <div className="relative">
      <Label htmlFor={htmlFor || ''}>{children}</Label>
      {renderBadge()}
    </div>
  );
};

export default LabelWithBadge;
