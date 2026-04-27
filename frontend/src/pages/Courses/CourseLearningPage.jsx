import { useMemo } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import {
  BookOpen,
  CheckCircle2,
  CirclePlay,
  Clock3,
  FileText,
  GraduationCap,
  Lock,
  MessageSquareText,
  PlayCircle,
  SkipForward,
} from "lucide-react";
import { getLearningPayload } from "../../data/learningMock";
import { ROUTES } from "../../lib/constants";

const lessonBadgeClass = {
  video: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
  practice:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  quiz: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
};

export default function CourseLearningPage() {
  const { courseId, lessonId } = useParams();
  const payload = getLearningPayload(courseId);

  const activeLessonIndex = useMemo(() => {
    if (!payload) return 0;
    const index = payload.lessons.findIndex((lesson) => lesson.id === lessonId);
    return index >= 0 ? index : 0;
  }, [payload, lessonId]);

  if (!payload) {
    return <Navigate to={ROUTES.COURSES} replace />;
  }

  const activeLesson = payload.lessons[activeLessonIndex] || payload.lessons[0];
  const nextLesson = payload.lessons[activeLessonIndex + 1];
  const progress = payload.course.progress || 0;

  return (
    <div className="relative overflow-hidden py-10 sm:py-14">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-28 right-6 h-80 w-80 rounded-full bg-cyan-300/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-violet-300/20 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-[1.25fr_0.75fr] lg:px-8">
        <section className="overflow-hidden rounded-3xl border border-white/60 bg-white/80 shadow-xl backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-900/70">
          <div className="border-b border-slate-200/70 p-6 dark:border-slate-700/70 sm:p-8">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              <span>{payload.course.category}</span>
              <span>•</span>
              <span>{payload.module}</span>
            </div>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              {payload.headline}
            </h1>
            <p className="mt-2 text-slate-600 dark:text-slate-300">
              {payload.currentTopic}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 dark:bg-slate-800">
                <Clock3 className="h-4 w-4" />
                {activeLesson?.duration}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 dark:bg-slate-800">
                <BookOpen className="h-4 w-4" />
                {payload.lessons.length} bài học
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                <CheckCircle2 className="h-4 w-4" />
                {progress}% đã học
              </span>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 shadow-2xl dark:border-slate-800">
              <div className="aspect-video w-full">
                <iframe
                  title={activeLesson?.title}
                  src={payload.videoUrl}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <article className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
                  <PlayCircle className="h-4 w-4" />
                  Bài học đang mở
                </div>
                <h2 className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
                  {activeLesson?.title}
                </h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  Đây là màn hình học mô phỏng: video, tài liệu, checklist và
                  bài học tiếp theo đều được hiển thị để học viên theo dõi tiến
                  độ.
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-4 py-2.5 text-sm font-bold text-white transition hover:shadow-lg"
                  >
                    <CirclePlay className="h-4 w-4" />
                    Tiếp tục học
                  </button>
                  {nextLesson ? (
                    <Link
                      to={`/lesson/${courseId}/${nextLesson.id}`}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-cyan-400 hover:text-cyan-700 dark:border-slate-700 dark:text-slate-300"
                    >
                      <SkipForward className="h-4 w-4" />
                      Bài tiếp theo
                    </Link>
                  ) : null}
                </div>
              </article>

              <article className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
                  <FileText className="h-4 w-4" />
                  Tài liệu đi kèm
                </div>
                <div className="mt-3 space-y-2">
                  {payload.resources.map((resource) => (
                    <div
                      key={resource}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300"
                    >
                      {resource}
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-xl bg-cyan-50 p-4 dark:bg-cyan-900/20">
                  <div className="flex items-center gap-2 text-sm font-semibold text-cyan-700 dark:text-cyan-300">
                    <MessageSquareText className="h-4 w-4" />
                    Ghi chú nhanh
                  </div>
                  <p className="mt-2 text-sm text-cyan-800/90 dark:text-cyan-100/90">
                    Người học có thể lưu lại note, câu hỏi hoặc đánh dấu phần
                    cần xem lại sau.
                  </p>
                </div>
              </article>
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
              <GraduationCap className="h-4 w-4" />
              Lộ trình bài học
            </div>
            <div className="mt-4 space-y-3">
              {payload.lessons.map((lesson, index) => {
                const isActive = lesson.id === activeLesson?.id;
                return (
                  <Link
                    key={lesson.id}
                    to={`/lesson/${courseId}/${lesson.id}`}
                    className={`block rounded-2xl border px-4 py-3 transition ${
                      isActive
                        ? "border-cyan-500 bg-cyan-50 dark:border-cyan-400 dark:bg-cyan-900/20"
                        : "border-slate-200 bg-slate-50 hover:border-cyan-300 dark:border-slate-700 dark:bg-slate-800/50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm dark:bg-slate-900 dark:text-slate-200">
                        {lesson.isLocked ? (
                          <Lock className="h-4 w-4" />
                        ) : (
                          <BookOpen className="h-4 w-4" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">
                            {index + 1}. {lesson.title}
                          </p>
                          <span
                            className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${lessonBadgeClass[lesson.type]}`}
                          >
                            {lesson.type}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          {lesson.duration}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
              <Lock className="h-4 w-4" />
              Bảo vệ nội dung
            </div>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
              Bài học demo này mô phỏng logic của khu vực học sau khi đã thanh
              toán, với playlist và tài nguyên chỉ mở cho học viên.
            </p>
            <Link
              to={ROUTES.STUDENT_DASHBOARD}
              className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-cyan-400 hover:text-cyan-700 dark:border-slate-700 dark:text-slate-300"
            >
              Quay lại khóa học của tôi
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
}
