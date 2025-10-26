import { useState } from 'react';

import { updateActor } from '@/api/actor';
import { useNotification } from '@/hooks';
import type { Actor } from '@/types';

import ActorForm from '../form/ActorForm';

import ModalContainer from './ModalContainer';

export default function UpdateActor({
  visible,
  initialState,
  onSuccess,
  onClose,
}: {
  visible: boolean;
  initialState: Actor | null;
  onSuccess: (actor: Actor) => void;
  onClose: () => void;
}) {
  const [busy, setBusy] = useState(false);

  const { updateNotification } = useNotification();

  const handleSubmit = async (data: FormData) => {
    if (!initialState) return;
    setBusy(true);
    const { error, data: actor } = await updateActor(initialState.id, data);
    setBusy(false);
    if (error || !actor)
      return updateNotification('error', error || 'An error occurred');
    onSuccess(actor.actor);
    updateNotification('success', 'Actor information updated!');
    onClose();
  };

  return (
    <ModalContainer visible={visible} onClose={onClose} ignoreContainer>
      <ActorForm
        onSubmit={!busy ? handleSubmit : undefined}
        title="Update Actor Information"
        btnTitle="Update"
        busy={busy}
        initialState={initialState}
      />
    </ModalContainer>
  );
}
