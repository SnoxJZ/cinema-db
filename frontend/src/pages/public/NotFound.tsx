import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
      <h1 className="mb-4 text-4xl font-bold text-gray-800">404</h1>
      <p className="mb-8 text-lg text-gray-600">Page not found</p>
      <Link
        to="/"
        className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
      >
        Back to Home
      </Link>
    </div>
  );
};

export default NotFoundPage;
