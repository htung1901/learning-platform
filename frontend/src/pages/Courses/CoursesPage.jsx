import { useMemo, useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  Search,
  SlidersHorizontal,
  Clock3,
  Star,
  Users,
  ShoppingCart,
  CheckCircle2,
} from "lucide-react";
import courseService from "../../services/courseService";
import studentService from "../../services/studentService";
import { useAuthStore } from "../../store/authStore";
import { ROUTES } from "../../lib/constants";

const CATEGORY_OPTIONS = ["Tất cả", "Lập trình", "Thiết kế", "Marketing"];
const LEVEL_OPTIONS = ["All", "Beginner", "Intermediate", "Advanced"];

export default function CoursesPage() {
  const { user } = useAuthStore();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Tất cả");
  const [level, setLevel] = useState("All");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 6;
  const [pagination, setPagination] = useState(null);

  const totalPages =
    pagination?.pages ||
    Math.max(1, Math.ceil((courses?.length || 0) / coursesPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  // When using server-side pagination the API returns only the current page items.
  // Use `courses` directly as the page content. If no server pagination is available
  // we still handle client-side fallback by using the fetched array.
  const paginatedCourses = courses;

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      setLoading(true);
      try {
        const params = {
          page: currentPage,
          limit: coursesPerPage,
          q: query,
          category: category === "Tất cả" ? undefined : category,
          level: level === "All" ? undefined : level,
        };

        // Fetch published courses and (if logged in) owned courses in parallel
        const [publishedRes, ownedRes] = await Promise.all([
          courseService.getPublishedCourses(params),
          user && user.role !== "instructor"
            ? studentService.getMyCourses()
            : Promise.resolve(null),
        ]);

        if (!mounted) return;
        const published = publishedRes?.data || [];
        const ownedIds = new Set(
          (ownedRes?.data || []).map((item) => String(item.courseId)),
        );

        // attach isOwned flag and keep existing fields
        const annotated = published.map((c) => ({
          ...c,
          isOwned: ownedIds.has(String(c._id)),
        }));

        setCourses(annotated);
        setPagination(publishedRes?.pagination || null);
      } catch {
        // swallow for now
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetch();

    return () => {
      mounted = false;
    };
  }, [currentPage, query, category, level]);

  const formatDurationHuman = (seconds = 0) => {
    const total = Math.max(0, Number(seconds) || 0);
    if (!total) return "-";

    const days = Math.floor(total / 86400);
    const hours = Math.floor((total % 86400) / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const secs = total % 60;

    const parts = [];
    if (days > 0) parts.push(`${days} ngày`);
    if (hours > 0) parts.push(`${hours} giờ`);
    if (minutes > 0) parts.push(`${minutes} phút`);
    if (secs > 0) parts.push(`${secs} giây`);

    return parts.join(" ");
  };

  const visiblePageNumbers = useMemo(() => {
    const pageNumbers = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, safeCurrentPage - 2);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let page = startPage; page <= endPage; page += 1) {
      pageNumbers.push(page);
    }

    return pageNumbers;
  }, [safeCurrentPage, totalPages]);

  if (user?.role === "instructor")
    return <Navigate to={ROUTES.DASHBOARD} replace />;

  return (
    <div className="relative overflow-hidden py-12 sm:py-16">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-300/25 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-emerald-300/20 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <section className="rounded-3xl border border-white/60 bg-white/75 p-6 shadow-lg backdrop-blur-xl sm:p-8 dark:border-slate-700/60 dark:bg-slate-900/70">
          <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 inline-flex items-center rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300">
                Khóa học nổi bật
              </p>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
                Danh sách khóa học
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base dark:text-slate-300">
                Chọn khóa học phù hợp theo kỹ năng, cấp độ và mục tiêu nghề
                nghiệp của bạn.
              </p>
            </div>
            <p className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {pagination?.total || courses.length} khóa học phù hợp
            </p>
          </div>

          <div className="mb-8 grid grid-cols-1 gap-3 lg:grid-cols-3">
            <label className="group relative lg:col-span-2">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-600" />
              <input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Tìm theo tên khóa học hoặc chủ đề..."
                className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-cyan-400 dark:focus:ring-cyan-900/40"
              />
            </label>
            <div className="flex h-12 items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-sm font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
              <SlidersHorizontal className="h-4 w-4" />
              Lọc nhanh
            </div>
          </div>

          <div className="mb-8 flex flex-wrap gap-2">
            {CATEGORY_OPTIONS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setCategory(item);
                  setCurrentPage(1);
                }}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  category === item
                    ? "border-cyan-500 bg-cyan-500 text-white shadow"
                    : "border-slate-200 bg-white text-slate-600 hover:border-cyan-300 hover:text-cyan-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-cyan-500"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="mb-10 flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              Cấp độ:
            </span>
            {LEVEL_OPTIONS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setLevel(item);
                  setCurrentPage(1);
                }}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  level === item
                    ? "bg-emerald-500 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          {courses.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center dark:border-slate-700 dark:bg-slate-900">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Không tìm thấy khóa học phù hợp
              </h3>
              <p className="mt-2 text-slate-600 dark:text-slate-400">
                Thử đổi từ khóa hoặc bỏ bớt bộ lọc để xem thêm kết quả.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {loading ? (
                  <div className="col-span-3 text-center py-16">Loading...</div>
                ) : (
                  paginatedCourses.map((course) => (
                    <article
                      key={course._id}
                      className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-slate-700 dark:bg-slate-900"
                    >
                      <div className="relative h-44 overflow-hidden">
                        <img
                          src={course.thumbnailUrl || "/placeholder.png"}
                          alt={course.title}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                        <span className="absolute left-3 top-3 rounded-full bg-slate-900/80 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur dark:bg-slate-700/80">
                          {course.category}
                        </span>
                        <span
                          className={`absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold backdrop-blur text-white ${
                            course.isOwned
                              ? "bg-emerald-500/90"
                              : "bg-cyan-500/90"
                          }`}
                        >
                          {course.isOwned ? "Đã sở hữu" : "Chưa mua"}
                        </span>
                      </div>

                      <div className="p-5">
                        <h3 className="line-clamp-2 min-h-14 text-lg font-bold text-slate-900 dark:text-white">
                          {course.title}
                        </h3>

                        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                          <span className="inline-flex items-center gap-1">
                            <Clock3 className="h-3.5 w-3.5" />
                            {formatDurationHuman(course.totalDuration)}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            {(course.totalStudents || 0).toLocaleString(
                              "vi-VN",
                            )}{" "}
                            học viên
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            {course.rating || "-"}
                          </span>
                        </div>

                        <div className="mt-5 space-y-3">
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                              {course.price}
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <Link
                                to={ROUTES.CART}
                                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-200 bg-cyan-50 text-cyan-700 transition hover:border-cyan-300 hover:bg-cyan-100 dark:border-cyan-900/40 dark:bg-cyan-900/20 dark:text-cyan-300"
                                title="Thêm vào giỏ"
                              >
                                <ShoppingCart className="h-4 w-4" />
                              </Link>
                            </div>

                            <Link
                              to={`/courses/${course._id}`}
                              className="inline-flex items-center justify-center rounded-lg bg-linear-to-r from-cyan-500 to-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:shadow-lg"
                            >
                              Xem chi tiết
                            </Link>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))
                )}
              </div>

              <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-4 dark:border-slate-700 dark:bg-slate-900 sm:flex-row">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Đang xem trang{" "}
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {safeCurrentPage}
                  </span>{" "}
                  / {totalPages}
                </p>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={safeCurrentPage === 1}
                    onClick={() =>
                      setCurrentPage((page) => Math.max(1, page - 1))
                    }
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-cyan-300 hover:text-cyan-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
                  >
                    Trước
                  </button>

                  {visiblePageNumbers.map((pageNumber) => (
                    <button
                      key={pageNumber}
                      type="button"
                      onClick={() => setCurrentPage(pageNumber)}
                      className={`min-w-10 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                        pageNumber === safeCurrentPage
                          ? "bg-cyan-500 text-white shadow"
                          : "border border-slate-200 bg-white text-slate-700 hover:border-cyan-300 hover:text-cyan-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
                      }`}
                    >
                      {pageNumber}
                    </button>
                  ))}

                  <button
                    type="button"
                    disabled={safeCurrentPage === totalPages}
                    onClick={() =>
                      setCurrentPage((page) => Math.min(totalPages, page + 1))
                    }
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-cyan-300 hover:text-cyan-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
                  >
                    Sau
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
