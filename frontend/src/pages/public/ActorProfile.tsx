import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { getActorProfile } from '@/api/actor';
import { getMovies } from '@/api/movie';
import Loading from '@/components/Loading.tsx';
import { useNotification } from '@/hooks';
import type { Actor, MovieListItem } from '@/types';

import Container from '../../components/Container';
import MovieList from '../../components/user/MovieList';

const ActorProfile = () => {
  const [ready, setReady] = useState(false);
  const [actor, setActor] = useState<Actor | undefined>(undefined);
  const [movies, setMovies] = useState<MovieListItem[] | undefined>(undefined);

  const { profileId } = useParams();
  const { updateNotification } = useNotification();

  const fetchActorProfile = async () => {
    const { error, data } = await getActorProfile(profileId || '');
    if (error || !data)
      return updateNotification('error', error || 'An error occurred');

    setReady(true);
    setActor(data.actor);
  };

  const fetchMovies = async () => {
    const { error, data } = await getMovies({
      pageNo: 0,
      limit: 50,
      actorId: profileId,
    });
    if (error || !data)
      return updateNotification('error', error || 'An error occurred');

    setMovies(data.movies);
  };

  useEffect(() => {
    if (profileId) {
      fetchMovies();
      fetchActorProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileId]);

  if (!ready || !actor) return <Loading />;

  const { avatar, name, about, birthday, gender } = actor;

  return (
    <div className="min-h-screen bg-white pb-10 dark:bg-primary">
      <Container className="space-y-4 p-2 xl:px-0">
        <div className="flex flex-col items-start gap-6 md:flex-row">
          <div className="flex shrink-0 max-md:w-full max-md:justify-center">
            {avatar?.url ? (
              <img
                src={avatar.url}
                alt={`${name} avatar`}
                className="max-w-[250px] rounded-lg object-cover"
              />
            ) : (
              <div className="flex h-[300px] w-[200px] shrink-0 flex-wrap items-center justify-center bg-gray-200 text-2xl">
                {name}
              </div>
            )}
          </div>
          <div className="flex w-full flex-col gap-3">
            <div className="mb-3 flex w-full items-center border-b">
              <h1 className="py-3 text-2xl font-semibold text-highlight dark:text-highlight-dark lg:text-3xl xl:text-4xl">
                {name}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-highlight dark:text-highlight-dark">
                Birthday:
              </h3>
              <p className="text-base text-light-subtle dark:text-dark-subtle">
                {birthday
                  ? new Date(birthday).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'N/A'}
              </p>
            </div>
            <div className="flex items-start gap-2">
              <h3 className="text-base font-semibold text-highlight dark:text-highlight-dark">
                Gender:
              </h3>
              <p className="capitalize text-light-subtle dark:text-dark-subtle">
                {gender}
              </p>
            </div>
            <div className="flex items-start gap-2">
              <h3 className="text-base font-semibold text-highlight dark:text-highlight-dark">
                About:
              </h3>
              <p className="text-light-subtle dark:text-dark-subtle">{about}</p>
            </div>
          </div>
        </div>
        <MovieList movies={movies} title="Movies" />
      </Container>
    </div>
  );
};

export default ActorProfile;
