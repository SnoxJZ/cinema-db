import { useEffect, useState } from 'react';
import { BsTrash, BsPencilSquare } from 'react-icons/bs';
import { useParams } from 'react-router-dom';

import type { Reply, Review, ReviewData, User } from '@/types';

import {
  addReview,
  addReply,
  deleteReview,
  getReviewByMovie,
  deleteReply,
} from '../../api/review';
import { useAuth, useNotification } from '../../hooks';
import Container from '../Container';
import RatingForm from '../form/RatingForm';
import Submit from '../form/Submit';
import ConfirmModal from '../models/ConfirmModal';
import EditRatingModal from '../models/EditRatingModal';
import NotFoundText from '../NotFoundText';
import RatingStar from '../RatingStar';

const getNameInitial = (name = '') => {
  return name[0].toUpperCase();
};

export default function MovieReviews({
  onRatingSuccess,
}: {
  onRatingSuccess: (reviews: {
    ratingAvg: string;
    reviewCount: number;
  }) => void;
}) {
  const [reviews, setReviews] = useState<Review[] | undefined>(undefined);
  const [profileOwnersReview, setProfileOwnersReview] = useState<Review | null>(
    null,
  );
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Omit<
    Review,
    'owner'
  > | null>(null);
  const [busy, setBusy] = useState(false);

  const { movieId } = useParams();
  const { authInfo } = useAuth();
  const { isLoggedIn, profile } = authInfo;
  const profileId = authInfo.profile?.id;

  const { updateNotification } = useNotification();

  const fetchReviews = async () => {
    const { data, error } = await getReviewByMovie(movieId || '');
    if (error || !data)
      return updateNotification('error', error || 'An error occurred');

    setProfileOwnersReview(
      [...data.movie.reviews].find((review) => review.owner.id === profileId) ||
        null,
    );
    setReviews(
      [...data.movie.reviews].filter((review) => review.owner.id !== profileId),
    );
  };

  const handleOnEditClick = () => {
    if (!profileOwnersReview) return;
    const { id, content, rating, isSpoiler } = profileOwnersReview;
    setSelectedReview({
      id,
      content,
      rating,
      isSpoiler,
    });

    setShowEditModal(true);
  };

  const handleAddReview = async (data: ReviewData) => {
    const { error, data: reviews } = await addReview(movieId || '', data);
    if (error || !reviews)
      return updateNotification('error', error || 'An error occurred');

    updateNotification('success', reviews.message);
    onRatingSuccess(reviews.reviews);
    setProfileOwnersReview(reviews.newReview);
  };

  const handleDeleteConfirm = async () => {
    if (!profileOwnersReview) return;
    setBusy(true);
    const { error, data } = await deleteReview(profileOwnersReview.id);
    setBusy(false);
    if (error || !data)
      return updateNotification('error', error || 'An error occurred');

    updateNotification('success', data.message);

    setProfileOwnersReview(null);
    hideConfirmModal();
  };

  const handleOnReviewUpdate = (review: ReviewData) => {
    if (!profileOwnersReview) return;
    const updatedReview = {
      ...profileOwnersReview,
      rating: review.rating,
      content: review.content,
      isSpoiler: review.isSpoiler,
    };

    setProfileOwnersReview(updatedReview);
  };

  const handleAddReply = async (reviewId: string, content: string) => {
    const { error, data: reply } = await addReply(reviewId, content);
    if (error || !reply)
      return updateNotification('error', error || 'An error occurred');
    updateNotification('success', reply.message);

    setReviews((prev) =>
      prev?.map((r) =>
        r.id === reviewId
          ? { ...r, replies: [...(r.replies || []), reply.reply] }
          : r,
      ),
    );
  };

  const handleDeleteReply = async (reviewId: string, replyId: string) => {
    const { error, data } = await deleteReply(reviewId, replyId);
    if (error || !data)
      return updateNotification('error', error || 'An error occurred');
    updateNotification('success', data.message);

    setReviews((prev) =>
      prev?.map((r) =>
        r.id === reviewId
          ? { ...r, replies: r.replies?.filter((r) => r.id !== replyId) }
          : r,
      ),
    );
  };

  const displayConfirmModal = () => setShowConfirmModal(true);
  const hideConfirmModal = () => setShowConfirmModal(false);
  const hideEditModal = () => {
    setShowEditModal(false);
    setSelectedReview(null);
  };

  useEffect(() => {
    if (movieId) fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movieId]);

  return (
    <>
      <Container className="px-2 pb-8 pt-4 xl:px-0">
        <NotFoundText
          text="No reviews!"
          visible={!reviews || !reviews?.length}
        />
        {isLoggedIn && <RatingForm onSubmit={handleAddReview} />}
        <div className="mt-3 space-y-3">
          {profileOwnersReview && (
            <div>
              <ReviewCard
                profile={profile}
                review={profileOwnersReview}
                isLoggedIn={isLoggedIn}
              />
              <div className="flex space-x-3 p-3 text-xl text-primary dark:text-white">
                <button onClick={displayConfirmModal} type="button">
                  <BsTrash />
                </button>
                <button onClick={handleOnEditClick} type="button">
                  <BsPencilSquare />
                </button>
              </div>
            </div>
          )}
          {reviews?.map((review) => (
            <ReviewCard
              profile={profile}
              review={review}
              key={review.id}
              isLoggedIn={isLoggedIn}
              onAddReply={handleAddReply}
              onDeleteReply={handleDeleteReply}
            />
          ))}
        </div>
      </Container>

      <ConfirmModal
        visible={showConfirmModal}
        onCancel={hideConfirmModal}
        onConfirm={handleDeleteConfirm}
        busy={busy}
        title="Are you sure?"
        subtitle="Your review will be permanently deleted!"
      />

      <EditRatingModal
        visible={showEditModal}
        initialState={selectedReview}
        onSuccess={handleOnReviewUpdate}
        onClose={hideEditModal}
      />
    </>
  );
}

