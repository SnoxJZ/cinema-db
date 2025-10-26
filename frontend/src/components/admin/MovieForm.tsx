import { useEffect, useState } from 'react';

import { useNotification } from '@/hooks';
import type { Actor, Movie, MovieFormT } from '@/types';

import {
  languageOptions,
  statusOptions,
  typeOptions,
} from '../../utils/options';
import { commonInputClasses } from '../../utils/theme';
import { validateMovie } from '../../utils/validator';
import CastForm from '../form/CastForm';
import Submit from '../form/Submit';
import Label from '../Label';
import LabelWithBadge from '../LabelWithBadge';
import CastModal from '../models/CastModal';
import GenresModal from '../models/GenresModal';
import WritersModal from '../models/WritersModal';
import PosterSelector from '../PosterSelector';
import Selector from '../Selector';
import TagsInput from '../TagsInput';
import ViewAllBtn from '../ViewAllButton';
import WriterSelector from '../WriterSelector';

import DirectorSelector from './DirectorSelector';
import GenresSelector from './GenresSelector';

const defaultMovieInfo: MovieFormT = {
  title: '',
  storyLine: '',
  tags: [],
  cast: [],
  director: undefined,
  writers: [],
  releseDate: '',
  poster: undefined,
  genres: [],
  type: '',
  language: '',
  status: 'private' as const,
};

interface MovieFormProps {
  busy: boolean;
  btnTitle: string;
  initialState?: Movie | null;
  onSubmit: ((data: FormData) => Promise<void>) | null;
  onClos?: () => void;
}

