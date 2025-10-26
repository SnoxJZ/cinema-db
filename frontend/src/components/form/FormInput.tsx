import { type InputHTMLAttributes } from 'react';

interface FormInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'name' | 'placeholder'> {
  name: string;
  label: string;
  placeholder: string;
}

export default function FormInput({
  name,
  label,
  placeholder,
  ...rest
}: FormInputProps) {
  return (
    <div className="flex flex-col-reverse">
      <input
        id={name}
        name={name}
        type="text"
        className="peer w-full rounded border-2 border-light-subtle bg-transparent p-1 text-lg outline-none transition focus:border-primary dark:border-dark-subtle dark:text-white dark:focus:border-white"
        placeholder={placeholder}
        {...rest}
      />
      <label
        className="self-start font-semibold text-light-subtle transition peer-focus:text-primary dark:text-dark-subtle dark:peer-focus:text-white"
        htmlFor={name}
      >
        {label}
      </label>
    </div>
  );
}
