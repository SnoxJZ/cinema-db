import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../hooks';

export default function NotVerified() {
  const { authInfo } = useAuth();
  const { isLoggedIn } = authInfo;
  const isVerified = authInfo.profile?.isVerified;

  const navigate = useNavigate();

  const navigateToVerification = () => {
    navigate('/auth/verification', { state: { user: authInfo.profile } });
  };

  return (
    <div>
      {isLoggedIn && !isVerified ? (
        <p className="bg-blue-50 p-2 text-center text-lg">
          Hello, your account is not verified
          <button
            onClick={navigateToVerification}
            className="ml-1 font-semibold text-blue-500 hover:underline"
          >
            click to verify your account
          </button>
        </p>
      ) : null}
    </div>
  );
}
