import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema } from "../../lib/validation";
import { Eye, EyeOff, Loader } from "lucide-react";

export default function SignupForm({ onSubmit, isLoading }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
    mode: "onBlur",
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Username */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
          Tên người dùng *
        </label>
        <input
          type="text"
          placeholder="username"
          disabled={isLoading}
          {...register("username")}
          className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 dark:bg-slate-700 dark:text-white transition disabled:opacity-50 disabled:cursor-not-allowed bg-slate-50"
        />
        {errors.username && (
          <p className="mt-2 text-sm text-red-600 font-medium">
            {errors.username.message}
          </p>
        )}
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
          Email *
        </label>
        <input
          type="email"
          placeholder="your@email.com"
          disabled={isLoading}
          {...register("email")}
          className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 dark:bg-slate-700 dark:text-white transition disabled:opacity-50 disabled:cursor-not-allowed bg-slate-50"
        />
        {errors.email && (
          <p className="mt-2 text-sm text-red-600 font-medium">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Display Name */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
          Tên hiển thị *
        </label>
        <input
          type="text"
          placeholder="Tên của bạn"
          disabled={isLoading}
          {...register("displayName")}
          className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 dark:bg-slate-700 dark:text-white transition disabled:opacity-50 disabled:cursor-not-allowed bg-slate-50"
        />
        {errors.displayName && (
          <p className="mt-2 text-sm text-red-600 font-medium">
            {errors.displayName.message}
          </p>
        )}
      </div>

      {/* Password */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
          Mật khẩu *
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="••••••"
            disabled={isLoading}
            {...register("password")}
            className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 dark:bg-slate-700 dark:text-white transition disabled:opacity-50 disabled:cursor-not-allowed bg-slate-50"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition"
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="mt-2 text-sm text-red-600 font-medium">
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Confirm Password */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
          Xác nhận mật khẩu *
        </label>
        <div className="relative">
          <input
            type={showConfirm ? "text" : "password"}
            placeholder="••••••"
            disabled={isLoading}
            {...register("confirmPassword")}
            className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 dark:bg-slate-700 dark:text-white transition disabled:opacity-50 disabled:cursor-not-allowed bg-slate-50"
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition"
          >
            {showConfirm ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="mt-2 text-sm text-red-600 font-medium">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full mt-6 bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
      >
        {isLoading && <Loader className="w-4 h-4 animate-spin" />}
        {isLoading ? "Đang xử lý..." : "Đăng ký"}
      </button>
    </form>
  );
}
