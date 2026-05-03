import { useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import { useUserStore } from "../../store/userStore";
import ProfileForm from "../../components/Auth/ProfileForm";
import ChangePasswordForm from "../../components/Auth/ChangePasswordForm";
import ChangeEmailForm from "../../components/Auth/ChangeEmailForm";
import ChangeUsernameForm from "../../components/Auth/ChangeUsernameForm";
import ProtectedRoute from "../../components/ProtectedRoute";
import { Mail, User, BookOpen } from "lucide-react";
import { userService } from "../../services/userService";
import { toast } from "sonner";

export default function ProfilePage() {
  const { isAuthenticated, user, setUser } = useAuthStore();
  const {
    profile,
    isLoading,
    fetchProfile,
    updateProfile,
    changePassword,
    changeEmail,
    changeUsername,
  } = useUserStore();

  // Fetch profile on mount (only once when authenticated)
  useEffect(() => {
    if (isAuthenticated && !profile) {
      console.log("🔄 Fetching profile...");
      fetchProfile().catch((err) => console.error("Profile fetch error:", err));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const handleSubmit = async (data) => {
    const success = await updateProfile(data);
    if (success) {
      // Profile updated successfully
    }
  };

  const handleChangePassword = async (data) => {
    await changePassword({
      oldPassword: data.oldPassword,
      newPassword: data.newPassword,
    });
  };

  const handleChangeEmail = async (data) => {
    await changeEmail({
      newEmail: data.newEmail,
      password: data.password,
    });
  };

  const handleChangeUsername = async (data) => {
    await changeUsername({
      newUsername: data.newUsername,
      password: data.password,
    });
  };

  const handleToggleInstructor = async () => {
    try {
      const updatedUser = await userService.toggleInstructor();
      setUser(updatedUser);
      localStorage.setItem("authUser", JSON.stringify(updatedUser));
      const status = updatedUser.role === "instructor" ? "bật" : "tắt";
      toast.success(`Chế độ giảng viên: ${status}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi hệ thống");
    }
  };

  if (!isAuthenticated) {
    return <ProtectedRoute />;
  }

  const displayUser = profile || user;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Loading State */}
        {isLoading && !displayUser && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-slate-600 dark:text-slate-400">
              Đang tải hồ sơ...
            </p>
          </div>
        )}

        {/* Header Card */}
        {displayUser && (
          <>
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

                <div className="flex justify-between items-center py-4 px-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-700/50">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <span className="text-slate-600 dark:text-slate-400 font-medium">
                      Chế độ giảng viên:
                    </span>
                  </div>
                  <button
                    onClick={handleToggleInstructor}
                    disabled={isLoading}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                      displayUser?.role === "instructor"
                        ? "bg-purple-600 text-white hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600"
                        : "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                    } disabled:opacity-50`}
                  >
                    {displayUser?.role === "instructor"
                      ? "Chuyển về học viên"
                      : "Trở thành giảng viên"}
                  </button>
                </div>
              </div>
            </div>

            {/* Change Password Form */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 dark:border-slate-700/50 p-8 mb-8 mt-8">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                    🔐
                  </div>
                  Đổi mật khẩu
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                  Cập nhật mật khẩu để bảo vệ tài khoản
                </p>
              </div>
              <ChangePasswordForm
                onSubmit={handleChangePassword}
                isLoading={isLoading}
              />
            </div>

            {/* Change Email Form */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 dark:border-slate-700/50 p-8 mb-8">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                    ✉️
                  </div>
                  Đổi email
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                  Cập nhật địa chỉ email của bạn
                </p>
              </div>
              <ChangeEmailForm
                onSubmit={handleChangeEmail}
                isLoading={isLoading}
                currentEmail={displayUser?.email}
              />
            </div>

            {/* Change Username Form */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 dark:border-slate-700/50 p-8">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                    👤
                  </div>
                  Đổi tên người dùng
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                  Thay đổi tên người dùng công khai
                </p>
              </div>
              <ChangeUsernameForm
                onSubmit={handleChangeUsername}
                isLoading={isLoading}
                currentUsername={displayUser?.username}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
