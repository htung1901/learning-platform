import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { changeUsernameSchema } from "../../lib/validation";
import { User, Loader } from "lucide-react";

export default function ChangeUsernameForm({
  onSubmit,
  isLoading,
  currentUsername,
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(changeUsernameSchema),
    mode: "onBlur",
    defaultValues: {
      newUsername: "",
      password: "",
    },
  });

  const handleFormSubmit = async (data) => {
    await onSubmit(data);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Current Username Display */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
          Tên người dùng hiện tại
        </label>
        <div className="px-4 py-3 bg-slate-100 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 font-medium">
          {currentUsername || "Chưa thiết lập"}
        </div>
      </div>

      {/* New Username */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
          Tên người dùng mới *
        </label>
        <input
          type="text"
          placeholder="newusername"
          disabled={isLoading}
          {...register("newUsername")}
          className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:bg-slate-700 dark:text-white transition disabled:opacity-50 disabled:cursor-not-allowed bg-slate-50"
        />
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          Chỉ bao gồm chữ hoa/thường, số, dấu gạch dưới, dấu chấm, dấu gạch
          ngang (3-30 ký tự)
        </p>
        {errors.newUsername && (
          <p className="mt-2 text-sm text-red-600 font-medium">
            {errors.newUsername.message}
          </p>
        )}
      </div>

      {/* Password Confirmation */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
          Mật khẩu để xác nhận *
        </label>
        <input
          type="password"
          placeholder="••••••••"
          disabled={isLoading}
          {...register("password")}
          className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:bg-slate-700 dark:text-white transition disabled:opacity-50 disabled:cursor-not-allowed bg-slate-50"
        />
        {errors.password && (
          <p className="mt-2 text-sm text-red-600 font-medium">
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold py-3 rounded-lg hover:from-orange-700 hover:to-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader className="w-4 h-4 animate-spin" />
            Đang cập nhật...
          </>
        ) : (
          <>
            <User className="w-4 h-4" />
            Đổi tên người dùng
          </>
        )}
      </button>
    </form>
  );
}
