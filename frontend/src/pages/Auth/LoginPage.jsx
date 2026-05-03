import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import LoginForm from "../../components/Auth/LoginForm";
import { ROUTES } from "../../lib/constants";
import { toast } from "sonner";

export default function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, login, user } = useAuthStore();
  const [sessionNotice] = useState(() => {
    const notice = sessionStorage.getItem("auth_notice");
    if (notice === "session_expired") {
      return "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
    }
    return "";
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(
        user?.role === "student" ? ROUTES.STUDENT_DASHBOARD : ROUTES.DASHBOARD,
      );
    }
  }, [isAuthenticated, navigate, user?.role]);

  useEffect(() => {
    if (sessionNotice) {
      toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      sessionStorage.removeItem("auth_notice");
    }
  }, [sessionNotice]);

  const handleSubmit = async (data) => {
    const success = await login(data.username, data.password, data.role);
    if (success) {
      const nextRoute =
        data.role === "student" ? ROUTES.STUDENT_DASHBOARD : ROUTES.DASHBOARD;
      navigate(nextRoute);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950"></div>
      <div className="absolute top-0 -left-40 w-80 h-80 bg-blue-300 dark:bg-blue-900/20 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
      <div
        className="absolute bottom-0 -right-40 w-80 h-80 bg-purple-300 dark:bg-purple-900/20 rounded-full filter blur-3xl opacity-20 animate-pulse"
        style={{ animationDelay: "2s" }}
      ></div>

      <div className="w-full max-w-md relative z-10">
        {/* Card */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/50 dark:border-slate-700/50">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-white text-2xl font-bold">E</span>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Đăng nhập
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Chào mừng bạn trở lại
            </p>
          </div>

          {sessionNotice && (
            <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-700/60 dark:bg-amber-900/20 dark:text-amber-300">
              {sessionNotice}
            </div>
          )}

          {/* Form */}
          <LoginForm onSubmit={handleSubmit} isLoading={isLoading} />

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

          {/* Signup Link */}
          <p className="text-center text-slate-600 dark:text-slate-400">
            Chưa có tài khoản?{" "}
            <Link
              to={ROUTES.SIGNUP}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Đăng ký ngay
            </Link>
          </p>
        </div>

        {/* Footer Note */}
        <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-4">
          Demo Student: student.demo | 123456 | role: Student
          <br />
          Demo Instructor: instructor.demo | 123456 | role: Instructor
        </p>
      </div>
    </div>
  );
}
