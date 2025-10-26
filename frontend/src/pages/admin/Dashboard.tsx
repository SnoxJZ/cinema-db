import { useEffect, useState } from 'react';

import { getAppInfo } from '@/api/admin';
import LatestUploads from '@/components/admin/LatestUploads';
import { useNotification } from '@/hooks';

import AppInfoBox from '../../components/AppInfoBox';
import MostRatedMovies from '../../components/MostRatedMovies';

export default function Dashboard() {
  const [appInfo, setAppInfo] = useState({
    movieCount: 0,
    reviewCount: 0,
    userCount: 0,
  });

  const { updateNotification } = useNotification();

  const fetchAppInfo = async () => {
    const { data, error } = await getAppInfo();

    if (error || !data)
      return updateNotification('error', error || 'An error occurred');

    setAppInfo({ ...data.appInfo });
  };

  useEffect(() => {
    fetchAppInfo();
  }, []);

  return (
    <div className="grid grid-cols-3 gap-5 p-5">
      <AppInfoBox
        title="Total Movies/Series"
        subTitle={appInfo.movieCount.toLocaleString()}
      />
      <AppInfoBox
        title="Total Reviews"
        subTitle={appInfo.reviewCount.toLocaleString()}
      />
      <AppInfoBox
        title="Total Users"
        subTitle={appInfo.userCount.toLocaleString()}
      />

      <LatestUploads />
      <MostRatedMovies />
    </div>
  );
}
