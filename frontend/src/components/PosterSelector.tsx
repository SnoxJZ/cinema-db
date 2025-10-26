const commonPosterUI =
  'flex justify-center items-center border border-dashed rounded aspect-video dark:border-dark-subtle border-light-subtle cursor-pointer';

export default function PosterSelector({
  name,
  accept,
  lable,
  selectedPoster,
  className,
  onChange,
}: {
  name: string;
  accept?: string;
  lable: string;
  selectedPoster?: string;
  className?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div>
      <input
        accept={accept}
        onChange={onChange}
        name={name}
        id={name}
        type="file"
        hidden
      />
      <label htmlFor={name}>
        {selectedPoster ? (
          <img
            className={commonPosterUI + ' object-cover' + className}
            src={selectedPoster}
            alt=""
          />
        ) : (
          <PosterUI className={className} label={lable} />
        )}
      </label>
    </div>
  );
}

const PosterUI = ({
  label,
  className,
}: {
  label: string;
  className?: string;
}) => {
  return (
    <div className={commonPosterUI + ' ' + className}>
      <span className="text-light-subtle dark:text-dark-subtle">{label}</span>
    </div>
  );
};
