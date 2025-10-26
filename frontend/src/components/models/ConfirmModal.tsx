import { ImSpinner3 } from 'react-icons/im';

import ModalContainer from './ModalContainer';

interface ConfirmModalProps {
  visible: boolean;
  busy?: boolean;
  title: string;
  subtitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  visible,
  busy,
  title,
  subtitle,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const commonClass = 'px-3 py-1 text-white rounded';
  return (
    <ModalContainer visible={visible} ignoreContainer>
      <div className="rounded bg-white p-3 dark:bg-primary">
        <h1 className="text-lg font-semibold text-red-400">{title}</h1>
        <p className="text-sm text-secondary dark:text-white">{subtitle}</p>

        <div className="mt-3 flex items-center space-x-3">
          {busy ? (
            <p className="flex items-center space-x-2 text-primary dark:text-white">
              <ImSpinner3 className="animate-spin" />
              <span>Please wait...</span>
            </p>
          ) : (
            <>
              <button
                onClick={onConfirm}
                type="button"
                className={commonClass + ' bg-red-400'}
              >
                Confirm
              </button>
              <button
                onClick={onCancel}
                type="button"
                className={commonClass + ' bg-blue-400'}
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </ModalContainer>
  );
}
