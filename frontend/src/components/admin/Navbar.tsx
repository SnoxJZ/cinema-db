import { AiOutlineHome } from 'react-icons/ai';
import { BiMoviePlay } from 'react-icons/bi';
import { FaUserNinja } from 'react-icons/fa';
import { FiLogOut } from 'react-icons/fi';
import { Link, NavLink, useNavigate } from 'react-router-dom';

import { useAuth } from '@/hooks';

export default function Navbar() {
  const { handleLogout } = useAuth();
  const navigate = useNavigate();
  const handleLogoutAndRedirect = () => {
    handleLogout();
    navigate('/auth/signin');
  };
  return (
    <nav className="min-h-screen w-48 border-r border-gray-300 bg-secondary">
      <div className="sticky top-0 flex h-screen flex-col justify-between pl-5">
        <ul>
          <li className="mb-8">
            <Link to="/">
              <img src="./logo.png" alt="" className="h-14 p-2" />
            </Link>
          </li>
          <li>
            <NavItem to="/admin">
              <AiOutlineHome />
              <span>Dashboard</span>
            </NavItem>
          </li>
          <li>
            <NavItem to="/admin/movies">
              <BiMoviePlay />
              <span>Movies</span>
            </NavItem>
          </li>
          <li>
            <NavItem to="/admin/actors">
              <FaUserNinja />
              <span>Actors</span>
            </NavItem>
          </li>
        </ul>
        <div className="flex flex-col items-start pb-5">
          <span className="text-xl font-semibold text-white">Admin</span>
          <button
            onClick={handleLogoutAndRedirect}
            className="flex items-center space-x-1 text-sm text-dark-subtle transition hover:text-white"
          >
            <FiLogOut />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
}

const NavItem = ({
  children,
  to,
}: {
  children: React.ReactNode;
  to: string;
}) => {
  const commonClasses =
    ' flex items-center text-lg space-x-2 p-2 hover:opacity-80';
  return (
    <NavLink
      className={({ isActive }) =>
        (isActive ? 'text-white' : 'text-gray-400') + commonClasses
      }
      to={to}
    >
      {children}
    </NavLink>
  );
};
