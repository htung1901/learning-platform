import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import SignupForm from "../../components/Auth/SignupForm";
import { ROUTES } from "../../lib/constants";

export default function SignupPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, signup, user } = useAuthStore();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(
        user?.role === "student" ? ROUTES.STUDENT_DASHBOARD : ROUTES.DASHBOARD,
      );
    }
  }, [isAuthenticated, navigate, user?.role]);

  const handleSubmit = async (data) => {
    const success = await signup(data);
    if (success) {
      const nextRoute =
        data.role === "student" ? ROUTES.STUDENT_DASHBOARD : ROUTES.DASHBOARD;
      navigate(nextRoute);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950"></div>
      <div className="absolute top-0 -left-40 w-80 h-80 bg-purple-300 dark:bg-purple-900/20 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
      <div
        className="absolute bottom-0 -right-40 w-80 h-80 bg-pink-300 dark:bg-pink-900/20 rounded-full filter blur-3xl opacity-20 animate-pulse"
        style={{ animationDelay: "2s" }}
      ></div>

      <div className="w-full max-w-md relative z-10">
        {/* Card */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/50 dark:border-slate-700/50">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-white text-2xl font-bold">E</span>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Đăng ký
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Tạo tài khoản mới của bạn
            </p>
          </div>

          {/* Form */}
          <SignupForm onSubmit={handleSubmit} isLoading={isLoading} />

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-300 dark:border-slate-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-slate-800 text-slate-500">
                hoặc
              </span>
            </div>
          </div>

          {/* Login Link */}
          <p className="text-center text-slate-600 dark:text-slate-400">
            Đã có tài khoản?{" "}
            <Link
              to={ROUTES.LOGIN}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Đăng nhập
            </Link>
          </p>
        </div>

        {/* Footer Note */}
        <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-4">
          Bằng cách đăng ký, bạn đồng ý với Điều khoản Dịch vụ của chúng tôi
        </p>
      </div>
    </div>
  );
}
