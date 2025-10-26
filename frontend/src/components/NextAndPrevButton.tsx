export default function NextAndPrevButton({
  className = '',
  onNextClick,
  onPrevClick,
}: {
  className?: string;
  onNextClick: () => void;
  onPrevClick: () => void;
}) {
  const getClasses = () => {
    return 'flex justify-end items-center space-x-3 ';
  };

  return (
    <div className={getClasses() + className}>
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
