import { useEffect, useState, type ReactNode } from 'react';
import { FaPlus } from 'react-icons/fa6';
import { FiChevronsUp } from 'react-icons/fi';
import { MdFavoriteBorder, MdFavorite } from 'react-icons/md';
import { useNavigate, useParams } from 'react-router-dom';

import { getSingleMovie } from '@/api/movie';
import PlaylistAddMovie from '@/components/models/PlaylistAddMovie';
import PlaylistCreate from '@/components/models/PlaylistCreate';
import { useAuth, useNotification } from '@/hooks';
import type { Actor, Movie } from '@/types';
import { getEmbedUrl } from '@/utils/helper';

import Container from '../../components/Container';
import CustomButtonLink from '../../components/CustomButtonLink';
import RatingStar from '../../components/RatingStar';
import MovieReviews from '../../components/user/MovieReviews';
import RelatedMovies from '../../components/user/RelatedMovies';

const convertDate = (date = '') => {
  return date.split('T')[0];
};

export default function SingleMovie() {
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [showPlaylistCreate, setShowPlaylistCreate] = useState(false);
  const [showPlaylistAddMovie, setShowPlaylistAddMovie] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      if (window.pageYOffset > 200) {
        setShowScrollButton(true);
      } else {
        setShowScrollButton(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [ready, setReady] = useState(false);
  const [movie, setMovie] = useState<Movie | undefined>(undefined);

  const { movieId } = useParams();
  const { authInfo, handleToggleFavorite } = useAuth();
  const { updateNotification } = useNotification();
  const navigate = useNavigate();
  useEffect(() => {
    const handleScroll = () => {
      if (window.pageYOffset > 200) {
        setShowScrollButton(true);
      } else {
        setShowScrollButton(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const fetchMovie = async () => {
    const { error, data } = await getSingleMovie(movieId || '');
    if (error || !data)
      return updateNotification('error', error || 'An error occurred');

    setReady(true);
    setMovie(data.movie);
  };

  useEffect(() => {
    if (movieId) fetchMovie();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movieId]);

  if (!ready || !movie)
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-primary">
        <p className="animate-pulse text-light-subtle dark:text-dark-subtle">
          Please wait...
        </p>
      </div>
    );

  const handleProfileClick = (
    profile: { id: string; name: string } | string | undefined,
  ) => {
    if (typeof profile === 'string') {
      navigate(`/profile/${profile}`);
    } else {
      navigate(`/profile/${profile?.id}`);
    }
  };

  const handleOnRatingSuccess = (reviews: {
    ratingAvg: string;
    reviewCount: number;
  }) => {
    setMovie({ ...movie, reviews });
  };

  const handleFavorite = async () => {
    await handleToggleFavorite(movieId || '');
    setMovie({ ...movie, isFavorite: !movie.isFavorite });
  };

  const handleCreatePlaylist = () => {
    setShowPlaylistAddMovie(false);
    setShowPlaylistCreate(true);
  };

  const {
    trailer,
    poster,
    title,
    storyLine,
    language,
    releseDate,
    type,
    director,
    reviews,
    writers,
    cast,
    genres,
    producers,
    tags,
  } = movie;

  const deduplicatedWriters = writers?.filter(
    (w, index, self) =>
      self.findIndex(
        (t) =>
          (typeof t === 'string' ? t : t.id) ===
          (typeof w === 'string' ? w : w.id),
      ) === index,
  );

  const deduplicatedProducers = producers?.filter(
    (p, index, self) =>
      self.findIndex(
        (t) =>
          (typeof t === 'string' ? t : t.id) ===
          (typeof p === 'string' ? p : p.id),
      ) === index,
  );

  return (
    <div className="min-h-screen bg-white pb-10 dark:bg-primary">
      <Container className="p-2 xl:px-0">
        <div className="flex flex-col gap-6 md:flex-row">
          <div className="flex shrink-0 max-md:w-full max-md:justify-center">
            <img
              src={poster?.url}
              alt={title}
              className="max-w-[250px] rounded-lg object-cover"
            />
          </div>
          <div className="flex w-full flex-col">
            <div className="mb-3 flex w-full items-center justify-between border-b">
              <h1 className="py-3 text-2xl font-semibold text-highlight dark:text-highlight-dark lg:text-3xl xl:text-4xl">
                {title}
              </h1>
              {authInfo.isLoggedIn && (
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setShowPlaylistAddMovie(true)}
                    className="flex items-center gap-2 rounded-md border border-light-subtle px-2 py-1 text-sm dark:border-dark-subtle dark:text-white"
                  >
                    <FaPlus className="size-3" /> Add to Playlist
                  </button>
                  <button onClick={handleFavorite}>
                    {movie.isFavorite ? (
                      <MdFavorite className="size-6 text-red-500" />
                    ) : (
                      <MdFavoriteBorder className="size-6 text-red-500" />
                    )}
                  </button>
                </div>
              )}
            </div>
            <RatingStar rating={reviews?.ratingAvg} />
            <ListWithLabel label="Directors:">
              <CustomButtonLink
                onClick={() => handleProfileClick(director)}
                label={director?.name || ''}
              />
            </ListWithLabel>

            <ListWithLabel label="Writers:">
              {deduplicatedWriters?.map((w, index) => (
                <CustomButtonLink
                  onClick={() => handleProfileClick(w)}
                  key={typeof w === 'string' ? w : w.id}
                  label={typeof w === 'string' ? '' : w.name}
                  isLast={index === deduplicatedWriters.length - 1}
                />
              ))}
            </ListWithLabel>
            <ListWithLabel label="Producers:">
              {deduplicatedProducers?.map((p, index) => (
                <CustomButtonLink
                  onClick={() => handleProfileClick(p)}
                  key={typeof p === 'string' ? p : p.id}
                  label={typeof p === 'string' ? '' : p.name}
                  isLast={index === deduplicatedProducers.length - 1}
                />
              ))}
            </ListWithLabel>
            <ListWithLabel label="Lead Cast:">
              {cast
                ?.filter((c) => c.leadActor)
                .map(({ id, actor }, index) => {
                  return (
                    <CustomButtonLink
                      onClick={() => handleProfileClick(actor)}
                      label={actor.name}
                      key={id}
                      isLast={
                        index === cast?.filter((c) => c.leadActor).length - 1
                      }
                    />
                  );
                })}
            </ListWithLabel>

            <ListWithLabel label="Language:">
              <CustomButtonLink label={language} clickable={false} />
            </ListWithLabel>

            <ListWithLabel label="Release Date:">
              <CustomButtonLink
                label={convertDate(releseDate)}
                clickable={false}
              />
            </ListWithLabel>

            <ListWithLabel label="Genre:">
              {genres.map((g, index) => (
                <CustomButtonLink
                  label={g}
                  key={g}
                  clickable={false}
                  isLast={index === genres.length - 1}
                />
              ))}
            </ListWithLabel>

            <ListWithLabel label="Tags:">
              {tags.map((t, index) => (
                <CustomButtonLink
                  label={t}
                  key={t}
                  clickable={false}
                  isLast={index === tags.length - 1}
                />
              ))}
            </ListWithLabel>

            <ListWithLabel label="Category:">
              <CustomButtonLink label={type} clickable={false} />
            </ListWithLabel>
          </div>
        </div>

        {showScrollButton && (
          <button
            className="fixed bottom-4 right-4 rounded-full bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
            onClick={handleScrollToTop}
          >
            <FiChevronsUp />
          </button>
        )}
        <div className="mt-6 space-y-6">
          <div className="space-y-3">
            <h2 className="mb-2 text-2xl font-semibold text-light-subtle dark:text-dark-subtle">
              Story Line:
            </h2>
            <p className="text-light-subtle dark:text-dark-subtle">
              {storyLine}
            </p>
          </div>
          <CastProfiles cast={cast} onProfileClick={handleProfileClick} />
          <div className="flex justify-center">
            <iframe
              width="800"
              height="500"
              src={getEmbedUrl(trailer?.url)}
              title="Trailer"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <RelatedMovies movieId={movieId || ''} />

          <div>
            <h2 className="mb-2 text-2xl font-semibold text-light-subtle dark:text-dark-subtle">
              Reviews:
            </h2>
            <MovieReviews onRatingSuccess={handleOnRatingSuccess} />
          </div>
        </div>
      </Container>
      <PlaylistCreate
        visible={showPlaylistCreate}
        onClose={() => setShowPlaylistCreate(false)}
      />
      <PlaylistAddMovie
        visible={showPlaylistAddMovie}
        onClose={() => setShowPlaylistAddMovie(false)}
        movieId={movieId || ''}
        onCreatePlaylist={handleCreatePlaylist}
      />
    </div>
  );
}

const ListWithLabel = ({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) => {
  return (
    <div className="flex flex-wrap space-x-2">
      <p className="font-semibold text-light-subtle dark:text-dark-subtle">
        {label}
      </p>
      {children}
    </div>
  );
};

interface CastProfilesProps {
  cast:
    | {
        id: string;
        actor: Actor;
        roleAs: string;
        leadActor: boolean;
      }[]
    | undefined;
  onProfileClick: (
    profile: { id: string; name: string } | string | undefined,
  ) => void;
}

const CastProfiles = ({ cast, onProfileClick }: CastProfilesProps) => {
  return (
    <div className="space-y-3">
      <h2 className="mb-2 text-2xl font-semibold text-light-subtle dark:text-dark-subtle">
        Cast:
      </h2>
      <div className="flex flex-wrap justify-center space-x-4">
        {cast?.map(({ id, actor, roleAs }) => {
          return (
            <div
              key={id}
              className="mb-4 flex basis-28 flex-col items-center text-center"
            >
              {actor.avatar?.url ? (
                <img
                  className="aspect-square size-24 rounded-full object-cover"
                  src={actor.avatar?.url}
                  alt={`${actor.name} avatar`}
                />
              ) : (
                <div className="flex size-24 shrink-0 items-center justify-center rounded-full bg-gray-200 text-3xl">
                  {actor.name[0]}
                </div>
              )}

              <CustomButtonLink
                label={actor.name}
                onClick={() => onProfileClick(actor)}
              />
              <span className="text-sm text-light-subtle dark:text-dark-subtle">
                as
              </span>
              <p className="text-light-subtle dark:text-dark-subtle">
                {roleAs}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