const ReviewCard = ({
  review,
  onAddReply,
  onDeleteReply,
  isLoggedIn,
  profile,
}: {
  review: Review;
  onAddReply?: (reviewId: string, content: string) => void;
  onDeleteReply?: (reviewId: string, replyId: string) => void;
  isLoggedIn: boolean;
  profile: User | null;
}) => {
  const [isAddReply, setIsAddReply] = useState<boolean>(false);
  const [replyContent, setReplyContent] = useState<string>('');
  const { owner, content, rating, id, replies } = review;

  return (
    <div className="flex space-x-3">
      {owner.avatar ? (
        <img
          src={owner.avatar.url}
          alt={owner.name}
          className="size-12 shrink-0 rounded-full"
        />
      ) : (
        <div className="flex size-12 shrink-0 select-none items-center justify-center rounded-full bg-light-subtle text-xl text-white dark:bg-dark-subtle">
          {getNameInitial(owner.name)}
        </div>
      )}
      <div>
        <h3 className="text-lg font-semibold text-secondary dark:text-white">
          {owner.name}
        </h3>
        <RatingStar rating={rating} />
        <p className="text-light-subtle dark:text-dark-subtle">{content}</p>
        {isLoggedIn && onAddReply && (
          <button
            className="border-b text-sm text-primary dark:text-white"
            type="button"
            onClick={() => setIsAddReply(true)}
          >
            Reply
          </button>
        )}
        {isAddReply && (
          <div className="mt-3">
            <textarea
              className="w-full rounded border border-gray-300 bg-white px-4 py-1 dark:border-gray-600 dark:bg-secondary dark:text-white"
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
            />
            <Submit
              onClick={() => {
                onAddReply?.(id, replyContent);
                setIsAddReply(false);
              }}
              value="Add Reply"
              className="h-9 !w-24 !px-2 !text-base"
            />
          </div>
        )}

        <div className="mt-3 space-y-3">
          {replies?.map((reply) => (
            <div key={reply.id} className="flex items-center gap-3">
              {reply.owner.avatar ? (
                <img
                  src={reply.owner.avatar.url}
                  alt={reply.owner.name}
                  className="size-12 shrink-0 rounded-full"
                />
              ) : (
                <div className="flex size-12 shrink-0 select-none items-center justify-center rounded-full bg-light-subtle text-xl text-white dark:bg-dark-subtle">
                  {getNameInitial(reply.owner.name)}
                </div>
              )}
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-secondary dark:text-white">
                    {reply.owner.name}
                  </p>
                  {profile?.id === reply.owner.id && (
                    <button
                      type="button"
                      onClick={() => onDeleteReply?.(id, reply.id)}
                    >
                      <BsTrash className="text-red-500" />
                    </button>
                  )}
                </div>
                <p className="text-sm text-light-subtle dark:text-dark-subtle">
                  {reply.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
