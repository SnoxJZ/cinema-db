import { useEffect, useRef, useState, type ReactNode } from 'react';

import { commonInputClasses } from '../utils/theme';

interface LiveSearchResult {
  avatar: string;
  id: string;
  name: string;
}

interface LiveSearchProps {
  value?: string;
  placeholder?: string;
  results?: LiveSearchResult[];
  name?: string;
  resultContainerStyle?: string;
  selectedResultStyle?: string;
  inputStyle?: string;
  renderItem: (result: LiveSearchResult) => ReactNode;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelect?: (item: LiveSearchResult) => void;
}

export default function LiveSearch({
  value = '',
  placeholder = '',
  results = [],
  name,
  resultContainerStyle,
  selectedResultStyle,
  inputStyle,
  renderItem,
  onChange,
  onSelect,
}: LiveSearchProps) {
  const [displaySearch, setDisplaySearch] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [defaultValue, setDefaultValue] = useState('');

  const handleOnFocus = () => {
    if (results.length) setDisplaySearch(true);
  };

  const closeSearch = () => {
    setDisplaySearch(false);
    setFocusedIndex(-1);
  };

  const handleOnBlur = () => {
    closeSearch();
  };

  const handleSelection = (selectedItem: LiveSearchResult) => {
    if (selectedItem) {
      onSelect?.(selectedItem);
      closeSearch();
    }
  };

  const handleKeyDown = ({ key }: { key: string }) => {
    let nextCount;

    const keys = ['ArrowDown', 'ArrowUp', 'Enter', 'Escape'];
    if (!keys.includes(key)) return;

    // move selection up and down
    if (key === 'ArrowDown') {
      nextCount = (focusedIndex + 1) % results.length;
    }
    if (key === 'ArrowUp') {
      nextCount = (focusedIndex + results.length - 1) % results.length;
    }
    if (key === 'Escape') return closeSearch();

    if (key === 'Enter') return handleSelection(results[focusedIndex]);

    setFocusedIndex(nextCount ?? 0);
  };

  const getInputStyle = () => {
    return inputStyle
      ? inputStyle
      : commonInputClasses + ' border-2 rounded p-1 text-lg';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDefaultValue(e.target.value);
    onChange?.(e);
  };

  useEffect(() => {
    setDefaultValue(value);
  }, [value]);

  useEffect(() => {
    if (results.length) return setDisplaySearch(true);
    setDisplaySearch(false);
  }, [results.length]);

  return (
    <div
      tabIndex={-1}
      role="combobox"
      aria-expanded={displaySearch}
      aria-controls={name}
      aria-haspopup="listbox"
      onKeyDown={handleKeyDown}
      onBlur={handleOnBlur}
      className="relative outline-none"
    >
      <input
        type="text"
        id={name}
        name={name}
        className={getInputStyle()}
        placeholder={placeholder}
        onFocus={handleOnFocus}
        value={defaultValue}
        onChange={handleChange}
        onBlur={handleOnBlur}
        onKeyDown={handleKeyDown}
      />
      <SearchResults
        results={results}
        visible={displaySearch}
        focusedIndex={focusedIndex}
        onSelect={handleSelection}
        renderItem={renderItem}
        resultContainerStyle={resultContainerStyle}
        selectedResultStyle={selectedResultStyle}
      />
    </div>
  );
}

interface SearchResultsProps {
  visible: boolean;
  results: LiveSearchResult[];
  focusedIndex: number;
  onSelect: (item: LiveSearchResult) => void;
  renderItem: (result: LiveSearchResult) => ReactNode;
  resultContainerStyle?: string;
  selectedResultStyle?: string;
}

const SearchResults = ({
  visible,
  results,
  focusedIndex,
  onSelect,
  renderItem,
  resultContainerStyle,
  selectedResultStyle,
}: SearchResultsProps) => {
  const resultContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    resultContainer.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }, [focusedIndex]);

  if (!visible) return null;

  return (
    <div className="custom-scroll-bar absolute inset-x-0 top-10 z-50 mt-1 max-h-64 space-y-2 overflow-auto bg-white p-2 shadow-md dark:bg-secondary">
      {results.map((result, index) => {
        const getSelectedClass = () => {
          return selectedResultStyle
            ? selectedResultStyle
            : 'dark:bg-dark-subtle bg-light-subtle';
        };
        return (
          <ResultCard
            key={index.toString()}
            ref={resultContainer}
            item={result}
            renderItem={renderItem}
            resultContainerStyle={resultContainerStyle}
            selectedResultStyle={
              index === focusedIndex ? getSelectedClass() : ''
            }
            onMouseDown={() => onSelect(result)}
          />
        );
      })}
    </div>
  );
};

interface ResultCardProps {
  item: LiveSearchResult;
  renderItem: (result: LiveSearchResult) => ReactNode;
  resultContainerStyle?: string;
  selectedResultStyle?: string;
  onMouseDown: () => void;
  ref: React.RefObject<HTMLDivElement | null>;
}

const ResultCard = ({
  item,
  renderItem,
  resultContainerStyle,
  selectedResultStyle,
  onMouseDown,
  ref,
}: ResultCardProps) => {
  const getClasses = () => {
    if (resultContainerStyle)
      return resultContainerStyle + ' ' + selectedResultStyle;

    return (
      selectedResultStyle +
      ' cursor-pointer rounded overflow-hidden dark:hover:bg-dark-subtle hover:bg-light-subtle transition'
    );
  };
  return (
    <div
      onMouseDown={onMouseDown}
      ref={ref}
      className={getClasses()}
      role="option"
      aria-selected={!!selectedResultStyle?.length}
      tabIndex={-1}
    >
      {renderItem(item)}
    </div>
  );
};
