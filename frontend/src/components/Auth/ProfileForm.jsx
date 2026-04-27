import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema } from "../../lib/validation";
import { Loader } from "lucide-react";

export default function ProfileForm({ onSubmit, isLoading, defaultValues }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    mode: "onBlur",
    defaultValues: defaultValues || {
      displayName: "",
      phone: "",
      bio: "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
          className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:bg-slate-700 dark:text-white transition disabled:opacity-50 disabled:cursor-not-allowed bg-slate-50"
        />
        {errors.displayName && (
          <p className="mt-2 text-sm text-red-600 font-medium">
            {errors.displayName.message}
          </p>
        )}
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
          Số điện thoại
        </label>
        <input
          type="tel"
          placeholder="0123456789"
          disabled={isLoading}
          {...register("phone")}
          className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:bg-slate-700 dark:text-white transition disabled:opacity-50 disabled:cursor-not-allowed bg-slate-50"
        />
        {errors.phone && (
          <p className="mt-2 text-sm text-red-600 font-medium">
            {errors.phone.message}
          </p>
        )}
      </div>

      {/* Bio */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
          Tiểu sử{" "}
          <span className="text-xs text-slate-500">(Tối đa 500 ký tự)</span>
        </label>
        <textarea
          placeholder="Nói gì đó về bạn..."
          disabled={isLoading}
          rows="4"
          {...register("bio")}
          className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:bg-slate-700 dark:text-white transition disabled:opacity-50 disabled:cursor-not-allowed resize-none bg-slate-50"
        />
        {errors.bio && (
          <p className="mt-2 text-sm text-red-600 font-medium">
            {errors.bio.message}
          </p>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
      >
        {isLoading && <Loader className="w-4 h-4 animate-spin" />}
        {isLoading ? "Đang cập nhật..." : "Cập nhật hồ sơ"}
      </button>
    </form>
  );
}
