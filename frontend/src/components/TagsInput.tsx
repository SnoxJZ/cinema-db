import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AiOutlineClose } from 'react-icons/ai';

export default function TagsInput({
  name,
  value,
  onChange,
}: {
  name: string;
  value: string[];
  onChange: (tags: string[]) => void;
}) {
  const [tag, setTag] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const input = useRef<HTMLInputElement>(null);
  const tagsInput = useRef<HTMLDivElement>(null);

  const handleOnChange = ({ target }: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = target;
    if (value !== ',') setTag(value);

    onChange(tags);
  };

  const handleKeyDown = ({ key }: React.KeyboardEvent<HTMLInputElement>) => {
    if (key === ',' || key === 'Enter') {
      if (!tag) return;

      if (tags.includes(tag)) return setTag('');

      setTags([...tags, tag]);
      setTag('');
    }

    if (key === 'Backspace' && !tag && tags.length) {
      const newTags = tags.filter((_, index) => index !== tags.length - 1);
      setTags([...newTags]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter((tag) => tag !== tagToRemove);
    setTags([...newTags]);
  };

  const handleOnFocus = () => {
    tagsInput.current?.classList.remove(
      'dark:border-dark-subtle',
      'border-light-subtle',
    );
    tagsInput.current?.classList.add('dark:border-white', 'border-primary');
  };

  const handleOnBlur = () => {
    tagsInput.current?.classList.add(
      'dark:border-dark-subtle',
      'border-light-subtle',
    );
    tagsInput.current?.classList.remove('dark:border-white', 'border-primary');
  };

  useEffect(() => {
    if (value.length) setTags(value);
  }, [value]);

  useEffect(() => {
    input.current?.scrollIntoView(false);
  }, [tag]);

  return (
    <div>
      <div
        ref={tagsInput}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        className="custom-scroll-bar flex h-10 w-full items-center space-x-2 overflow-x-auto rounded border-2 border-light-subtle bg-transparent px-2 text-white transition dark:border-dark-subtle"
      >
        {tags.map((t) => (
          <Tag onClick={() => removeTag(t)} key={t}>
            {t}
          </Tag>
        ))}
        <input
          ref={input}
          type="text"
          id={name}
          className="h-full grow bg-transparent outline-none dark:text-white"
          placeholder="Tag1, Tag2"
          value={tag}
          onChange={handleOnChange}
          onFocus={handleOnFocus}
          onBlur={handleOnBlur}
        />
      </div>
    </div>
  );
}

const Tag = ({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) => {
  return (
    <span className="flex items-center whitespace-nowrap bg-primary px-1 text-sm text-white dark:bg-white dark:text-primary">
      {children}
      <button onClick={onClick} type="button">
        <AiOutlineClose size={12} />
      </button>
    </span>
  );
};
