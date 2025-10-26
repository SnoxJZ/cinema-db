export const isValidEmail = (email: string) => {
  const isValid = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

  return isValid.test(email);
};

export const getToken = () => localStorage.getItem('auth-token');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const catchError = (error: any) => {
  const { response } = error;
  if (response?.data) return response.data;

  return { error: error.message || error };
};

export const renderItem = (result: { avatar: string; name: string }) => {
  return (
    <div className="flex overflow-hidden rounded">
      <img src={result.avatar} alt="" className="size-16 object-cover" />
      <p className="font-semibold dark:text-white">{result.name}</p>
    </div>
  );
};

export const getPoster = (posters: string[] | undefined) => {
  if (!posters || !posters.length) return null;

  if (posters.length > 2) return posters[1];

  return posters[0];
};

export const convertReviewCount = (count = 0) => {
  if (count <= 999) return count;

  return (count / 1000).toFixed(2) + 'k';
};

export const getEmbedUrl = (url: string | undefined | null) => {
  if (!url) return '';
  const videoId = url.split('v=')[1];
  return `https://www.youtube.com/embed/${videoId}`;
};
