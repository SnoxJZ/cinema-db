import { type ReactNode } from 'react';

import AuthProvider from './AuthProvider';
import MoviesProvider from './MoviesProvider';
import NotificationProvider from './NotificationProvider';
import PlaylistProvider from './PlaylistProvider';
import SearchProvider from './SearchProvider';
import ThemeProvider from './ThemeProvider';

export default function ContextProviders({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <NotificationProvider>
      <SearchProvider>
        <MoviesProvider>
          <AuthProvider>
            <PlaylistProvider>
              <ThemeProvider>{children}</ThemeProvider>
            </PlaylistProvider>
          </AuthProvider>
        </MoviesProvider>
      </SearchProvider>
    </NotificationProvider>
  );
}
