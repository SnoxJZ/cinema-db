import type { ApiResponse, MostRatedMovie } from '@/types';

import { catchError, getToken } from '../utils/helper';

import client from './client';

export const getAppInfo = async (): Promise<
  ApiResponse<{
    appInfo: { movieCount: number; reviewCount: number; userCount: number };
  }>
> => {
  try {
    const token = getToken();
    const { data } = await client('/admin/app-info', {
      headers: {
        authorization: 'Bearer ' + token,
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

export const getMostRatedMovies = async (): Promise<
  ApiResponse<{
    movies: MostRatedMovie[];
  }>
> => {
  try {
    const token = getToken();
    const { data } = await client('/admin/most-rated', {
      headers: {
        authorization: 'Bearer ' + token,
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
