import { AiFillStar } from 'react-icons/ai';
import { FaRegTrashAlt } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';

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
  description,
  onDelete,
}: {
  title?: string;
  movies: MovieListItem[] | undefined;
  link?: string;
  description?: string;
  onDelete?: (movieId: string, e: React.MouseEvent<HTMLButtonElement>) => void;
}) {
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
      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      )}
      <GridContainer>
        {movies.map((movie) => {
          return <ListItem key={movie.id} movie={movie} onDelete={onDelete} />;
        })}
      </GridContainer>
    </div>
  );
}

const ListItem = ({
  movie,
  onDelete,
}: {
  movie: MovieListItem;
  onDelete?: (movieId: string, e: React.MouseEvent<HTMLButtonElement>) => void;
}) => {
  const { id, responsivePosters, title, poster, reviews } = movie;
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(`/movie/${id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          navigate(`/movie/${id}`);
        }
      }}
    >
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
      <div className="flex items-center gap-4">
        <h3
          className="text-lg font-semibold text-secondary dark:text-white"
          title={title}
        >
          {trimTitle(title)}
        </h3>
        {onDelete && (
          <button type="button" onClick={(e) => onDelete(id, e)}>
            <FaRegTrashAlt className="size-4 text-red-500" />
          </button>
        )}
      </div>
      {reviews?.ratingAvg ? (
        <p className="flex items-center space-x-1 text-highlight dark:text-highlight-dark">
          <span>{reviews?.ratingAvg}</span>
          <AiFillStar />
        </p>
      ) : (
        <p className="text-highlight dark:text-highlight-dark">No reviews</p>
      )}
    </div>
  );
};
