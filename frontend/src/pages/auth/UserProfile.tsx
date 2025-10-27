import { useEffect, useRef, useState } from 'react';
import { FaPlus, FaRegTrashAlt } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';

import { getReviewsByUser } from '@/api/review';
import Container from '@/components/Container';
import Loading from '@/components/Loading';
import PlaylistCreate from '@/components/models/PlaylistCreate';
import RatingStar from '@/components/RatingStar';
import { useAuth, useNotification, usePlaylist } from '@/hooks';
import { useUpdateUser } from '@/hooks/useUpdateUser';

const UserProfile = () => {
  const { authInfo } = useAuth();
  const { profile } = authInfo;
  const navigate = useNavigate();
  const [showPlaylistCreate, setShowPlaylistCreate] = useState(false);
  const [reviews, setReviews] = useState<
    {
      id: string;
      movieId: string;
      movieTitle: string;
      rating: number;
      content: string;
    }[]
  >([]);
  const { updateNotification } = useNotification();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { playlists, fetchPlaylists, isLoading, deletePlaylist } =
    usePlaylist();

  const fetchReviews = async () => {
    const { data, error } = await getReviewsByUser();
    if (error || !data)
      return updateNotification('error', error || 'An error occurred');
    setReviews(data.reviews);
  };

  const {
    selectedImage,
    setSelectedImage,
    imagePreview,
    setImagePreview,
    name,
    setName,
    email,
    setEmail,
    passwordData,
    setPasswordData,
    passwordError,
    isUploadingImage,
    isChangingPassword,
    handleImageUpload,
    handleImageSelect,
    handleUpdateUser,
  } = useUpdateUser();

  useEffect(() => {
    fetchPlaylists();
    fetchReviews();
  }, []);

  const handleDeletePlaylist = async (
    e: React.MouseEvent<HTMLButtonElement>,
    playlistId: string,
  ) => {
    e.stopPropagation();
    await deletePlaylist(playlistId);
  };

  if (!profile || isLoading) return <Loading />;

  return (
    <div className="min-h-screen bg-white pb-10 dark:bg-primary">
      <Container className="space-y-6 p-4 xl:px-0">
        <div className="flex w-full flex-col gap-3">
          <form
            className="mx-auto flex flex-col items-start gap-10"
            onSubmit={handleUpdateUser}
          >
            <div className="flex items-center gap-4">
              <div className="relative">
                {profile?.avatar?.url ? (
                  <img
                    src={profile.avatar.url}
                    alt="profile"
                    className="size-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
                    <span className="text-lg font-medium text-white">
                      {profile?.name?.[0]}
                    </span>
                  </div>
                )}
                {imagePreview && (
                  <div className="absolute inset-0 overflow-hidden rounded-full border border-gray-300 bg-gray-300">
                    <img
                      src={imagePreview}
                      alt="preview"
                      className="size-full object-cover"
                    />
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="image-upload"
                />
                <button
                  type="button"
                  className="cursor-pointer rounded bg-secondary px-2 py-1 text-white transition hover:bg-secondary/90 dark:bg-white dark:text-secondary dark:hover:bg-white/90"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Upload Image
                </button>

                {selectedImage && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="rounded bg-secondary px-2 py-1 text-white transition hover:bg-secondary/90 dark:bg-white dark:text-secondary dark:hover:bg-white/90"
                      onClick={handleImageUpload}
                      disabled={isUploadingImage}
                    >
                      {isUploadingImage ? 'Uploading...' : 'Upload'}
                    </button>
                    <button
                      type="button"
                      className="rounded bg-red-500 px-2 py-1 text-white transition hover:bg-red-500/90 dark:bg-white dark:text-red-500 dark:hover:bg-white/90"
                      onClick={() => {
                        setSelectedImage(null);
                        setImagePreview(null);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex w-full flex-col items-center gap-4 md:flex-row">
                <div className="flex flex-col gap-2">
                  <label htmlFor="password" className="text-sm dark:text-white">
                    New Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    placeholder="********"
                    className="rounded border border-gray-300 bg-white px-4 py-1 dark:border-gray-600 dark:bg-secondary dark:text-white"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="oldPassword"
                    className="text-sm dark:text-white"
                  >
                    Old Password
                  </label>
                  <input
                    id="oldPassword"
                    type="password"
                    placeholder="********"
                    className="rounded border border-gray-300 bg-white px-4 py-1 dark:border-gray-600 dark:bg-secondary dark:text-white"
                    value={passwordData.oldPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        oldPassword: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="flex w-full flex-col items-center gap-4 md:flex-row">
                <div className="flex flex-col gap-2">
                  <label htmlFor="name" className="text-sm dark:text-white">
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    className="rounded border border-gray-300 bg-white px-4 py-1 dark:border-gray-600 dark:bg-secondary dark:text-white"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="email" className="text-sm dark:text-white">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="john.doe@example.com"
                    className="rounded border border-gray-300 bg-white px-4 py-1 dark:border-gray-600 dark:bg-secondary dark:text-white"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-64 rounded bg-secondary px-4 py-2 text-white transition hover:bg-secondary/90 dark:bg-white dark:text-secondary dark:hover:bg-white/90"
                disabled={isChangingPassword}
              >
                {isChangingPassword ? 'Saving...' : 'Save Changes'}
              </button>
              <p className="text-sm text-red-500">{passwordError}</p>
            </div>
          </form>
        </div>

        <div className="flex w-full flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-highlight dark:text-highlight-dark">
              Playlists
            </h2>
            <button
              onClick={() => setShowPlaylistCreate(true)}
              className="flex items-center gap-2 rounded-md border border-light-subtle px-2 py-1 text-sm dark:border-dark-subtle dark:text-white"
            >
              <FaPlus className="size-3" /> Create Playlist
            </button>
          </div>
          <div className="flex flex-wrap gap-6">
            <Link to={`/user/${profile.id}/favorites`}>
              <div className="flex h-[200px] w-[150px] items-center justify-center rounded bg-gradient-to-br from-[#0D324D] to-[#7F5A83] text-lg text-slate-200">
                Favorites ({profile?.favorites?.length || 0})
              </div>
            </Link>
            {playlists.map((playlist) => (
              <div
                key={playlist.id}
                onClick={() => navigate(`/playlist/${playlist.id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    navigate(`/playlist/${playlist.id}`);
                  }
                }}
              >
                <div className="relative flex h-[200px] w-[150px] items-center justify-center rounded bg-gradient-to-br from-[#380036] to-[#0CBABA] text-lg text-slate-200">
                  {playlist.name}
                  <button
                    className="absolute right-1.5 top-1.5"
                    onClick={(e) => handleDeletePlaylist(e, playlist.id)}
                  >
                    <FaRegTrashAlt className="size-4 text-red-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex w-full flex-col gap-3">
          <h2 className="text-xl font-semibold text-highlight dark:text-highlight-dark">
            Your Reviews
          </h2>
          <div className="flex flex-col gap-6">
            {reviews.map((review) => (
              <div key={review.id}>
                <div className="flex items-center gap-2">
                  <Link
                    to={`/movie/${review.movieId}`}
                    className="text-lg font-semibold text-secondary dark:text-white"
                  >
                    {review.movieTitle}
                  </Link>
                  <RatingStar rating={review.rating} />
                </div>
                <p className="text-sm text-light-subtle dark:text-dark-subtle">
                  {review.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Container>
      <PlaylistCreate
        visible={showPlaylistCreate}
        onClose={() => setShowPlaylistCreate(false)}
      />
    </div>
  );
};

export default UserProfile;
