import { Link, Navigate, useParams } from "react-router-dom";
import {
  CheckCircle2,
  Clock3,
  Lock,
  Star,
  Users,
  PlayCircle,
  ShoppingCart,
} from "lucide-react";
import { findCourseById } from "../../data/courseCatalog";
import { ROUTES } from "../../lib/constants";

export default function CourseDetailPage() {
  const { id } = useParams();
  const course = findCourseById(id);

  if (!course) {
    return <Navigate to={ROUTES.COURSES} replace />;
  }

  return (
    <div className="relative overflow-hidden py-10 sm:py-14">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 right-8 h-72 w-72 rounded-full bg-sky-300/20 blur-3xl" />
        <div className="absolute bottom-0 -left-10 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-3xl border border-white/60 bg-white/80 shadow-xl backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-900/70">
          <div className="grid gap-6 p-6 lg:grid-cols-[1.1fr_0.9fr] lg:p-8">
            <div>
              <p className="mb-3 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                {course.category} • {course.level}
              </p>
              <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl dark:text-white">
                {course.title}
              </h1>
              <p className="mt-4 max-w-2xl text-slate-600 dark:text-slate-300">
                {course.intro}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-300">
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 className="h-4 w-4" />
                  {course.duration}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  {course.students.toLocaleString("vi-VN")} học viên
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  {course.rating} đánh giá
                </span>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {course.outcomes.map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <div className="overflow-hidden rounded-xl">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="h-56 w-full object-cover"
                />
              </div>

              <div className="mt-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Giá ưu đãi hôm nay
                </p>
                <p className="mt-1 text-3xl font-black text-slate-900 dark:text-white">
                  {course.price}
                </p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Bạn chưa sở hữu khóa học này. Mua ngay để mở toàn bộ nội dung.
                </p>

                <div className="mt-4 grid grid-cols-[auto_1fr] gap-3">
                  <Link
                    to={ROUTES.CART}
                    className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-200 bg-cyan-50 text-cyan-700 transition hover:border-cyan-300 hover:bg-cyan-100 dark:border-cyan-900/40 dark:bg-cyan-900/20 dark:text-cyan-300"
                    title="Thêm vào giỏ"
                  >
                    <ShoppingCart className="h-5 w-5" />
                  </Link>

                  <Link
                    to={`/checkout/${course.id}`}
                    className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-4 py-3 text-sm font-bold text-white transition hover:shadow-lg"
                  >
                    Mua khóa học ngay
                  </Link>
                </div>

                <Link
                  to={ROUTES.COURSES}
                  className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-cyan-400 hover:text-cyan-700 dark:border-slate-700 dark:text-slate-300"
                >
                  Quay lại danh sách khóa học
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Nội dung khóa học
            </h2>
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
              Chế độ xem trước
            </span>
          </div>

          <div className="space-y-3">
            {course.syllabus.map((section, index) => (
              <article
                key={section.title}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 dark:border-slate-700 dark:bg-slate-800/50"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Bài học {index + 1}
                    </p>
                    <h3 className="mt-1 font-semibold text-slate-900 dark:text-white">
                      {section.title}
                    </h3>
                  </div>

                  {section.preview ? (
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-2 text-sm font-semibold text-cyan-700 dark:border-cyan-800/70 dark:bg-cyan-900/20 dark:text-cyan-300"
                    >
                      <PlayCircle className="h-4 w-4" />
                      Học thử
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                      <Lock className="h-4 w-4" />
                      Mua để mở khóa
                    </span>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
