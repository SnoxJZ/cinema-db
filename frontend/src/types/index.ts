export type UserRole = 'user' | 'admin' | 'moderator';

export interface User {
  id: string;
  token: string;
  name: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
  avatar?: {
    url: string;
    public_id: string;
  };
  favorites?: string[];
  isBlocked: boolean;
  blockedUntil: Date | undefined;
}

export type BlockDuration =
  | '1d'
  | '1w'
  | '1m'
  | '3m'
  | '6m'
  | '1y'
  | 'permanent'
  | undefined;

export type MovieType = 'Movie' | 'Web Series' | 'TV Series' | 'Documentary';

export interface Movie {
  id: string;
  title: string;
  storyLine: string;
  poster?: {
    url: string;
    public_id: string;
    responsive: string[];
  };
  trailer?: {
    url: string;
    public_id: string;
  };
  releseDate: string;
  status: 'public' | 'private';
  type: MovieType;
  genres: string[];
  tags: string[];
  birthday?: string;
  language: string;
  director?: {
    id: string;
    name: string;
  };
  producers: Actor[];
  writers?: (string | Actor)[];
  cast?: Array<{
    id: string;
    actor: Actor;
    roleAs: string;
    leadActor: boolean;
  }>;
  reviews: {
    ratingAvg?: string;
    reviewCount?: number;
    // reviews: Review[];
  };
  isFavorite: boolean;
}

export type MovieFormT = Omit<
  Movie,
  'id' | 'poster' | 'cast' | 'writers' | 'director' | 'producers'
> & {
  poster?: File | null;
  cast?: Array<{
    actor: Actor;
    roleAs: string;
    leadActor: boolean;
  }>;
  director?: { id: string; name: string };
  writers?: {
    name: string;
    id: string;
    avatar: string;
  }[];
};

export interface MovieListItem {
  id: string;
  title: string;
  poster?: string;
  responsivePosters?: string[];
  genres: string[];
  status: string;
  reviews?: {
    ratingAvg?: string;
    reviewCount?: number;
  };
}

export interface MostRatedMovie {
  id: string;
  title: string;
  reviews: { ratingAvg: number; reviewCount: number };
}

export interface UploadProgress {
  (progress: number): void;
}

export interface Review {
  id: string;
  owner: {
    id: string;
    name: string;
    avatar?: {
      url: string;
      public_id: string;
    };
  };
  content: string;
  rating: number;
  isSpoiler: boolean;
  replies?: Reply[];
}

export interface Reply {
  id: string;
  owner: {
    id: string;
    name: string;
    avatar?: {
      url: string;
      public_id: string;
    };
  };
  content: string;
}

export interface ReviewData {
  content: string;
  rating: number;
  isSpoiler: boolean;
}

export interface ReviewResponse {
  movie: {
    reviews: Review[];
    title: string;
  };
}

export interface Actor {
  id: string;
  apiId: number;
  name: string;
  about: string;
  gender: string;
  avatar?: {
    url: string;
    public_id: string;
  };
  birthday?: string;
}

export interface ActorForm {
  name: string;
  about: string;
  gender: string;
  avatar: File | null;
}

export interface ActorResponse {
  actor: Actor;
}

export interface ActorsResponse {
  profiles: Actor[];
}

export interface ActorSearchResponse {
  results: Actor[];
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface PlaylistI {
  id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  movies: MovieListItem[];
}

export type ActivityAction =
  | 'login'
  | 'register'
  | 'create_review'
  | 'delete_review'
  | 'update_review'
  | 'block_user'
  | 'unblock_user'
  | 'change_role'
  | 'upload_avatar'
  | 'update_profile'
  | 'create_actor'
  | 'update_actor'
  | 'delete_actor'
  | 'create_movie'
  | 'update_movie'
  | 'delete_movie';

export interface ActivityLog {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  action: ActivityAction;
  details?: string;
  ip?: string;
  userAgent?: string;
  createdAt: string;
}
