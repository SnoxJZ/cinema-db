import { AiOutlineClose } from 'react-icons/ai';

import ModalContainer from './ModalContainer';

export default function WritersModal({
  profiles = [],
  visible,
  onClose,
  onRemoveClick,
}: {
  profiles:
    | {
        id: string;
        name: string;
        avatar: string;
      }[]
    | undefined;
  visible: boolean;
  onClose: () => void;
  onRemoveClick: (id: string) => void;
}) {
  return (
    <ModalContainer ignoreContainer onClose={onClose} visible={visible}>
      <div className="custom-scroll-bar max-h-[40rem] max-w-[45rem] space-y-2 overflow-auto rounded bg-white p-2 dark:bg-primary">
        {profiles.map(({ id, name, avatar }) => {
          return (
            <div
              key={id}
              className="flex space-x-3 rounded bg-white drop-shadow-md dark:bg-secondary"
            >
              <img
                className="aspect-square size-16 rounded object-cover"
                src={avatar}
                alt={name}
              />
              <p className="w-full font-semibold text-primary dark:text-white">
                {name}
              </p>
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
