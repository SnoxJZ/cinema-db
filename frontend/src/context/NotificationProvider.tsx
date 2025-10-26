import { createContext, useState, type ReactNode } from 'react';

interface NotificationContextType {
  updateNotification: (type: string, value: string) => void;
}

export const NotificationContext =
  createContext<NotificationContextType | null>(null);

let timeoutId: ReturnType<typeof setTimeout> | null = null;
export default function NotificationProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [notification, setNotification] = useState('');
  const [classes, setClasses] = useState('');

  const updateNotification = (type: string, value: string) => {
    if (timeoutId) clearTimeout(timeoutId);

    switch (type) {
      case 'error':
        setClasses('bg-red-500');
        break;
      case 'success':
        setClasses('bg-green-500');
        break;
      case 'warning':
        setClasses('bg-orange-500');
        break;
      default:
        setClasses('bg-red-500');
    }
    setNotification(value);

    timeoutId = setTimeout(() => {
      setNotification('');
    }, 3000);
  };

  return (
    <NotificationContext.Provider value={{ updateNotification }}>
      {children}
      {notification && (
        <div className="fixed bottom-4 right-4">
          <div className="bounce-custom rounded shadow-md shadow-gray-400">
            <p className={classes + ' px-4 py-2 font-semibold text-white'}>
              {notification}
            </p>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
}
