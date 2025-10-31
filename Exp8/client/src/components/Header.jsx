import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Header() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="h-14 flex items-center gap-4">
          <Link to="/" className="text-lg font-semibold text-gray-900 dark:text-gray-100">Classifieds</Link>
          <nav className="flex items-center gap-4 text-sm text-gray-700 dark:text-gray-300">
            <Link to="/products" className="hover:text-brand">Listings</Link>
            {user && <Link to="/products/new" className="hover:text-brand">Post Ad</Link>}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            {user ? (
              <>
                <span className="hidden sm:inline text-sm text-gray-600 dark:text-gray-400">Hi, {user.name}</span>
                <Link to="/my-listings" className="text-sm px-3 py-1.5 rounded-md border border-gray-300 hover:border-brand hover:text-brand">My Listings</Link>
                <Link to="/orders" className="text-sm px-3 py-1.5 rounded-md border border-gray-300 hover:border-brand hover:text-brand">Orders</Link>
                <Link to="/chat" className="text-sm px-3 py-1.5 rounded-md border border-gray-300 hover:border-brand hover:text-brand">Chat</Link>
                <button onClick={logout} className="text-sm px-3 py-1.5 rounded-md bg-brand text-black dark:text-white hover:bg-brand-dark">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm px-3 py-1.5 rounded-md border border-gray-300 text-black dark:text-white hover:border-brand hover:text-brand">Login</Link>
                <Link to="/register" className="text-sm px-3 py-1.5 rounded-md bg-brand text-black dark:text-white hover:bg-brand-dark">Register</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