export default function MovieForm({
  busy,
  btnTitle,
  initialState,
  onSubmit,
  // onClose,
}: MovieFormProps) {
  const [movieInfo, setMovieInfo] = useState<MovieFormT>({
    ...defaultMovieInfo,
  });
  const [showWritersModal, setShowWritersModal] = useState(false);
  const [showCastModal, setShowCastModal] = useState(false);
  const [selectedPosterForUI, setSelectedPosterForUI] = useState('');
  const [showGenresModal, setShowGenresModal] = useState(false);

  const { updateNotification } = useNotification();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { error } = validateMovie(movieInfo);
    if (error) return updateNotification('error', error);

    const { tags, genres, cast, writers, director, poster } = movieInfo;

    const formData = new FormData();

    const finalCast = cast?.map((c) => ({
      actor: c.actor.id,
      roleAs: c.roleAs,
      leadActor: c.leadActor,
    }));

    const finalWriters = writers?.length ? writers.map((w) => w.id) : [];

    const finalMovieInfo = {
      ...movieInfo,
      tags: JSON.stringify(tags),
      genres: JSON.stringify(genres),
      cast: JSON.stringify(finalCast),
      writers: JSON.stringify(finalWriters),
      director: director?.id,
    };

    if (poster) finalMovieInfo.poster = poster;

    for (const key in finalMovieInfo) {
      const value = finalMovieInfo[key as keyof typeof finalMovieInfo];
      if (value !== undefined && value !== null) {
        if (typeof value === 'string' || value instanceof Blob) {
          formData.append(key, value);
        } else {
          formData.append(key, JSON.stringify(value));
        }
      }
    }

    onSubmit?.(formData);
  };

  const updatePosterForUI = (file: File) => {
    const url = URL.createObjectURL(file);
    setSelectedPosterForUI(url);
  };

  const handleChange = ({
    target,
  }:
    | React.ChangeEvent<HTMLInputElement>
    | React.ChangeEvent<HTMLTextAreaElement>
    | React.ChangeEvent<HTMLSelectElement>) => {
    const { value, name } = target;
    if (name === 'poster' && 'files' in target && target.files) {
      const poster = target.files[0];
      updatePosterForUI(poster);
      return setMovieInfo({ ...movieInfo, poster });
    }

    setMovieInfo({ ...movieInfo, [name]: value });
  };

  const updateTags = (tags: string[]) => {
    setMovieInfo({ ...movieInfo, tags });
  };

  const updateDirector = (profile: { id: string; name: string }) => {
    setMovieInfo({ ...movieInfo, director: profile });
  };

  const updateCast = (castInfo: {
    actor: Actor;
    roleAs: string;
    leadActor: boolean;
  }) => {
    const { cast = [] } = movieInfo;
    setMovieInfo({ ...movieInfo, cast: [...cast, castInfo] });
  };

  const updateGenres = (genres: string[]) => {
    setMovieInfo({ ...movieInfo, genres });
  };

  const updateWriters = (profile: {
    id: string;
    name: string;
    avatar: string;
  }) => {
    const { writers } = movieInfo;
    if (writers) {
      for (const writer of writers) {
        if (writer.id === profile.id) {
          return updateNotification(
            'warning',
            'This profile is already selected!',
          );
        }
      }
    }
    setMovieInfo({ ...movieInfo, writers: [...(writers || []), profile] });
  };

  const hideWritersModal = () => {
    setShowWritersModal(false);
  };

  const displayWritersModal = () => {
    setShowWritersModal(true);
  };

  const hideCastModal = () => {
    setShowCastModal(false);
  };

  const displayCastModal = () => {
    setShowCastModal(true);
  };

  const hideGenresModal = () => {
    setShowGenresModal(false);
  };

  const displayGenresModal = () => {
    setShowGenresModal(true);
  };

  const handleWriterRemove = (profileId: string) => {
    const { writers } = movieInfo;
    const newWriters = writers?.filter(({ id }) => id !== profileId);
    if (!newWriters?.length) hideWritersModal();
    setMovieInfo({ ...movieInfo, writers: [...(newWriters || [])] });
  };

  const handleCastRemove = (profileId: string) => {
    const { cast } = movieInfo;
    const newCast = cast?.filter(({ actor }) => actor.id !== profileId);
    if (!newCast?.length) hideCastModal();
    setMovieInfo({ ...movieInfo, cast: [...(newCast || [])] });
  };

  useEffect(() => {
    if (initialState) {
      setMovieInfo({
        ...initialState,
        releseDate: initialState.releseDate.split('T')[0],
        poster: null,
        writers: initialState.writers?.map((w) =>
          typeof w === 'string'
            ? { id: w, name: '', avatar: '' }
            : {
                id: w.id,
                name: w.name,
                avatar: w.avatar?.url || '',
              },
        ),
        cast: initialState.cast?.map((c) => ({
          actor: c.actor,
          roleAs: c.roleAs,
          leadActor: c.leadActor,
        })),
      });
      setSelectedPosterForUI(initialState.poster?.url || '');
    }
  }, [initialState]);

  const {
    title,
    storyLine,
    writers,
    cast,
    tags,
    releseDate,
    genres,
    type,
    language,
    status,
  } = movieInfo;

  return (
    <>
      <form onSubmit={handleSubmit} className="flex space-x-3">
        <div className="w-[70%] space-y-5">
          <div>
            <Label htmlFor="title">Title</Label>
            <input
              id="title"
              value={title}
              onChange={handleChange}
              name="title"
              type="text"
              className={
                commonInputClasses + ' border-b-2 text-xl font-semibold'
              }
              placeholder="e.g: Succession"
            />
          </div>

          <div>
            <Label htmlFor="storyLine">Storyline</Label>
            <textarea
              value={storyLine}
              onChange={handleChange}
              name="storyLine"
              id="storyLine"
              className={commonInputClasses + ' h-24 resize-none border-b-2'}
              placeholder="Movie storyline..."
            ></textarea>
          </div>

          <div>
            <Label htmlFor="tags">Tags</Label>
            <TagsInput value={tags} name="tags" onChange={updateTags} />
          </div>

          <DirectorSelector onSelect={updateDirector} />

          <div className="">
            <div className="flex justify-between">
              <LabelWithBadge badge={writers?.length || 0} htmlFor="writers">
                Writers
              </LabelWithBadge>
              <ViewAllBtn
                onClick={displayWritersModal}
                visible={!!writers?.length}
              >
                View All
              </ViewAllBtn>
            </div>
            <WriterSelector onSelect={updateWriters} />
          </div>

          <div>
            <div className="flex justify-between">
              <LabelWithBadge badge={cast?.length || 0}>
                Add Cast
              </LabelWithBadge>
              <ViewAllBtn onClick={displayCastModal} visible={!!cast?.length}>
                View All
              </ViewAllBtn>
            </div>
            <CastForm onSubmit={updateCast} />
          </div>

          <input
            type="date"
            className={commonInputClasses + ' w-auto rounded border-2 p-1'}
            onChange={handleChange}
            name="releseDate"
            value={releseDate}
          />

          <Submit busy={busy} value={btnTitle} type="submit" />
        </div>
        <div className="w-[30%] space-y-5">
          <PosterSelector
            name="poster"
            onChange={handleChange}
            selectedPoster={selectedPosterForUI}
            lable="Select poster..."
            accept="image/jpg, image/jpeg, image/png"
          />
          <GenresSelector badge={genres.length} onClick={displayGenresModal} />

          <Selector
            onChange={handleChange}
            name="type"
            value={type}
            options={typeOptions}
            label="Genre"
          />
          <Selector
            onChange={handleChange}
            name="language"
            value={language}
            options={languageOptions}
            label="Language"
          />
          <Selector
            onChange={handleChange}
            name="status"
            value={status}
            options={statusOptions}
            label="Status"
          />
        </div>
      </form>

      <WritersModal
        onClose={hideWritersModal}
        visible={showWritersModal}
        profiles={writers}
        onRemoveClick={handleWriterRemove}
      />

      <CastModal
        onClose={hideCastModal}
        casts={cast}
        visible={showCastModal}
        onRemoveClick={handleCastRemove}
      />
      <GenresModal
        onSubmit={updateGenres}
        visible={showGenresModal}
        onClose={hideGenresModal}
        previousSelection={genres}
      />
    </>
  );
}
