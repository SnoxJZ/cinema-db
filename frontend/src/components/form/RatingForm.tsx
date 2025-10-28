import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { AiOutlineStar, AiFillStar } from 'react-icons/ai';

import { useNotification } from '@/hooks';
import type { Review, ReviewData } from '@/types';

import Submit from './Submit';

const createArray = (count: number) => {
  return new Array(count).fill('');
};

interface RatingFormProps {
  busy?: boolean;
  initialState?: Omit<Review, 'owner'> | null;
  onSubmit: (data: ReviewData) => void;
  className?: string;
}

const ratings = createArray(10);

export default function RatingForm({
  busy,
  initialState,
  onSubmit,
  className,
}: RatingFormProps) {
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
  const [content, setContent] = useState('');
  const { updateNotification } = useNotification();

  const handleMouseEnter = (index: number) => {
    const ratings = createArray(index + 1);
    setSelectedRatings([...ratings]);
  };

  const handleOnChange = ({ target }: { target: HTMLTextAreaElement }) => {
    setContent(target.value);
  };

  const handleSubmit = async () => {
    if (!selectedRatings.length)
      return updateNotification('error', 'Please select a rating');
    const data = {
      rating: selectedRatings.length,
      content,
      isSpoiler: false,
    };

    setContent('');
    onSubmit(data);
  };

  useEffect(() => {
    if (initialState) {
      setContent(initialState.content);
      setSelectedRatings(createArray(initialState.rating));
    }
  }, [initialState]);

  return (
    <>
      <div
        className={clsx(
          'space-y-3 rounded bg-white dark:bg-primary',
          className,
        )}
      >
        <div className="relative flex items-center text-highlight dark:text-highlight-dark">
          <StarsOutlined ratings={ratings} onMouseEnter={handleMouseEnter} />
          <div className="absolute top-1/2 flex -translate-y-1/2 items-center">
            <StarsFilled
              ratings={selectedRatings}
              onMouseEnter={handleMouseEnter}
            />
          </div>
        </div>

        <textarea
          value={content}
          onChange={handleOnChange}
          placeholder="Write your review here..."
          className="max-h-48 min-h-24 w-full rounded border border-gray-300 bg-white px-4 py-1 dark:border-gray-600 dark:bg-secondary dark:text-white"
        />

        <div className="flex justify-end">
          <Submit
            busy={busy}
            onClick={handleSubmit}
            value="Rate"
            className="!w-48"
          />
        </div>
      </div>
    </>
  );
}

const StarsOutlined = ({
  ratings,
  onMouseEnter,
}: {
  ratings: number[];
  onMouseEnter: (index: number) => void;
}) => {
  return ratings.map((_, index) => {
    return (
      <AiOutlineStar
        onMouseEnter={() => onMouseEnter(index)}
        className="cursor-pointer"
        key={index}
        size={24}
      />
    );
  });
};

const StarsFilled = ({
  ratings,
  onMouseEnter,
}: {
  ratings: number[];
  onMouseEnter: (index: number) => void;
}) => {
  return ratings.map((_, index) => {
    return (
      <AiFillStar
        onMouseEnter={() => onMouseEnter(index)}
        className="cursor-pointer"
        key={index}
        size={24}
      />
    );
  });
};
