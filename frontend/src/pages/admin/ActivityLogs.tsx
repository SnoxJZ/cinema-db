// pages/ActivityLogs.tsx
import { useEffect, useState } from 'react';

import { getActivityLogs } from '@/api/admin';
import NextAndPrevButton from '@/components/NextAndPrevButton';
import { useNotification } from '@/hooks';
import type { ActivityLog, ActivityAction } from '@/types';

const ActivityLogs = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionFilter, setActionFilter] = useState<ActivityAction | ''>('');

  const { updateNotification } = useNotification();

  const fetchLogs = async () => {
    const { data, error } = await getActivityLogs(
      currentPage,
      20,
      undefined,
      actionFilter || undefined,
    );
    if (error || !data)
      return updateNotification('error', error || 'An error occurred');

    setLogs(data.logs);
    setTotalPages(data.totalPages);
  };

  useEffect(() => {
    fetchLogs();
  }, [currentPage, actionFilter]);

  const handleOnNextClick = () => {
    if (currentPage >= totalPages) return;
    setCurrentPage((p) => p + 1);
  };

  const handleOnPrevClick = () => {
    if (currentPage <= 1) return;
    setCurrentPage((p) => p - 1);
  };

  const getActionLabel = (action: ActivityAction) => {
    const labels: Record<ActivityAction, string> = {
      login: '🔐 Login',
      register: '✅ Register',
      create_review: '✍️ Create Review',
      delete_review: '🗑️ Delete Review',
      update_review: '📝 Update Review',
      block_user: '🚫 Block User',
      unblock_user: '✅ Unblock User',
      change_role: '👤 Change Role',
      upload_avatar: '🖼️ Upload Avatar',
      update_profile: '📝 Update Profile',
      create_actor: '🎭 Create Actor',
      update_actor: '🎭 Update Actor',
      delete_actor: '🎭 Delete Actor',
      create_movie: '🎬 Create Movie',
      update_movie: '🎬 Update Movie',
      delete_movie: '🎬 Delete Movie',
    };
    return labels[action] || action;
  };

  return (
    <div className="min-h-screen space-y-3 p-5 dark:bg-primary">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary dark:text-white">
          Activity Logs
        </h1>
        <select
          value={actionFilter}
          onChange={(e) => {
            setActionFilter(e.target.value as ActivityAction | '');
            setCurrentPage(1);
          }}
          className="rounded border bg-white px-4 py-2 dark:bg-secondary dark:text-white"
        >
          <option value="">All Actions</option>
          <option value="login">Login</option>
          <option value="register">Register</option>
          <option value="create_review">Create Review</option>
          <option value="delete_review">Delete Review</option>
          <option value="block_user">Block User</option>
          <option value="unblock_user">Unblock User</option>
          <option value="change_role">Change Role</option>
          <option value="create_movie">Create Movie</option>
          <option value="update_movie">Update Movie</option>
          <option value="delete_movie">Delete Movie</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-lg bg-white dark:bg-secondary">
        <table className="w-full">
          <thead>
            <tr className="border-b dark:border-gray-700">
              <th className="p-3 text-left text-primary dark:text-white">
                User
              </th>
              <th className="p-3 text-left text-primary dark:text-white">
                Action
              </th>
              <th className="p-3 text-left text-primary dark:text-white">
                Date
              </th>
              <th className="p-3 text-left text-primary dark:text-white">IP</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b dark:border-gray-700">
                <td className="p-3 text-primary dark:text-white">
                  <div>
                    <div className="font-medium">{log.user.name}</div>
                    <div className="text-sm text-gray-500">
                      {log.user.email}
                    </div>
                  </div>
                </td>
                <td className="p-3 text-primary dark:text-white">
                  {getActionLabel(log.action)}
                </td>
                <td className="p-3 text-sm text-primary dark:text-white">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
                <td className="p-3 text-sm text-gray-500">{log.ip || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <NextAndPrevButton
        className="mt-5"
        onNextClick={handleOnNextClick}
        onPrevClick={handleOnPrevClick}
      />
    </div>
  );
};

export default ActivityLogs;
