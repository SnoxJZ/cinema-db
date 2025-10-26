import { AiFillStar } from 'react-icons/ai';
import { Link } from 'react-router-dom';

import type { MovieListItem } from '@/types';
import { getPoster } from '@/utils/helper';

import GridContainer from '../GridContainer';

const trimTitle = (text = '') => {
  if (text.length <= 20) return text;
  return text.substring(0, 20) + '..';
};

export default function MovieList({
  title,
  movies = [],
  link,
}: {
  title?: string;
  movies: MovieListItem[] | undefined;
  link?: string;
}) {
  if (!movies.length) return null;

  return (
    <div>
      <div className="mb-5 flex items-end gap-4">
        {title && (
          <h2 className="text-2xl font-semibold text-secondary dark:text-white">
            {title}
          </h2>
        )}
        {link && (
          <Link
            to={link}
            className="border-b border-transparent text-base text-highlight hover:border-b-highlight-dark dark:text-highlight-dark"
          >
            See the entire list
          </Link>
        )}
      </div>
      <GridContainer>
        {movies.map((movie) => {
          return <ListItem key={movie.id} movie={movie} />;
        })}
      </GridContainer>
    </div>
  );
}

const ListItem = ({ movie }: { movie: MovieListItem }) => {
  const { id, responsivePosters, title, poster, reviews } = movie;
  return (
    <Link to={'/movie/' + id}>
      {responsivePosters || poster ? (
        <img
          className="h-[250px] w-full object-contain"
          src={getPoster(responsivePosters) || poster}
          alt={title}
        />
      ) : (
        <div className="max-h-[250px] w-full bg-gray-200 object-contain">
          {title}
        </div>
      )}
      <h1
        className="text-lg font-semibold text-secondary dark:text-white"
        title={title}
      >
        {trimTitle(title)}
      </h1>
      {reviews?.ratingAvg ? (
        <p className="flex items-center space-x-1 text-highlight dark:text-highlight-dark">
          <span>{reviews?.ratingAvg}</span>
          <AiFillStar />
        </p>
      ) : (
        <p className="text-highlight dark:text-highlight-dark">No reviews</p>
      )}
    </Link>
  );
};
