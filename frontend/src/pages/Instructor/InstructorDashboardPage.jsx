import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Clock3,
  Layers3,
  Star,
  Users,
} from "lucide-react";
import { COURSE_LIST } from "../../data/courseCatalog";
import { ROUTES } from "../../lib/constants";

const formatNumber = (value) => value.toLocaleString("vi-VN");

export default function InstructorDashboardPage() {
  const totalCourses = COURSE_LIST.length;
  const totalStudents = COURSE_LIST.reduce(
    (sum, course) => sum + course.students,
    0,
  );
  const averageRating = (
    COURSE_LIST.reduce((sum, course) => sum + course.rating, 0) / totalCourses
  ).toFixed(1);
  const topCourse = [...COURSE_LIST].sort(
    (left, right) => right.students - left.students,
  )[0];

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

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Tổng khóa học",
            value: totalCourses,
            icon: Layers3,
            accent: "from-amber-400 to-orange-500",
          },
          {
            label: "Học viên quan tâm",
            value: formatNumber(totalStudents),
            icon: Users,
            accent: "from-cyan-400 to-blue-500",
          },
          {
            label: "Rating trung bình",
            value: averageRating,
            icon: Star,
            accent: "from-violet-400 to-fuchsia-500",
          },
          {
            label: "Khóa học nổi bật",
            value: topCourse?.title?.split(" ")[0] || "-",
            icon: BookOpen,
            accent: "from-emerald-400 to-teal-500",
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
                Mỗi thanh thể hiện mức độ nổi bật theo lượng học viên quan tâm.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-300">
              <Clock3 className="h-4 w-4 text-amber-300" />
              Cập nhật mới nhất
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {COURSE_LIST.map((course) => {
              const progress = Math.min(
                100,
                Math.max(
                  12,
                  Math.round((course.students / totalStudents) * 100),
                ),
              );
              return (
                <div
                  key={course.id}
                  className="rounded-2xl border border-white/10 bg-slate-950/40 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="truncate text-base font-semibold text-white">
                        {course.title}
                      </p>
                      <p className="mt-1 text-sm text-slate-400">
                        {course.category} • {course.level}
                      </p>
                    </div>
                    <div className="text-right text-sm text-slate-400">
                      <p>{formatNumber(course.students)} học viên</p>
                      <p className="text-amber-300">★ {course.rating}</p>
                    </div>
                  </div>

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-linear-to-r from-amber-400 via-orange-500 to-cyan-400"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              );
            })}
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
              lý nội dung. Giao diện này được thiết kế riêng cho giảng viên,
              không dùng Home hay Courses như khu vực student.
            </p>
          </article>

          <article className="rounded-3xl border border-white/10 bg-white/6 p-6 shadow-2xl backdrop-blur-xl">
            <h3 className="text-lg font-bold text-white">Khóa học nổi bật</h3>
            <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/40">
              <img
                src={topCourse?.thumbnail}
                alt={topCourse?.title}
                className="h-44 w-full object-cover"
              />
              <div className="p-4">
                <p className="text-sm text-slate-400">Bài học dẫn đầu</p>
                <p className="mt-1 text-lg font-bold text-white">
                  {topCourse?.title}
                </p>
                <p className="mt-2 text-sm text-slate-300">
                  {topCourse?.duration} •{" "}
                  {formatNumber(topCourse?.students || 0)}
                  học viên • ★ {topCourse?.rating}
                </p>
              </div>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
