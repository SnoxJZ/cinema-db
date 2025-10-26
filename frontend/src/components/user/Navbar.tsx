import { BsFillSunFill } from 'react-icons/bs';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth, useTheme } from '../../hooks';
import Container from '../Container';
import AppSearchForm from '../form/AppSearchForm';

export default function Navbar() {
  const { toggleTheme } = useTheme();
  const { authInfo, handleLogout } = useAuth();
  const { isLoggedIn } = authInfo;
  const navigate = useNavigate();
  const handleLogoutAndRedirect = () => {
    handleLogout();
    navigate('/auth/signin');
  };
  const handleSearchSubmit = (query: string) => {
    navigate('/movie/search?title=' + query);
  };

  return (
    <div className="bg-secondary shadow-sm shadow-gray-500">
      <Container className="p-2">
        <div className="flex items-center justify-between">
          <Link to="/">
            <img src="./logo.png" alt="" className="h-8 sm:h-10" />
          </Link>

          <ul className="flex items-center space-x-2 sm:space-x-4">
            <li>
              <button
                onClick={toggleTheme}
                className="rounded bg-dark-subtle p-1 text-lg dark:bg-white sm:text-2xl"
              >
                <BsFillSunFill className="text-secondary" size={24} />
              </button>
            </li>
            <li>
              <AppSearchForm
                placeholder="Search..."
                inputClassName="border-dark-subtle text-white focus:border-white sm:w-auto w-40 max-smsm:text-base"
                onSubmit={handleSearchSubmit}
              />
            </li>
            <li>
              {isLoggedIn ? (
                <button
                  onClick={handleLogoutAndRedirect}
                  className="rounded-md border px-2 py-1 text-base font-semibold text-white"
                >
                  Logout
                </button>
              ) : (
                <Link
                  className="rounded-md border px-2 py-1 text-base font-semibold text-white"
                  to="/auth/signin"
                >
                  Sign In
                </Link>
              )}
            </li>
          </ul>
        </div>
      </Container>
    </div>
  );
}
