import type { ApiResponse, BlockDuration, MostRatedMovie, User } from '@/types';

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

export const getUsers = async (
  pageNo: number,
  limit: number,
  search?: string,
): Promise<
  ApiResponse<{
    users: User[];
    totalPages: number;
    currentPage: number;
  }>
> => {
  try {
    const token = getToken();
    const params = new URLSearchParams();
    params.set('page', pageNo.toString());
    params.set('limit', limit.toString());
    if (search) params.set('search', search);
    const { data } = await client(`/user/users?${params.toString()}`, {
      headers: { authorization: 'Bearer ' + token },
    });
    return { data, error: undefined };
  } catch (error) {
    return {
      data: undefined,
      error: catchError(error).error || 'An error occurred',
    };
  }
};

export const blockUser = async (
  userId: string,
  duration: BlockDuration,
): Promise<ApiResponse<{ message: string; user: User }>> => {
  try {
    const token = getToken();
    const { data } = await client(`/user/block/${userId}`, {
      method: 'PATCH',
      data: { duration },
      headers: { authorization: 'Bearer ' + token },
    });
    return { data, error: undefined };
  } catch (error) {
    return {
      data: undefined,
      error: catchError(error).error || 'An error occurred',
    };
  }
};

export const unblockUser = async (
  userId: string,
): Promise<ApiResponse<{ message: string; user: User }>> => {
  try {
    const token = getToken();
    const { data } = await client(`/user/unblock/${userId}`, {
      method: 'PATCH',
      headers: { authorization: 'Bearer ' + token },
    });
    return { data, error: undefined };
  } catch (error) {
    return {
      data: undefined,
      error: catchError(error).error || 'An error occurred',
    };
  }
};
