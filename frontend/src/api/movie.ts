import type {
  Movie,
  MovieListItem,
  UploadProgress,
  ApiResponse,
  MovieType,
} from '@/types';

import { catchError, getToken } from '../utils/helper';

import client from './client';

export const uploadTrailer = async (
  formData: FormData,
  onUploadProgress?: UploadProgress,
): Promise<ApiResponse<{ url: string; public_id: string }>> => {
  const token = getToken();
  try {
    const { data } = await client.post('/movie/upload-trailer', formData, {
      headers: {
        authorization: 'Bearer ' + token,
        'content-type': 'multipart/form-data',
      },
      onUploadProgress: ({ loaded, total }) => {
        if (onUploadProgress)
          onUploadProgress(Math.floor((loaded / total) * 100));
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

export const uploadMovie = async (
  formData: FormData,
): Promise<ApiResponse<{ movie: { id: string; title: string } }>> => {
  const token = getToken();
  try {
    const { data } = await client.post('/movie/create', formData, {
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

export const getMovieForUpdate = async (
  id: string,
): Promise<ApiResponse<{ movie: Movie }>> => {
  const token = getToken();
  try {
    const { data } = await client('/movie/for-update/' + id, {
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

export const getMovies = async (queryParams: {
  pageNo?: number;
  limit?: number;
  type?: MovieType;
  actorId?: string;
  genre?: string;
  sortBy?: 'releseDate' | 'ratingAvg';
}): Promise<
  ApiResponse<{
    movies: MovieListItem[];
    totalMovies: number;
    pageCount: number;
  }>
> => {
  const {
    pageNo,
    limit,
    type,
    actorId,
    genre,
    sortBy = 'createdAt',
  } = queryParams;
  try {
    const params = new URLSearchParams({
      pageNo: String(pageNo || 0),
      limit: String(limit || 50),
    });
    if (type) params.append('type', type);
    if (actorId) params.append('actorId', actorId);
    if (genre) params.append('genre', genre);
    if (sortBy !== 'createdAt') params.append('sortBy', sortBy);

    const { data } = await client(`/movie/movies?${params}`);
    return { data, error: undefined };
  } catch (error) {
    return {
      data: undefined,
      error: catchError(error).error || 'An error occurred',
    };
  }
};

export const updateMovie = async (
  id: string,
  formData: FormData,
): Promise<ApiResponse<{ message: string; movie: MovieListItem }>> => {
  const token = getToken();
  try {
    const { data } = await client.patch('/movie/update/' + id, formData, {
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

export const deleteMovie = async (
  id: string,
): Promise<ApiResponse<{ message: string }>> => {
  const token = getToken();
  try {
    const { data } = await client.delete(`/movie/${id}`, {
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

export const searchMovieForAdmin = async (
  title: string,
): Promise<ApiResponse<{ results: MovieListItem[] }>> => {
  const token = getToken();
  try {
    const { data } = await client(`/movie/search?title=${title}`, {
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

export const getTopRatedMovies = async (
  type?: string,
  signal?: AbortSignal,
): Promise<ApiResponse<{ movies: MovieListItem[] }>> => {
  try {
    let endpoint = '/movie/top-rated';
    if (type) endpoint = endpoint + '?type=' + type;

    const { data } = await client(endpoint, { signal });
    return { data, error: undefined };
  } catch (error) {
    return {
      data: undefined,
      error: catchError(error).error || 'An error occurred',
    };
  }
};

export const getLatestUploads = async (
  signal?: AbortSignal,
): Promise<ApiResponse<{ movies: MovieListItem[] }>> => {
  try {
    const { data } = await client('/movie/latest-uploads', { signal });
    return { data, error: undefined };
  } catch (error) {
    return {
      data: undefined,
      error: catchError(error).error || 'An error occurred',
    };
  }
};

export const getSingleMovie = async (
  id: string,
): Promise<ApiResponse<{ movie: Movie }>> => {
  try {
    const { data } = await client('/movie/single/' + id);
    return { data, error: undefined };
  } catch (error) {
    return {
      data: undefined,
      error: catchError(error).error || 'An error occurred',
    };
  }
};

export const getRelatedMovies = async (
  id: string,
): Promise<ApiResponse<{ movies: MovieListItem[] }>> => {
  try {
    const { data } = await client('/movie/related/' + id);
    return { data, error: undefined };
  } catch (error) {
    return {
      data: undefined,
      error: catchError(error).error || 'An error occurred',
    };
  }
};

export const searchPublicMovies = async (
  title: string,
): Promise<ApiResponse<{ results: MovieListItem[] }>> => {
  try {
    const { data } = await client('/movie/search-public?title=' + title);
    return { data, error: undefined };
  } catch (error) {
    return {
      data: undefined,
      error: catchError(error).error || 'An error occurred',
    };
  }
};
