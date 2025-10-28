import clsx from 'clsx';

export default function NextAndPrevButton({
  className = '',
  onNextClick,
  onPrevClick,
}: {
  className?: string;
  onNextClick: () => void;
  onPrevClick: () => void;
}) {
  return (
    <div className={clsx('flex items-center justify-end space-x-3', className)}>
      <Button onClick={onPrevClick} title="Previous" />
      <Button onClick={onNextClick} title="Next" />
    </div>
  );
}

const Button = ({ title, onClick }: { title: string; onClick: () => void }) => {
  return (
    <button
      type="button"
      className="text-primary hover:underline dark:text-white"
      onClick={onClick}
    >
      {title}
    </button>
  );
};
