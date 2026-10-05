import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import ConnectionStatus from "./ConnectionStatus";
import NotificationPanel from "./NotificationPanel";

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl overflow-hidden shadow-lg shadow-orange-200">
            <img
              src="https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=200&q=85"
              alt="RecipeVerse AI"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="leading-tight">
            <h1 className="text-xl font-extrabold text-gray-900">
              RecipeVerse <span className="text-orange-500">AI</span>
            </h1>

            <p className="text-xs text-gray-500 font-medium">Your AI Cooking Companion</p>
          </div>
        </Link>

        {/* Navigation */}
        <div className="hidden md:flex items-center gap-7">
          <Link to="/" className="text-gray-700 hover:text-orange-500 font-medium transition">
            Home
          </Link>
          <a href="/#categories" className="text-gray-700 hover:text-orange-500 font-medium transition">
            Categories
          </a>
          <a href="/#recipes" className="text-gray-700 hover:text-orange-500 font-medium transition">
            Recipes
          </a>
          <a href="/#features" className="text-gray-700 hover:text-orange-500 font-medium transition">
            AI Features
          </a>
          {user && (
            <Link to="/profile" className="text-gray-700 hover:text-orange-500 font-medium transition">
              Profile
            </Link>
          )}
        </div>

        {/* Buttons */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              <div className="text-sm font-medium text-gray-700">
                Hi, {user.name || user.email.split("@")[0]}
              </div>
              {user.role === "admin" && (
                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded">
                  ADMIN
                </span>
              )}
              <button
                onClick={handleLogout}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 text-gray-700 font-medium hover:text-orange-500 transition"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="px-5 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition shadow-sm"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <ConnectionStatus />
          <NotificationPanel />
          <button
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
            className="md:hidden text-2xl text-gray-700"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            ☰
          </button>
        </div>
      </div>
      
      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 space-y-4">
          <Link to="/" className="block text-gray-700 font-medium">Home</Link>
          {user && <Link to="/profile" className="block text-gray-700 font-medium">Profile</Link>}
          <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
            {user ? (
              <>
                <div className="text-gray-700 font-medium">Hi, {user.name || user.email}</div>
                <button onClick={handleLogout} className="w-full py-2 border border-gray-300 rounded-lg font-medium">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="w-full py-2 text-center border border-gray-300 rounded-lg font-medium">
                  Login
                </Link>
                <Link to="/register" className="w-full py-2 text-center bg-orange-500 text-white rounded-lg font-medium">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;