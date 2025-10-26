import { useEffect, useState } from 'react';
import { BsTrash, BsPencilSquare } from 'react-icons/bs';
import { useParams } from 'react-router-dom';

import type { Review, ReviewData } from '@/types';

import { addReview, deleteReview, getReviewByMovie } from '../../api/review';
import { useAuth, useNotification } from '../../hooks';
import Container from '../Container';
import RatingForm from '../form/RatingForm';
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
  const { isLoggedIn } = authInfo;
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
              <ReviewCard review={profileOwnersReview} />
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
            <ReviewCard review={review} key={review.id} />
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

const ReviewCard = ({ review }: { review: Review }) => {
  const { owner, content, rating } = review;

  return (
    <div className="flex space-x-3">
      <div className="flex size-12 shrink-0 select-none items-center justify-center rounded-full bg-light-subtle text-xl text-white dark:bg-dark-subtle">
        {getNameInitial(owner.name)}
      </div>
      <div>
        <h1 className="text-lg font-semibold text-secondary dark:text-white">
          {owner.name}
        </h1>
        <RatingStar rating={rating} />
        <p className="text-light-subtle dark:text-dark-subtle">{content}</p>
      </div>
    </div>
  );
};
