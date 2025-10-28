import { useState } from 'react';
import { FileUploader } from 'react-drag-drop-files';
import { AiOutlineCloudUpload } from 'react-icons/ai';

import { uploadMovie, uploadTrailer } from '@/api/movie';
import { useNotification } from '@/hooks';

import ModalContainer from '../models/ModalContainer';

import MovieForm from './MovieForm';

export default function MovieUpload({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const [videoSelected, setVideoSelected] = useState(false);
  const [videoUploaded, setVideoUploaded] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoInfo, setVideoInfo] = useState<{
    url: string;
    public_id: string;
  }>({
    url: '',
    public_id: '',
  });
  const [busy, setBusy] = useState(false);

  const { updateNotification } = useNotification();

  const resetState = () => {
    setVideoSelected(false);
    setVideoUploaded(false);
    setUploadProgress(0);
    setVideoInfo({ url: '', public_id: '' });
  };

  const handleTypeError = (error: string) => {
    updateNotification('error', error);
  };

  const handleUploadTrailer = async (data: FormData) => {
    const { error, data: trailerData } = await uploadTrailer(
      data,
      setUploadProgress,
    );
    if (error || !trailerData)
      return updateNotification('error', error || 'An error occurred');

    setVideoUploaded(true);
    setVideoInfo({ url: trailerData.url, public_id: trailerData.public_id });
  };

  const handleChange = (file: File) => {
    const formData = new FormData();
    formData.append('video', file);

    setVideoSelected(true);
    handleUploadTrailer(formData);
  };

  const getUploadProgressValue = () => {
    if (!videoUploaded && uploadProgress >= 100) {
      return 'Processing...';
    }

    return `Uploaded ${uploadProgress}%`;
  };

  const handleSubmit = async (data: FormData) => {
    if (!videoInfo.url || !videoInfo.public_id)
      return updateNotification('error', 'Trailer cannot be empty!');

    setBusy(true);
    data.append('trailer', JSON.stringify(videoInfo));
    const { error, data: movieData } = await uploadMovie(data);
    setBusy(false);
    if (error || !movieData)
      return updateNotification('error', error || 'An error occurred');

    updateNotification('success', 'Movie added successfully!');
    resetState();
    onClose();
  };

  return (
    <ModalContainer visible={visible} onClose={onClose}>
      <div className="mb-5">
        <UploadProgress
          visible={!videoUploaded && videoSelected}
          message={getUploadProgressValue()}
          width={uploadProgress}
        />
      </div>
      {!videoSelected ? (
        <div className="flex h-full flex-col items-center justify-center">
          <TrailerSelector
            visible={!videoSelected}
            onTypeError={handleTypeError}
            handleChange={handleChange}
          />
        </div>
      ) : (
        <MovieForm
          busy={busy}
          onSubmit={!busy ? handleSubmit : null}
          btnTitle="Upload"
        />
      )}
    </ModalContainer>
  );
}

const TrailerSelector = ({
  visible,
  handleChange,
  onTypeError,
}: {
  visible: boolean;
  handleChange: (file: File) => void;
  onTypeError: (error: string) => void;
}) => {
  if (!visible) return null;

  return (
    <div className="flex h-20 items-center justify-center">
      <FileUploader
        handleChange={handleChange}
        onTypeError={onTypeError}
        types={['mp4', 'avi']}
      >
        <label
          htmlFor="trailer"
          className="flex size-48 cursor-pointer flex-col items-center justify-center rounded-full border border-dashed border-light-subtle text-secondary dark:border-dark-subtle dark:text-dark-subtle"
        >
          <AiOutlineCloudUpload size={80} />
          <p>Add Trailer</p>
        </label>
      </FileUploader>
    </div>
  );
};

const UploadProgress = ({
  width,
  message,
  visible,
}: {
  width: number;
  message: string;
  visible: boolean;
}) => {
  if (!visible) return null;

  return (
    <div className="rounded bg-white p-3 drop-shadow-lg dark:bg-secondary">
      <div className="relative h-3 overflow-hidden bg-light-subtle dark:bg-dark-subtle">
        <div
          style={{ width: width + '%' }}
          className="absolute left-0 h-full bg-secondary dark:bg-white"
        />
      </div>
      <p className="mt-1 animate-pulse font-semibold text-light-subtle dark:text-dark-subtle">
        {message}
      </p>
    </div>
  );
};
