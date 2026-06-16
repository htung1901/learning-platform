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
import courseService from "../../services/courseService";
import cartService from "../../services/cartService";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../lib/constants";
import { useEffect, useState } from "react";
import { useAuthStore } from "../../store/authStore";
import studentService from "../../services/studentService";

const getCourseOwnerId = (course) =>
  course?.instructorId?._id || course?.instructorId?.id || course?.instructorId;

const LEVEL_DIFFICULTY_SCORE = {
  beginner: 4,
  intermediate: 7,
  advanced: 10,
};

const getExerciseScore = (lessons = []) => {
  const practiceCount = lessons.filter(
    (lesson) => lesson?.lessonType === "practice",
  ).length;

  if (practiceCount < 3) return { exerciseScore: 3, practiceCount };
  if (practiceCount <= 6) return { exerciseScore: 6, practiceCount };
  return { exerciseScore: 10, practiceCount };
};

export default function CourseDetailPage() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOwned, setIsOwned] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isCreator = Boolean(
    user?._id && String(getCourseOwnerId(course) || "") === String(user._id),
  );

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      setLoading(true);
      try {
        const data = await courseService.getCourseById(id);
        if (!mounted) return;
        setCourse(data.data);
      } catch {
        if (!mounted) return;
        setCourse(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetch();

    return () => {
      mounted = false;
    };
  }, [id]);

  useEffect(() => {
    let mounted = true;

    const checkOwnership = async () => {
      if (!user || user.role === "instructor") return;

      try {
        const response = await studentService.getMyCourses();
        if (!mounted) return;

        const owned = (response.data || []).some(
          (item) => String(item.courseId) === String(id),
        );
        setIsOwned(owned);
      } catch {
        if (mounted) setIsOwned(false);
      }
    };

    checkOwnership();

    return () => {
      mounted = false;
    };
  }, [id, user]);

  useEffect(() => {
    if (!course) return;

    const ratingAvg = Number(course.ratingAvg || 0);
    const difficultyScore =
      LEVEL_DIFFICULTY_SCORE[course.level] ?? LEVEL_DIFFICULTY_SCORE.beginner;
    const { exerciseScore, practiceCount } = getExerciseScore(course.lessons);

    console.log("[course-detail][score-debug]", {
      courseId: course._id,
      slug: course.slug,
      title: course.title,
      ratingAvg,
      difficultyScore,
      exerciseScore,
      practiceCount,
      level: course.level,
    });
  }, [course]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (!course) return <Navigate to={ROUTES.COURSES} replace />;

  const formatDuration = (seconds) => {
    if (!seconds || typeof seconds !== "number") return "-";
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  };

  // eslint-disable-next-line no-unused-vars
  const outcomes = course?.outcomes || course?.prerequisites || [];
  const firstLessonId = course?.lessons?.[0]?._id;

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
              <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl dark:text-white">
                {course.title}
              </h1>
              <p className="mt-4 max-w-2xl text-slate-600 dark:text-slate-300">
                {course.description}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-300">
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 className="h-4 w-4" />
                  {formatDuration(course.totalDuration)}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  {(course.totalStudents || 0).toLocaleString("vi-VN")} học viên
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  {(course.ratingAvg || 0).toFixed(1)} đánh giá
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <div className="overflow-hidden rounded-xl">
                <img
                  src={course.thumbnailUrl}
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
                  {isCreator
                    ? "Bạn là giảng viên của khóa học này. Đây là trang chỉ xem thông tin, không thể mua lại khóa học của chính mình."
                    : isOwned
                      ? "Bạn đã sở hữu khóa học này. Vào học tiếp ngay hoặc xem tiến độ trong dashboard."
                      : "Bạn chưa sở hữu khóa học này. Mua ngay để mở toàn bộ nội dung."}
                </p>

                {isCreator ? (
                  <div className="mt-4 grid gap-3">
                    <div className="rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-700 dark:border-cyan-900/40 dark:bg-cyan-900/20 dark:text-cyan-300">
                      Khóa học của bạn chỉ hiển thị ở chế độ thông tin.
                    </div>
                    <Link
                      to={ROUTES.COURSES}
                      className="inline-flex w-full items-center justify-center rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-cyan-400 hover:text-cyan-700 dark:border-slate-700 dark:text-slate-300"
                    >
                      Quay lại danh sách khóa học
                    </Link>
                  </div>
                ) : isOwned ? (
                  <div className="mt-4 grid gap-3">
                    <Link
                      to={
                        firstLessonId
                          ? `/lesson/${course._id}/${firstLessonId}`
                          : ROUTES.STUDENT_DASHBOARD
                      }
                      className="inline-flex w-full items-center justify-center rounded-xl bg-linear-to-r from-cyan-500 to-emerald-500 px-4 py-3 text-sm font-bold text-white transition hover:shadow-lg"
                    >
                      Vào học ngay
                    </Link>
                    <Link
                      to={ROUTES.STUDENT_DASHBOARD}
                      className="inline-flex w-full items-center justify-center rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-cyan-400 hover:text-cyan-700 dark:border-slate-700 dark:text-slate-300"
                    >
                      Về dashboard của tôi
                    </Link>
                  </div>
                ) : (
                  <div className="mt-4 grid grid-cols-[auto_1fr] gap-3">
                    <button
                      onClick={async () => {
                        try {
                          await cartService.addToCart(course._id);
                          navigate(ROUTES.CART);
                        } catch (err) {
                          console.error("Add to cart failed", err);
                          navigate(ROUTES.CART);
                        }
                      }}
                      className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-200 bg-cyan-50 text-cyan-700 transition hover:border-cyan-300 hover:bg-cyan-100 dark:border-cyan-900/40 dark:bg-cyan-900/20 dark:text-cyan-300"
                      title="Thêm vào giỏ"
                    >
                      <ShoppingCart className="h-5 w-5" />
                    </button>

                    <Link
                      to={`/checkout/${course._id}`}
                      className="inline-flex w-full items-center justify-center rounded-xl bg-linear-to-r from-cyan-500 to-emerald-500 px-4 py-3 text-sm font-bold text-white transition hover:shadow-lg"
                    >
                      Mua khóa học ngay
                    </Link>
                  </div>
                )}

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
            {(course.lessons || []).map((lesson, index) => (
              <article
                key={lesson._id || index}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 dark:border-slate-700 dark:bg-slate-800/50"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Bài học {index + 1}
                    </p>
                    <h3 className="mt-1 font-semibold text-slate-900 dark:text-white">
                      {lesson.title}
                    </h3>
                  </div>

                  {lesson.videoUrl ? (
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
