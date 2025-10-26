import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';

import { useAuth } from './index';

export const useUpdateUser = () => {
  const { handleUpdateAvatar, handleUpdateProfile, authInfo } = useAuth();
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState('');
  const [name, setName] = useState<string>(authInfo.profile?.name || '');
  const [email, setEmail] = useState<string>(authInfo.profile?.email || '');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    oldPassword: '',
  });

  useEffect(() => {
    setName(authInfo.profile?.name || '');
    setEmail(authInfo.profile?.email || '');
  }, [authInfo.profile]);

  const handleImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
    console.log('File input changed:', e.target.files);
    const file = e.target.files?.[0];
    if (file) {
      console.log('Selected file:', file.name, file.size);
      if (file.size > 5 * 1024 * 1024) {
        setPasswordError('Image size must be less than 5MB');
        return;
      }

      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async () => {
    if (!selectedImage) return;

    setIsUploadingImage(true);

    try {
      await handleUpdateAvatar(selectedImage);
      setSelectedImage(null);
      setImagePreview(null);
      setPasswordError('');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setPasswordError(error || 'Failed to upload image');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleUpdateUser = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name || !email) {
      setPasswordError('Name and email are required');
      return;
    }

    if (passwordData.oldPassword && !passwordData.newPassword) {
      setPasswordError('New password is required');
      return;
    }

    if (passwordData.newPassword && !passwordData.oldPassword) {
      setPasswordError('Old password is required');
      return;
    }

    setIsChangingPassword(true);

    try {
      await handleUpdateProfile({
        name,
        email,
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordError('');
    } catch (error) {
      setPasswordError((error as string) || 'Failed to update profile');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return {
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
    handleImageSelect,
    handleUpdateUser,
    handleImageUpload,
  };
};
