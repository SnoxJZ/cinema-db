import { useEffect, useState } from 'react';
import { ImSpinner3 } from 'react-icons/im';

import { useNotification } from '@/hooks';
import type { Actor, ActorForm } from '@/types';
import { commonInputClasses } from '@/utils/theme';

import PosterSelector from '../PosterSelector';
import Selector from '../Selector';

const defaultActorInfo = {
  name: '',
  about: '',
  avatar: null,
  gender: '',
};

const genderOptions = [
  { title: 'Male', value: 'male' },
  { title: 'Female', value: 'female' },
  { title: 'Other', value: 'other' },
];

const validateActor = ({ avatar, name, about, gender }: ActorForm) => {
  if (!name.trim()) return { error: 'Actor name cannot be empty!' };
  if (!about.trim()) return { error: 'Actor information cannot be empty!' };
  if (!gender.trim()) return { error: 'Actor gender cannot be empty!' };
  if (avatar && !avatar?.size) return { error: 'Invalid photo/avatar file!' };
  // if (avatar && !avatar?.type?.startsWith('image'))
  //   return { error: 'Invalid photo/avatar file!' };

  return { error: null };
};

interface ActorFormProps {
  title: string;
  initialState?: Actor | null;
  btnTitle: string;
  busy: boolean;
  onSubmit?: (data: FormData) => void;
}

export default function ActorForm({
  title,
  initialState,
  btnTitle,
  busy,
  onSubmit,
}: ActorFormProps) {
  const [actorInfo, setActorInfo] = useState<{
    name: string;
    about: string;
    avatar: File | null;
    gender: string;
  }>({ ...defaultActorInfo });
  const [selectedAvatarForUI, setSelectedAvatarForUI] = useState('');
  const { updateNotification } = useNotification();

  const updatePosterForUI = (file: File) => {
    const url = URL.createObjectURL(file);
    setSelectedAvatarForUI(url);
  };

  const handleChange = ({
    target,
  }: React.ChangeEvent<
    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  >) => {
    const { value, name } = target;
    const files = 'files' in target ? target.files : null;
    if (name === 'avatar' && files) {
      const file = files[0];
      updatePosterForUI(file);
      return setActorInfo({ ...actorInfo, avatar: file });
    }

    setActorInfo({ ...actorInfo, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { error } = validateActor(actorInfo);
    if (error) return updateNotification('error', error);

    const formData = new FormData();
    for (const key in actorInfo) {
      const value = actorInfo[key as keyof typeof actorInfo];
      if (key && value !== null) formData.append(key, value);
    }
    onSubmit?.(formData);
  };

  useEffect(() => {
    if (initialState) {
      setActorInfo({ ...initialState, avatar: null });
      setSelectedAvatarForUI(initialState.avatar?.url || '');
    }
  }, [initialState]);

  const { name, about, gender } = actorInfo;
  return (
    <form
      className="w-[35rem] rounded bg-white p-3 dark:bg-primary"
      onSubmit={handleSubmit}
    >
      <div className="mb-3 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-primary dark:text-white">
          {title}
        </h1>
        <button
          className="flex h-8 w-24 items-center justify-center rounded bg-primary text-white transition hover:opacity-80 dark:bg-white dark:text-primary"
          type="submit"
        >
          {busy ? <ImSpinner3 className="animate-spin" /> : btnTitle}
        </button>
      </div>

      <div className="flex space-x-2">
        <PosterSelector
          selectedPoster={selectedAvatarForUI}
          className="aspect-square size-36 object-cover"
          name="avatar"
          onChange={handleChange}
          lable="Select Photo"
          accept="image/jpg, image/jpeg, image/png"
        />
        <div className="flex grow flex-col space-y-2">
          <input
            placeholder="Full Name"
            type="text"
            className={commonInputClasses + ' border-b-2'}
            name="name"
            value={name}
            onChange={handleChange}
          />
          <textarea
            name="about"
            value={about}
            onChange={handleChange}
            placeholder="About"
            className={commonInputClasses + ' h-full resize-none border-b-2'}
          ></textarea>
        </div>
      </div>

      <div className="mt-3">
        <Selector
          options={genderOptions}
          label="Gender"
          value={gender}
          onChange={handleChange}
          name="gender"
        />
      </div>
    </form>
  );
}
