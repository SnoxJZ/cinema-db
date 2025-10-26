import { AiFillStar } from 'react-icons/ai';

export default function RatingStar({ rating }: { rating?: string | number }) {
  if (!rating)
    return (
      <p className="text-highlight dark:text-highlight-dark">No reviews</p>
    );

  return (
    <p className="flex items-center space-x-1 text-highlight dark:text-highlight-dark">
      <span>{rating}</span>
      <AiFillStar />
    </p>
  );
}
