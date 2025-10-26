export default function Selector({
  name,
  options,
  value,
  label,
  onChange,
}: {
  name: string;
  options: { title: string; value: string }[];
  value: string;
  label: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}) {
  return (
    <select
      className="rounded border-2 border-light-subtle bg-transparent p-1 pr-10 text-light-subtle outline-none transition focus:border-primary focus:text-primary dark:border-dark-subtle dark:bg-primary dark:text-dark-subtle dark:focus:border-white dark:focus:text-white"
      id={name}
      name={name}
      value={value}
      onChange={onChange}
    >
      <option value="">{label}</option>
      {options.map(({ title, value }) => {
        return (
          <option key={title} value={value}>
            {title}
          </option>
        );
      })}
    </select>
  );
}
