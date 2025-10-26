import type { User, ApiResponse } from '@/types';

import { catchError } from '../utils/helper';

import client from './client';

export const createUser = async (userInfo: {
  name: string;
  email: string;
  password: string;
}): Promise<
  ApiResponse<{ user: { id: string; name: string; email: string } }>
> => {
  try {
    const { data } = await client.post('/user/create', userInfo);
    return { data: data.user, error: undefined };
  } catch (error) {
    return {
      data: undefined,
      error: catchError(error).error || 'An error occurred',
    };
  }
};

export const verifyUserEmail = async (userInfo: {
  userId: string;
  OTP: string;
}): Promise<ApiResponse<{ user: User; message: string }>> => {
  try {
    const { data } = await client.post('/user/verify-email', userInfo);
    return { data, error: undefined };
  } catch (error) {
    return {
      data: undefined,
      error: catchError(error).error || 'An error occurred',
    };
  }
};

export const signInUser = async (userInfo: {
  email: string;
  password: string;
}): Promise<ApiResponse<User>> => {
  try {
    const { data } = await client.post('/user/sign-in', userInfo);
    return { data: data.user, error: undefined };
  } catch (error) {
    return {
      data: undefined,
      error: catchError(error).error || 'An error occurred',
    };
  }
};

export const getIsAuth = async (token: string): Promise<ApiResponse<User>> => {
  try {
    const { data } = await client.get('/user/is-auth', {
      headers: {
        Authorization: 'Bearer ' + token,
        accept: 'application/json',
      },
    });
    return { data: data.user, error: undefined };
  } catch (error) {
    return {
      data: undefined,
      error: catchError(error).error || 'An error occurred',
    };
  }
};

export const forgetPassword = async (
  email: string,
): Promise<ApiResponse<{ message: string }>> => {
  try {
    const { data } = await client.post('/user/forget-password', { email });
    return { data, error: undefined };
  } catch (error) {
    return {
      data: undefined,
      error: catchError(error).error || 'An error occurred',
    };
  }
};

export const verifyPasswordResetToken = async (
  token: string,
  userId: string,
): Promise<ApiResponse<{ valid: boolean }>> => {
  try {
    const { data } = await client.post('/user/verify-pass-reset-token', {
      token,
      userId,
    });
    return { data, error: undefined };
  } catch (error) {
    return {
      data: undefined,
      error: catchError(error).error || 'An error occurred',
    };
  }
};

export const resetPassword = async (passwordInfo: {
  newPassword: string;
  userId: string;
}): Promise<ApiResponse<{ message: string }>> => {
  try {
    const { data } = await client.post('/user/reset-password', passwordInfo);
    return { data, error: undefined };
  } catch (error) {
    return {
      data: undefined,
      error: catchError(error).error || 'An error occurred',
    };
  }
};

export const resendEmailVerificationToken = async (
  userId: string,
): Promise<ApiResponse<{ message: string }>> => {
  try {
    const { data } = await client.post(
      '/user/resend-email-verification-token',
      { userId },
    );
    return { data, error: undefined };
  } catch (error) {
    return {
      data: undefined,
      error: catchError(error).error || 'An error occurred',
    };
  }
};
