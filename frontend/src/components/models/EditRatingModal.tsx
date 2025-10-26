import { useState } from 'react';

import { updateReview } from '@/api/review';
import { useNotification } from '@/hooks';
import type { Review, ReviewData } from '@/types';

import RatingForm from '../form/RatingForm';

import ModalContainer from './ModalContainer';

interface EditRatingModalProps {
  visible: boolean;
  initialState: Omit<Review, 'owner'> | null;
  onSuccess: (data: ReviewData) => void;
  onClose: () => void;
}

export default function EditRatingModal({
  visible,
  initialState,
  onSuccess,
  onClose,
}: EditRatingModalProps) {
  const [busy, setBusy] = useState(false);
  const { updateNotification } = useNotification();

  const handleSubmit = async (data: ReviewData) => {
    if (!initialState) return;
    setBusy(true);
    const { error, data: responseData } = await updateReview(
      initialState.id,
      data,
    );
    setBusy(false);
    if (error || !responseData)
      return updateNotification('error', error || 'An error occurred');

    onSuccess({ ...data });
    updateNotification('success', responseData.message);
    onClose();
  };

  return (
    <ModalContainer visible={visible} onClose={onClose} ignoreContainer>
      <RatingForm
        busy={busy}
        initialState={initialState}
        onSubmit={handleSubmit}
        className="p-5"
      />
    </ModalContainer>
  );
}
