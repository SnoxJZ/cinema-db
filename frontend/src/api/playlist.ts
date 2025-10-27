import type { ApiResponse, PlaylistI } from '@/types';
import { catchError, getToken } from '@/utils/helper';

import client from './client';

export const createPlaylist = async (playlist: {
  name: string;
  description?: string;
  isPublic?: boolean;
}): Promise<
  ApiResponse<{ playlist: { id: string; name: string; isPublic: boolean } }>
> => {
  const token = getToken();
  try {
    const { data } = await client.post('/playlist/create', playlist, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return { data, error: undefined };
  } catch (error) {
    return {
      data: undefined,
      error: catchError(error).error || 'An error occurred',
    };
  }
};

export const addMovieToPlaylist = async (
  playlistId: string,
  movieId: string,
): Promise<ApiResponse<{ message: string }>> => {
  const token = getToken();
  try {
    const { data } = await client.post(
      '/playlist/add-movie',
      {
        playlistId,
        movieId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return { data, error: undefined };
  } catch (error) {
    return {
      data: undefined,
      error: catchError(error).error || 'An error occurred',
    };
  }
};

export const removeMovieFromPlaylist = async (
  playlistId: string,
  movieId: string,
): Promise<ApiResponse<{ message: string }>> => {
  const token = getToken();
  try {
    const { data } = await client.post(
      '/playlist/remove-movie',
      {
        playlistId,
        movieId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return { data, error: undefined };
  } catch (error) {
    return {
      data: undefined,
      error: catchError(error).error || 'An error occurred',
    };
  }
};

export const getPlaylists = async (): Promise<
  ApiResponse<{ playlists: { id: string; name: string; isPublic: boolean }[] }>
> => {
  const token = getToken();
  try {
    const { data } = await client.get('/playlist', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return { data, error: undefined };
  } catch (error) {
    return {
      data: undefined,
      error: catchError(error).error || 'An error occurred',
    };
  }
};

export const deletePlaylist = async (
  playlistId: string,
): Promise<ApiResponse<{ message: string }>> => {
  const token = getToken();
  try {
    const { data } = await client.delete(`/playlist/${playlistId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return { data, error: undefined };
  } catch (error) {
    return {
      data: undefined,
      error: catchError(error).error || 'An error occurred',
    };
  }
};

export const getPlaylist = async (
  playlistId: string,
): Promise<ApiResponse<{ playlist: PlaylistI }>> => {
  const token = getToken();
  try {
    const { data } = await client.get(`/playlist/${playlistId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return { data, error: undefined };
  } catch (error) {
    return {
      data: undefined,
      error: catchError(error).error || 'An error occurred',
    };
  }
};
