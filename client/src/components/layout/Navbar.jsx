import { Link, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-gray-900 text-white border-b border-gray-700 shadow-lg sticky top-0 z-50">
      <div className="px-6 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
          🎬 CineCircle
        </Link>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-gray-300 hover:text-white focus:outline-none"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="hover:text-red-400 transition-colors">Home</Link>
          {user && <Link to="/watchlist" className="hover:text-red-400 transition-colors">Watchlist</Link>}
          {user && <Link to="/friends" className="hover:text-blue-400 transition-colors">Friends</Link>}
          {user && <Link to="/profile" className="hover:text-purple-400 transition-colors">Profile</Link>}

          {user ? (
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 px-4 py-1.5 rounded-full transition-all shadow-md"
            >
              Logout
            </button>
          ) : (
            <>
              <Link to="/login" className="hover:text-gray-300 transition-colors">Login</Link>
              <Link to="/register" className="bg-red-600 hover:bg-red-700 px-4 py-1.5 rounded-full transition-all shadow-md">
                Register
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden px-6 pb-4 flex flex-col gap-4 bg-gray-900 border-t border-gray-800">
          <Link to="/" className="hover:text-red-400 transition-colors py-2" onClick={() => setIsOpen(false)}>Home</Link>
          {user && <Link to="/watchlist" className="hover:text-red-400 transition-colors py-2" onClick={() => setIsOpen(false)}>Watchlist</Link>}
          {user && <Link to="/friends" className="hover:text-blue-400 transition-colors py-2" onClick={() => setIsOpen(false)}>Friends</Link>}
          {user && <Link to="/profile" className="hover:text-purple-400 transition-colors py-2" onClick={() => setIsOpen(false)}>Profile</Link>}

          {user ? (
            <button
              onClick={() => { handleLogout(); setIsOpen(false); }}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-all shadow-md w-full text-center"
            >
              Logout
            </button>
          ) : (
            <div className="flex flex-col gap-3">
              <Link to="/login" className="hover:text-gray-300 transition-colors py-2 text-center" onClick={() => setIsOpen(false)}>Login</Link>
              <Link to="/register" className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-all shadow-md text-center" onClick={() => setIsOpen(false)}>
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
