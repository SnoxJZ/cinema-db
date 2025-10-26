import { createContext, useState, type ReactNode } from 'react';

import { useNotification } from '../hooks';
import type { ApiResponse } from '../types';

interface SearchContextType<T = unknown> {
  handleSearch: <T>(
    method: (query: string) => Promise<ApiResponse<T>>,
    query: string,
    updaterFun?: (results: T) => void,
  ) => void;
  resetSearch: () => void;
  searching: boolean;
  resultNotFound: boolean;
  results: T;
}

export const SearchContext = createContext<SearchContextType | null>(null);

let timeoutId: ReturnType<typeof setTimeout> | null = null;
const debounce = <T,>(
  func: (
    method: (query: string) => Promise<ApiResponse<T>>,
    query: string,
    updaterFun?: (results: T) => void,
  ) => Promise<void>,
  delay: number,
) => {
  return (
    method: (query: string) => Promise<ApiResponse<T>>,
    query: string,
    updaterFun?: (results: T) => void,
  ) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(method, query, updaterFun);
    }, delay);
  };
};

export default function SearchProvider({ children }: { children: ReactNode }) {
  const [searching, setSearching] = useState<boolean>(false);
  const [results, setResults] = useState<unknown>(null);
  const [resultNotFound, setResultNotFound] = useState<boolean>(false);

  const { updateNotification } = useNotification();

  const search = async <T,>(
    method: (query: string) => Promise<ApiResponse<T>>,
    query: string,
    updaterFun?: (results: T) => void,
  ) => {
    const { error, data } = await method(query);
    if (error) return updateNotification('error', error);

    if (!data || (Array.isArray(data) && !data.length)) {
      setResults(Array.isArray(data) ? [] : null);
      if (updaterFun) updaterFun(data as T);
      return setResultNotFound(true);
    }

    setResultNotFound(false);
    setResults(data);
    if (updaterFun) updaterFun(data);
  };

  const debounceFunc = debounce(search, 300);

  const handleSearch = <T,>(
    method: (query: string) => Promise<ApiResponse<T>>,
    query: string,
    updaterFun?: (results: T) => void,
  ) => {
    setSearching(true);
    if (!query.trim()) {
      if (updaterFun) updaterFun(undefined as T);
      return resetSearch();
    }

    debounceFunc(method, query, updaterFun);
  };

  const resetSearch = () => {
    setSearching(false);
    setResults([]);
    setResultNotFound(false);
  };

  return (
    <SearchContext.Provider
      value={{ handleSearch, resetSearch, searching, resultNotFound, results }}
    >
      {children}
    </SearchContext.Provider>
  );
}
