import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Clock3, Layers3, Users } from "lucide-react";
import api from "../../lib/api";
import { API_ENDPOINTS, ROUTES } from "../../lib/constants";

const formatNumber = (value) => Number(value || 0).toLocaleString("vi-VN");

export default function InstructorDashboardPage() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    courseStats: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get(
          API_ENDPOINTS.INSTRUCTOR_DASHBOARD_STATS,
        );
        setStats({
          totalStudents: response.data?.totalStudents || 0,
          totalCourses: response.data?.totalCourses || 0,
          courseStats: response.data?.courseStats || [],
        });
      } catch (error) {
        console.error("Lỗi khi lấy thống kê dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/6 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
              Tổng quan khóa học của giảng viên
            </h1>
            <p className="mt-3 max-w-2xl text-slate-300">
              Theo dõi hiệu suất khóa học, xem lượng học viên quan tâm và đi
              thẳng tới luồng tạo hoặc quản lý nội dung.
            </p>
          </div>

          <Link
            to={ROUTES.INSTRUCTOR_CREATE_COURSE}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-amber-400 to-orange-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:shadow-xl"
          >
            Tạo khóa học mới
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {[
          {
            label: "Tổng khóa học",
            value: loading ? "..." : formatNumber(stats.totalCourses),
            icon: Layers3,
            accent: "from-amber-400 to-orange-500",
          },
          {
            label: "Học viên quan tâm",
            value: loading ? "..." : formatNumber(stats.totalStudents),
            icon: Users,
            accent: "from-cyan-400 to-blue-500",
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <article
              key={item.label}
              className="rounded-3xl border border-white/10 bg-white/6 p-5 shadow-lg backdrop-blur-xl"
            >
              <div
                className={`mb-4 inline-flex rounded-2xl bg-linear-to-r px-3 py-2 text-slate-950 ${item.accent}`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-sm text-slate-400">{item.label}</p>
              <p className="mt-1 text-3xl font-black text-white">
                {item.value}
              </p>
            </article>
          );
        })}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-3xl border border-white/10 bg-white/6 p-6 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">
                Hiệu suất khóa học
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Thống kê theo từng khóa học của bạn.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-300">
              <Clock3 className="h-4 w-4 text-amber-300" />
              Cập nhật mới nhất
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {!loading && stats.courseStats.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-slate-300">
                Bạn chưa có khóa học nào.
              </div>
            ) : (
              stats.courseStats.map((course) => (
                <div
                  key={course.courseId}
                  className="rounded-2xl border border-white/10 bg-slate-950/40 p-4"
                >
                  <p className="truncate text-base font-semibold text-white">
                    {course.title}
                  </p>
                  <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <div className="rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-3 py-2">
                      <p className="text-xs text-cyan-200">Đã mua</p>
                      <p className="text-lg font-bold text-cyan-100">
                        {loading ? "..." : formatNumber(course.buyers)}
                      </p>
                    </div>
                    <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-3 py-2">
                      <p className="text-xs text-amber-200">Đang học</p>
                      <p className="text-lg font-bold text-amber-100">
                        {loading ? "..." : formatNumber(course.learning)}
                      </p>
                    </div>
                    <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-2">
                      <p className="text-xs text-emerald-200">Hoàn thành</p>
                      <p className="text-lg font-bold text-emerald-100">
                        {loading ? "..." : formatNumber(course.completed)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </article>

        <div className="space-y-6">
          <article className="rounded-3xl border border-white/10 bg-linear-to-br from-slate-900/90 to-slate-800/90 p-6 shadow-2xl backdrop-blur-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-300">
              Today focus
            </p>
            <h3 className="mt-3 text-2xl font-black text-white">
              Tối ưu trang quản lý trước khi xuất bản
            </h3>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Dùng sidebar để chuyển nhanh giữa tổng quan, tạo khóa học và quản
              lý nội dung. Giao diện này được thiết kế riêng cho giảng viên.
            </p>
          </article>
        </div>
      </section>
    </div>
  );
}
