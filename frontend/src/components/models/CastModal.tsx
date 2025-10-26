import { AiOutlineCheck, AiOutlineClose } from 'react-icons/ai';

import type { Actor } from '@/types';

import ModalContainer from './ModalContainer';

export default function CastModal({
  casts = [],
  visible,
  onClose,
  onRemoveClick,
}: {
  casts?: { actor: Actor; roleAs: string; leadActor: boolean }[];
  visible: boolean;
  onClose: () => void;
  onRemoveClick: (id: string) => void;
}) {
  return (
    <ModalContainer ignoreContainer onClose={onClose} visible={visible}>
      <div className="custom-scroll-bar max-h-[40rem] max-w-[45rem] space-y-2 overflow-auto rounded bg-white p-2 dark:bg-primary">
        {casts.map(({ actor, roleAs, leadActor }) => {
          const { name, avatar, id } = actor;
          return (
            <div
              key={id}
              className="flex space-x-3 rounded bg-white drop-shadow-md dark:bg-secondary"
            >
              <img
                className="aspect-square size-16 rounded object-cover"
                src={avatar?.url}
                alt={name}
              />
              <div className="flex w-full flex-col justify-between">
                <div>
                  <p className="font-semibold text-primary dark:text-white">
                    {name}
                  </p>
                  <p className="text-sm text-light-subtle dark:text-dark-subtle">
                    {roleAs}
                  </p>
                </div>
                {leadActor && (
                  <AiOutlineCheck className="text-light-subtle dark:text-dark-subtle" />
                )}
              </div>
              <button
                onClick={() => onRemoveClick(id)}
                className="p-2 text-primary transition hover:opacity-80 dark:text-white"
              >
                <AiOutlineClose />
              </button>
            </div>
          );
        })}
      </div>
    </ModalContainer>
  );
}
