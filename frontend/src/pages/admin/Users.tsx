import { useEffect, useState } from 'react';

import { blockUser, changeUserRole, getUsers, unblockUser } from '@/api/admin';
import Loading from '@/components/Loading';
import NextAndPrevButton from '@/components/NextAndPrevButton';
import NotFoundText from '@/components/NotFoundText';
import { useAuth, useNotification } from '@/hooks';
import type { BlockDuration, User, UserRole } from '@/types';

const Users = () => {
  const [users, setUsers] = useState<User[] | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const { isAdmin } = useAuth();
  const { updateNotification } = useNotification();

  const fetchUsers = async () => {
    const { data, error } = await getUsers(currentPage, 10, searchQuery);
    if (error || !data)
      return updateNotification('error', error || 'An error occurred');

    setUsers(data.users);
    setTotalPages(data.totalPages);
  };

  const handleOnBlockUser = async (userId: string, duration: BlockDuration) => {
    const { data, error } = await blockUser(userId, duration);
    if (error || !data)
      return updateNotification('error', error || 'An error occurred');

    updateNotification('success', data.message);
    setUsers((prev) =>
      prev?.map((user) =>
        user.id === userId
          ? { ...user, isBlocked: true, blockedUntil: data.user.blockedUntil }
          : user,
      ),
    );
  };

  const handleOnUnblockUser = async (userId: string) => {
    const { data, error } = await unblockUser(userId);
    if (error || !data)
      return updateNotification('error', error || 'An error occurred');

    updateNotification('success', data.message);
    setUsers((prev) =>
      prev?.map((user) =>
        user.id === userId
          ? { ...user, isBlocked: false, blockedUntil: undefined }
          : user,
      ),
    );
  };

  const handleOnChangeUserRole = async (
    userId: string,
    role: UserRole | undefined,
  ) => {
    if (!role) return;
    const { data, error } = await changeUserRole(userId, role);
    if (error || !data)
      return updateNotification('error', error || 'An error occurred');

    updateNotification('success', data.message);
    setUsers((prev) =>
      prev?.map((user) => (user.id === userId ? { ...user, role } : user)),
    );
  };

  const handleOnNextClick = () => {
    if (currentPage >= totalPages) return;
    setCurrentPage((prev) => prev + 1);
  };

  const handleOnPrevClick = () => {
    if (currentPage <= 1) return;
    setCurrentPage((prev) => prev - 1);
  };

  useEffect(() => {
    const timeoutId = setTimeout(
      () => {
        fetchUsers();
      },
      searchQuery ? 300 : 0,
    );

    return () => clearTimeout(timeoutId);
  }, [searchQuery, currentPage]);

  if (!users?.length) return <Loading />;

  return (
    <div className="min-h-screen space-y-3 p-5 dark:bg-primary">
      <div className="mb-5 flex justify-end">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="Search users..."
          className="rounded border-2 bg-transparent px-2 py-1 text-sm text-primary outline-none transition dark:text-white"
        />
      </div>
      <NotFoundText visible={!users?.length} text="Not found" />

      <div className="flex flex-col gap-5">
        {users?.map((user) => (
          <UserItem
            user={user}
            key={user.id}
            onBlockUser={handleOnBlockUser}
            onUnblockUser={handleOnUnblockUser}
            isAdmin={isAdmin}
            onChangeUserRole={handleOnChangeUserRole}
          />
        ))}
      </div>

      <NextAndPrevButton
        className="mt-5"
        onNextClick={handleOnNextClick}
        onPrevClick={handleOnPrevClick}
      />
    </div>
  );
};

export default Users;

const UserItem = ({
  user,
  onBlockUser,
  onUnblockUser,
  isAdmin,
  onChangeUserRole,
}: {
  user: User;
  onBlockUser: (userId: string, duration: BlockDuration) => void;
  onUnblockUser: (userId: string) => void;
  isAdmin: boolean;
  onChangeUserRole: (userId: string, role: UserRole | undefined) => void;
}) => {
  const [duration, setDuration] = useState<BlockDuration | undefined>(
    undefined,
  );
  const [role, setRole] = useState<UserRole | undefined>(user.role);
  return (
    <div className="flex flex-wrap items-center justify-between gap-5 border-b py-4">
      <div className="flex items-center gap-3">
        {user.avatar?.url ? (
          <img
            src={user.avatar.url}
            alt={user.name}
            className="size-12 rounded-full object-cover"
          />
        ) : (
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 capitalize text-white">
            {user.name?.[0]}
          </div>
        )}
        <div className="space-y-1">
          <h2 className="text-lg font-medium text-primary dark:text-white">
            {user.name}
          </h2>
          <p className="text-sm text-primary dark:text-white">{user.email}</p>
        </div>
      </div>
      <div className="flex flex-col items-center gap-3 lg:flex-row">
        {isAdmin && (
          <div className="flex items-center gap-2">
            <select
              onChange={(e) => setRole(e.target.value as UserRole)}
              value={role}
              className="rounded border border-gray-300 bg-white px-4 py-2 text-sm dark:border-gray-600 dark:bg-secondary dark:text-white"
            >
              <option value={undefined}>Select Role</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="moderator">Moderator</option>
            </select>
            <button
              type="button"
              className="rounded bg-blue-500 px-4 py-1 text-sm text-white"
              onClick={() => onChangeUserRole(user.id, role)}
            >
              Change Role
            </button>
          </div>
        )}
        {!user.isBlocked ? (
          <div className="flex items-center gap-2">
            <select
              onChange={(e) => setDuration(e.target.value as BlockDuration)}
              value={duration}
              className="rounded border border-gray-300 bg-white px-4 py-2 text-sm dark:border-gray-600 dark:bg-secondary dark:text-white"
            >
              <option value={undefined}>Select Duration</option>
              <option value="1d">1 Day</option>
              <option value="1w">1 Week</option>
              <option value="1m">1 Month</option>
              <option value="3m">3 Months</option>
              <option value="6m">6 Months</option>
              <option value="1y">1 Year</option>
              <option value="permanent">Permanent</option>
            </select>
            <button
              type="button"
              className="rounded bg-red-500 px-4 py-1 text-sm text-white"
              onClick={() => onBlockUser(user.id, duration)}
            >
              Block
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <p className="text-sm text-primary dark:text-white">
              Blocked until{' '}
              {user.blockedUntil
                ? new Date(user.blockedUntil).toLocaleDateString()
                : 'Permanent'}
            </p>
            <button
              type="button"
              className="rounded bg-green-500 px-4 py-1 text-sm text-white"
              onClick={() => onUnblockUser(user.id)}
            >
              Unblock
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
