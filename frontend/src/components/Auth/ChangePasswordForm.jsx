import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { changePasswordSchema } from "../../lib/validation";
import { Lock, Loader } from "lucide-react";

export default function ChangePasswordForm({ onSubmit, isLoading }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
    mode: "onBlur",
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const handleFormSubmit = async (data) => {
    await onSubmit(data);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Old Password */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
          Mật khẩu hiện tại *
        </label>
        <input
          type="password"
          placeholder="••••••••"
          disabled={isLoading}
          {...register("oldPassword")}
          className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:bg-slate-700 dark:text-white transition disabled:opacity-50 disabled:cursor-not-allowed bg-slate-50"
        />
        {errors.oldPassword && (
          <p className="mt-2 text-sm text-red-600 font-medium">
            {errors.oldPassword.message}
          </p>
        )}
      </div>

      {/* New Password */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
          Mật khẩu mới *
        </label>
        <input
          type="password"
          placeholder="••••••••"
          disabled={isLoading}
          {...register("newPassword")}
          className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:bg-slate-700 dark:text-white transition disabled:opacity-50 disabled:cursor-not-allowed bg-slate-50"
        />
        {errors.newPassword && (
          <p className="mt-2 text-sm text-red-600 font-medium">
            {errors.newPassword.message}
          </p>
        )}
      </div>

      {/* Confirm Password */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
          Xác nhận mật khẩu *
        </label>
        <input
          type="password"
          placeholder="••••••••"
          disabled={isLoading}
          {...register("confirmPassword")}
          className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:bg-slate-700 dark:text-white transition disabled:opacity-50 disabled:cursor-not-allowed bg-slate-50"
        />
        {errors.confirmPassword && (
          <p className="mt-2 text-sm text-red-600 font-medium">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader className="w-4 h-4 animate-spin" />
            Đang cập nhật...
          </>
        ) : (
          <>
            <Lock className="w-4 h-4" />
            Đổi mật khẩu
          </>
        )}
      </button>
    </form>
  );
}
