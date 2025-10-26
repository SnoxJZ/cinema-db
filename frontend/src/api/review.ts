import type { ReviewData, ReviewResponse, ApiResponse, Review } from '@/types';

import { catchError, getToken } from '../utils/helper';

import client from './client';

export const addReview = async (
  movieId: string,
  reviewData: ReviewData,
): Promise<
  ApiResponse<{
    message: string;
    reviews: {
      ratingAvg: string;
      reviewCount: number;
    };
    newReview: Review;
  }>
> => {
  const token = getToken();
  try {
    const { data } = await client.post(`/review/add/${movieId}`, reviewData, {
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

export const getReviewByMovie = async (
  movieId: string,
): Promise<ApiResponse<ReviewResponse>> => {
  try {
    const { data } = await client(`/review/get-reviews-by-movie/${movieId}`);
    return { data, error: undefined };
  } catch (error) {
    return {
      data: undefined,
      error: catchError(error).error || 'An error occurred',
    };
  }
};

export const deleteReview = async (
  reviewId: string,
): Promise<ApiResponse<{ message: string }>> => {
  const token = getToken();
  try {
    const { data } = await client.delete(`/review/${reviewId}`, {
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

export const updateReview = async (
  reviewId: string,
  reviewData: ReviewData,
): Promise<ApiResponse<{ message: string }>> => {
  const token = getToken();
  try {
    const { data } = await client.patch(`/review/${reviewId}`, reviewData, {
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
