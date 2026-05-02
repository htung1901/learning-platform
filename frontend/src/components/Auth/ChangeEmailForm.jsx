import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { changeEmailSchema } from "../../lib/validation";
import { Mail, Loader } from "lucide-react";

export default function ChangeEmailForm({ onSubmit, isLoading, currentEmail }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(changeEmailSchema),
    mode: "onBlur",
    defaultValues: {
      newEmail: "",
      password: "",
    },
  });

  const handleFormSubmit = async (data) => {
    await onSubmit(data);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Current Email Display */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
          Email hiện tại
        </label>
        <div className="px-4 py-3 bg-slate-100 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 font-medium">
          {currentEmail || "Chưa thiết lập"}
        </div>
      </div>

      {/* New Email */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
          Email mới *
        </label>
        <input
          type="email"
          placeholder="newemail@example.com"
          disabled={isLoading}
          {...register("newEmail")}
          className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:bg-slate-700 dark:text-white transition disabled:opacity-50 disabled:cursor-not-allowed bg-slate-50"
        />
        {errors.newEmail && (
          <p className="mt-2 text-sm text-red-600 font-medium">
            {errors.newEmail.message}
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
        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader className="w-4 h-4 animate-spin" />
            Đang cập nhật...
          </>
        ) : (
          <>
            <Mail className="w-4 h-4" />
            Đổi email
          </>
        )}
      </button>
    </form>
  );
}
