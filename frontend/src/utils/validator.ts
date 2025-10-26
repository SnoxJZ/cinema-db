import type { MovieFormT } from '@/types';

export const validateMovie = (movieInfo: MovieFormT) => {
  const {
    title,
    storyLine,
    language,
    releseDate,
    status,
    type,
    genres,
    tags,
    cast,
  } = movieInfo;

  if (!title.trim()) return { error: 'Title cannot be empty!' };
  if (!storyLine.trim()) return { error: 'Storyline cannot be empty!' };
  if (!language.trim()) return { error: 'Language cannot be empty!' };
  if (!releseDate.trim()) return { error: 'Release date cannot be empty!' };
  if (!status.trim()) return { error: 'Status cannot be empty!' };
  if (!type.trim()) return { error: 'Category cannot be empty!' };

  if (!genres.length) return { error: 'Genre cannot be empty!' };

  if (!tags.length) return { error: 'Tags cannot be empty!' };
  for (const tag of tags) {
    if (!tag.trim()) return { error: 'Invalid tags!' };
  }

  if (!cast?.length) return { error: 'Cast information cannot be empty!' };
  for (const c of cast) {
    if (typeof c !== 'object') return { error: 'Invalid cast information!' };
  }

  return { error: null };
};
