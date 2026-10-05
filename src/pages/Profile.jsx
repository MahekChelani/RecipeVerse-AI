import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function Profile() {
  const { user, token } = useContext(AuthContext);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/users/profile`);
        setProfileData(response.data);
      } catch (err) {
        setError("Failed to load profile. Please try logging in again.");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchProfile();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-gray-500 font-medium">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-orange-500 px-6 py-8">
          <h1 className="text-3xl font-bold text-white">Your Profile</h1>
          <p className="text-orange-100 mt-2">JWT Authentication Successful</p>
        </div>
        
        <div className="p-8">
          {error ? (
            <div className="p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>
          ) : profileData ? (
            <div className="space-y-6">
              <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
                <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-2xl font-bold uppercase">
                  {profileData.name ? profileData.name.charAt(0) : "U"}
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">{profileData.name}</h2>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mt-1">
                    Role: {profileData.role || "user"}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Email Address</h3>
                  <p className="mt-1 text-lg text-gray-900">{profileData.email}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Account ID</h3>
                  <p className="mt-1 text-lg text-gray-900 font-mono text-sm">{profileData._id}</p>
                </div>
              </div>

              {profileData.role === "admin" && (
                <div className="mt-8 p-6 bg-purple-50 rounded-xl border border-purple-100">
                  <h3 className="text-lg font-bold text-purple-900">Admin Section</h3>
                  <p className="text-purple-700 mt-2 text-sm">
                    You are seeing this because your account has the "admin" role.
                  </p>
                  <button className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition">
                    Go to Admin Dashboard
                  </button>
                </div>
              )}
            </div>
          ) : (
            <p>No profile data available.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
