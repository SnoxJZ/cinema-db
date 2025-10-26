import { useState } from 'react';
import { AiOutlineClose } from 'react-icons/ai';

const defaultInputStyle =
  'dark:border-dark-subtle border-light-subtle dark:focus:border-white focus:border-primary dark:text-white text-lg';
export default function AppSearchForm({
  showResetIcon,
  placeholder,
  inputClassName = defaultInputStyle,
  onSubmit,
  onReset,
}: {
  showResetIcon?: boolean;
  placeholder: string;
  inputClassName?: string;
  onSubmit: (value: string) => void;
  onReset?: () => void;
}) {
  const [value, setValue] = useState('');

  const handleOnSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(value);
  };

  const handleReset = () => {
    setValue('');
    onReset?.();
  };

  return (
    <form className="relative" onSubmit={handleOnSubmit}>
      <input
        type="text"
        className={
          'rounded border-2 bg-transparent px-2 py-1 text-sm outline-none transition' +
          inputClassName
        }
        placeholder={placeholder}
        value={value}
        onChange={({ target }) => setValue(target.value)}
      />

      {showResetIcon ? (
        <button
          onClick={handleReset}
          type="button"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-secondary dark:text-white"
        >
          <AiOutlineClose />
        </button>
      ) : null}
    </form>
  );
}
