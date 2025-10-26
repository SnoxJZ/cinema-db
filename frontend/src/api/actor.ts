import type {
  ActorResponse,
  ActorsResponse,
  ActorSearchResponse,
  ApiResponse,
} from '@/types';
import { catchError, getToken } from '@/utils/helper';

import client from './client';

export const createActor = async (
  formData: FormData,
): Promise<ApiResponse<ActorResponse>> => {
  const token = getToken();
  try {
    const { data } = await client.post('/actor/create', formData, {
      headers: {
        authorization: 'Bearer ' + token,
        'content-type': 'multipart/form-data',
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

export const searchActor = async (
  query: string,
): Promise<ApiResponse<ActorSearchResponse>> => {
  const token = getToken();
  try {
    const { data } = await client(`/actor/search?name=${query}`, {
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

export const updateActor = async (
  id: string,
  formData: FormData,
): Promise<ApiResponse<ActorResponse>> => {
  const token = getToken();
  try {
    const { data } = await client.post('/actor/update/' + id, formData, {
      headers: {
        authorization: 'Bearer ' + token,
        'content-type': 'multipart/form-data',
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

export const deleteActor = async (
  id: string,
): Promise<ApiResponse<{ message: string }>> => {
  const token = getToken();
  try {
    const { data } = await client.delete('/actor/' + id, {
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

export const getActors = async (
  pageNo: number,
  limit: number,
): Promise<ApiResponse<ActorsResponse>> => {
  const token = getToken();
  try {
    const { data } = await client(
      `/actor/actors?pageNo=${pageNo}&limit=${limit}`,
      {
        headers: {
          authorization: 'Bearer ' + token,
          'content-type': 'multipart/form-data',
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

export const getActorProfile = async (
  id: string,
): Promise<ApiResponse<ActorResponse>> => {
  try {
    const { data } = await client(`/actor/single/${id}`);
    return { data, error: undefined };
  } catch (error) {
    return {
      data: undefined,
      error: catchError(error).error || 'An error occurred',
    };
  }
};
