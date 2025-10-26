import { useState } from 'react';

import { createActor } from '@/api/actor';
import { useNotification } from '@/hooks';

import ActorForm from '../form/ActorForm';

import ModalContainer from './ModalContainer';

export default function ActorUpload({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const [busy, setBusy] = useState(false);

  const { updateNotification } = useNotification();

  const handleSubmit = async (data: FormData) => {
    setBusy(true);
    const { error, data: actor } = await createActor(data);
    setBusy(false);
    if (error || !actor)
      return updateNotification('error', error || 'An error occurred');

    updateNotification('success', 'Actor added successfully!');
    onClose();
  };

  return (
    <ModalContainer visible={visible} onClose={onClose} ignoreContainer>
      <ActorForm
        onSubmit={!busy ? handleSubmit : undefined}
        title="Create New Actor"
        btnTitle="Create"
        busy={busy}
      />
    </ModalContainer>
  );
}
