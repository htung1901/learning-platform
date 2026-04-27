import { useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import { useUserStore } from "../../store/userStore";
import ProfileForm from "../../components/Auth/ProfileForm";
import ProtectedRoute from "../../components/ProtectedRoute";
import { Mail, User } from "lucide-react";

export default function ProfilePage() {
  const { isAuthenticated, user } = useAuthStore();
  const { profile, isLoading, fetchProfile, updateProfile } = useUserStore();

  // Fetch profile on mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated, fetchProfile]);

  const handleSubmit = async (data) => {
    const success = await updateProfile(data);
    if (success) {
      // Profile updated successfully
    }
  };

  if (!isAuthenticated) {
    return <ProtectedRoute />;
  }

  const displayUser = profile || user;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header Card */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 dark:border-slate-700/50 p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <span className="text-white text-4xl font-bold">
                {displayUser?.displayName?.[0]?.toUpperCase() || "U"}
              </span>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                {displayUser?.displayName}
              </h1>
              <p className="text-slate-600 dark:text-slate-300 flex items-center gap-2 text-lg">
                <Mail className="w-5 h-5" />
                {displayUser?.email}
              </p>
              {displayUser?.bio && (
                <p className="text-slate-600 dark:text-slate-400 mt-3 italic">
                  "{displayUser.bio}"
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Edit Profile Form */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 dark:border-slate-700/50 p-8 mb-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              Chỉnh sửa hồ sơ
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Cập nhật thông tin cá nhân của bạn
            </p>
          </div>

          <ProfileForm
            onSubmit={handleSubmit}
            isLoading={isLoading}
            defaultValues={
              displayUser
                ? {
                    displayName: displayUser.displayName,
                    phone: displayUser.phone || "",
                    bio: displayUser.bio || "",
                  }
                : undefined
            }
          />
        </div>

        {/* Account Information */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 dark:border-slate-700/50 p-8">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
            Thông tin tài khoản
          </h3>

          <div className="space-y-4">
            <div className="flex justify-between items-center py-4 px-4 bg-slate-50 dark:bg-slate-700/30 rounded-lg border border-slate-200 dark:border-slate-700">
              <span className="text-slate-600 dark:text-slate-400 font-medium">
                Username:
              </span>
              <span className="text-slate-900 dark:text-white font-semibold">
                {displayUser?.username}
              </span>
            </div>

            <div className="flex justify-between items-center py-4 px-4 bg-slate-50 dark:bg-slate-700/30 rounded-lg border border-slate-200 dark:border-slate-700">
              <span className="text-slate-600 dark:text-slate-400 font-medium">
                Email:
              </span>
              <span className="text-slate-900 dark:text-white font-semibold">
                {displayUser?.email}
              </span>
            </div>

            <div className="flex justify-between items-center py-4 px-4 bg-slate-50 dark:bg-slate-700/30 rounded-lg border border-slate-200 dark:border-slate-700">
              <span className="text-slate-600 dark:text-slate-400 font-medium">
                Điện thoại:
              </span>
              <span className="text-slate-900 dark:text-white font-semibold">
                {displayUser?.phone || "Chưa thiết lập"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
