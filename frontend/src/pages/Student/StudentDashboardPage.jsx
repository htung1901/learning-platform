import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import {
  Flame,
  Clock3,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { ROUTES } from "../../lib/constants";
import studentService from "../../services/studentService";

const FALLBACK_THUMBNAIL =
  "https://images.unsplash.com/photo-1518773553398-650c184e0bb3?auto=format&fit=crop&w=1200&q=80";

const formatDuration = (seconds) => {
  if (!seconds || typeof seconds !== "number") return "0 phut";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours <= 0) return `${minutes} phut`;
  return `${hours} gio ${minutes} phut`;
};

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("vi-VN");
};

export default function StudentDashboardPage() {
  const { user } = useAuthStore();
  const role = user?.role || "student";
  const [activeTab, setActiveTab] = useState("all");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const cardsScrollRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    const fetchMyCourses = async () => {
      setLoading(true);
      setErrorMessage("");
      try {
        const response = await studentService.getMyCourses();
        if (!mounted) return;
        setCourses(response?.data || []);
      } catch (error) {
        if (!mounted) return;
        setCourses([]);
        const apiMessage = error?.response?.data?.message;
        if (apiMessage) {
          setErrorMessage(apiMessage);
        } else {
          setErrorMessage(
            "Khong the ket noi den server de tai khoa hoc da mua. Hay kiem tra backend/CORS va thu lai.",
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchMyCourses();

    return () => {
      mounted = false;
    };
  }, []);

  const inProgressCourses = useMemo(
    () =>
      courses.filter((course) => course.progress > 0 && course.progress < 100),
    [courses],
  );

  const completedCourses = useMemo(
    () => courses.filter((course) => course.progress >= 100),
    [courses],
  );

  const coursesByTab = useMemo(
    () => ({
      all: courses,
      learning: inProgressCourses,
      completed: completedCourses,
    }),
    [courses, inProgressCourses, completedCourses],
  );

  const tabItems = [
    {
      key: "all",
      label: "All",
      count: courses.length,
      countClass:
        "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    },
    {
      key: "learning",
      label: "In Progress",
      count: inProgressCourses.length,
      countClass:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    },
    {
      key: "completed",
      label: "Completed",
      count: completedCourses.length,
      countClass:
        "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    },
  ];

  const activeCourses = coursesByTab[activeTab] || [];

  const scrollCardsRail = (direction) => {
    const container = cardsScrollRef.current;
    if (!container) return;
    container.scrollBy({
      left: direction * 380,
      behavior: "smooth",
    });
  };

  if (role !== "student") {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  const weeklyGoal = 5;
  const completedThisWeek = completedCourses.length;
  const weeklyProgress = Math.min(
    100,
    Math.round((completedThisWeek / weeklyGoal) * 100),
  );

  return (
    <div className="relative overflow-hidden py-10 sm:py-14">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-cyan-300/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-violet-300/20 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <section className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-lg backdrop-blur-xl sm:p-8 dark:border-slate-700/60 dark:bg-slate-900/70">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
                <Flame className="h-3.5 w-3.5" />
                Student Dashboard
              </p>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
                Xin chao, {user?.displayName || user?.username || "Student"}
              </h1>
              <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">
                Day la khu vuc hoc tap danh cho Student. Theo doi tien do va
                tiep tuc cac bai hoc dang lam do ngay ben duoi.
              </p>
            </div>

            <div className="w-full max-w-sm rounded-2xl border border-cyan-200 bg-cyan-50 p-4 dark:border-cyan-900/50 dark:bg-cyan-900/20">
              <div className="mb-3 flex items-center justify-between text-sm font-semibold text-cyan-800 dark:text-cyan-300">
                <span>Muc tieu tuan nay</span>
                <span>
                  {completedThisWeek}/{weeklyGoal}
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-cyan-100 dark:bg-cyan-950/40">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                  style={{ width: `${weeklyProgress}%` }}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              id: "enrolled",
              label: "Tat ca khoa hoc da mua",
              value: courses.length,
              accent: "from-cyan-500 to-blue-500",
            },
            {
              id: "in-progress",
              label: "Khoa hoc dang hoc",
              value: inProgressCourses.length,
              accent: "from-emerald-500 to-teal-500",
            },
            {
              id: "completed",
              label: "Khoa hoc da hoan thanh",
              value: completedCourses.length,
              accent: "from-amber-500 to-orange-500",
            },
          ].map((item) => (
            <article
              key={item.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900"
            >
              <div
                className={`mb-4 inline-flex rounded-lg bg-gradient-to-r px-2.5 py-1 text-xs font-bold text-white ${item.accent}`}
              >
                {item.id.toUpperCase()}
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {item.label}
              </p>
              <p className="mt-1 text-3xl font-extrabold text-slate-900 dark:text-white">
                {item.value}
              </p>
            </article>
          ))}
        </section>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Khoa hoc cua toi
            </h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollCardsRail(-1)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-cyan-300 hover:text-cyan-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                aria-label="Scroll left"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollCardsRail(1)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-cyan-300 hover:text-cyan-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                aria-label="Scroll right"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <Link
                to={ROUTES.AVAILABLE_COURSES}
                className="inline-flex items-center gap-1 text-sm font-semibold text-cyan-600 hover:text-cyan-700 dark:text-cyan-400"
              >
                Xem them khoa hoc
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
            {tabItems.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`inline-flex min-w-[190px] shrink-0 items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                  activeTab === tab.key
                    ? "border-cyan-500 bg-cyan-500 text-white shadow"
                    : "border-slate-200 bg-slate-50 text-slate-700 hover:border-cyan-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                }`}
              >
                <span>{`${tab.label} (${tab.count})`}</span>
              </button>
            ))}
          </div>

          <div className="mt-6">
            {loading ? (
              <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                Dang tai danh sach khoa hoc...
              </div>
            ) : null}

            {!loading && errorMessage ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-900/20 dark:text-rose-300">
                {errorMessage}
              </div>
            ) : null}

            {!loading && !errorMessage && activeCourses.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                Ban chua co khoa hoc nao trong nhom nay.
              </div>
            ) : activeCourses.length > 0 ? (
              <div
                ref={cardsScrollRef}
                className="overflow-x-auto pb-3 scroll-smooth"
              >
                <div className="flex min-w-max gap-4">
                  {activeCourses.map((course) => (
                    <article
                      key={course.enrollmentId}
                      className="flex w-[360px] shrink-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900"
                    >
                      <div
                        className="h-44 border-b border-slate-200 bg-cover bg-center dark:border-slate-700"
                        style={{
                          backgroundImage: `url(${course.thumbnailUrl || FALLBACK_THUMBNAIL})`,
                        }}
                      />

                      <div className="flex flex-1 flex-col p-4">
                        <div className="mb-3 flex items-start justify-between gap-4">
                          <h3 className="line-clamp-2 min-h-[3.5rem] text-2xl font-semibold leading-tight text-slate-900 dark:text-white">
                            {course.title}
                          </h3>
                          {course.progress === 100 && (
                            <span className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                              Completed
                            </span>
                          )}
                        </div>

                        <div className="mb-2 flex items-center justify-between">
                          <p className="text-sm text-slate-600 dark:text-slate-300">
                            {course.progress}% Complete
                          </p>
                          <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                            <Clock3 className="h-3.5 w-3.5" />
                            {formatDuration(course.totalDuration)}
                          </span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>

                        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                          {course.completedLessons} of {course.totalLessons}{" "}
                          lessons completed
                        </p>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                          Enrolled on {formatDate(course.enrolledAt)}
                        </p>

                        <Link
                          to={
                            course.firstLessonId
                              ? `/lesson/${course.courseId}/${course.firstLessonId}`
                              : `/courses/${course.courseId}`
                          }
                          className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-cyan-600 dark:hover:bg-cyan-500"
                        >
                          {course.progress < 100
                            ? "Continue Learning"
                            : "Review Course"}
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}
