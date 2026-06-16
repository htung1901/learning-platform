import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
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
  Download,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import studentService from "../../services/studentService";
import reviewService from "../../services/reviewService";
import { ROUTES } from "../../lib/constants";
import { useAuthStore } from "../../store/authStore";

const lessonBadgeClass = {
  theory: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
  video: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
  practice:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  quiz: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
};

const getAttachmentDownloadUrl = (url, fileName = "") => {
  if (!url || typeof url !== "string") return "";
  if (!url.includes("/upload/")) return url;

  const safeFileName = encodeURIComponent(fileName || "download");
  return url.replace("/upload/", `/upload/fl_attachment:${safeFileName}/`);
};

const formatFileSize = (bytes = 0) => {
  const size = Number(bytes) || 0;
  if (!size) return "";
  const units = ["B", "KB", "MB", "GB"];
  let value = size;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
};

const formatDuration = (durationInSeconds = 0) => {
  const total = Number(durationInSeconds) || 0;
  if (total < 60) return `${total}s`;
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m${seconds > 0 ? ` ${seconds}s` : ""}`;
  }

  return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
};

export default function CourseLearningPage() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const authUser = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [initialLessonId] = useState(lessonId);

  // course-level data fetched once per course
  const [courseData, setCourseData] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [enrollment, setEnrollment] = useState(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  // rating state
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadMyReviewState = async () => {
      if (!courseId || !authUser?._id) return;
      try {
        const res = await reviewService.getCourseReviews(courseId, 1, 50);
        if (!mounted) return;

        const reviews = res?.reviews || [];
        const myReview = reviews.find(
          (r) => String(r?.userId?._id || r?.userId) === String(authUser._id),
        );

        if (myReview) {
          setHasReviewed(true);
          setRating(Number(myReview.rating) || 0);
          setReviewComment(myReview.comment || "");
        }
      } catch {
        // Keep UI usable even if review list fails to load.
      }
    };

    loadMyReviewState();

    return () => {
      mounted = false;
    };
  }, [courseId, authUser?._id]);

  // Fetch course + lessons + enrollment once for the given courseId.
  // We use the lesson endpoint because it returns the course and lessons list.
  useEffect(() => {
    let mounted = true;
    const fetchCourse = async () => {
      setLoading(true);
      setError("");
      try {
        const resp = await studentService.getLesson(courseId, initialLessonId);
        if (!mounted) return;
        // resp is { message, data }
        const data = resp.data || resp; // defensive
        setCourseData(data.course || null);
        setLessons(data.lessons || []);
        setEnrollment(data.enrollment || null);
        setShowCompletionModal(
          data.enrollment?.status === "completed" ||
            Number(data.enrollment?.progressPercent || 0) >= 100,
        );
      } catch (err) {
        console.error(err);
        if (!mounted) return;
        setError(err?.response?.data?.message || "Không thể tải bài học.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchCourse();
    return () => {
      mounted = false;
    };
    // only re-run when courseId changes; lessonId handled below
  }, [courseId, initialLessonId]);

  const activeLesson = useMemo(() => {
    if (!lessons.length) return null;
    return (
      lessons.find(
        (lesson) =>
          String(lesson._id) === String(lessonId) ||
          String(lesson.id) === String(lessonId),
      ) || lessons[0]
    );
  }, [lessons, lessonId]);

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-600">Đang tải bài học...</div>
    );
  }

  if (error || !courseData) {
    return <Navigate to={ROUTES.COURSES} replace />;
  }

  const activeIndex = lessons.findIndex(
    (lesson) =>
      String(lesson._id || lesson.id) ===
      String(activeLesson?._id || activeLesson?.id),
  );
  const nextLesson = lessons[activeIndex + 1];
  const progress = enrollment?.progressPercent || 0;
  const completedLessonIds = enrollment?.completedLessonIds || [];
  const isLessonCompleted = completedLessonIds.some(
    (completedLessonId) =>
      String(completedLessonId) ===
      String(activeLesson?._id || activeLesson?.id),
  );

  const videoSrc = activeLesson?.videoUrl || courseData?.introVideoUrl;
  const isExternalVideo =
    typeof videoSrc === "string" && /^https?:\/\//i.test(videoSrc);
  const getEmbeddableVideoSrc = (url) => {
    if (!url || typeof url !== "string") return "";

    if (url.includes("youtube.com/embed/")) return url;

    try {
      const parsedUrl = new URL(url);
      const host = parsedUrl.hostname.replace(/^www\./, "");
      const videoIdFromPath = parsedUrl.pathname
        .split("/")
        .filter(Boolean)
        .pop();

      if (host === "youtu.be" && videoIdFromPath) {
        return `https://www.youtube.com/embed/${videoIdFromPath}`;
      }

      if (host.endsWith("youtube.com")) {
        const videoId = parsedUrl.searchParams.get("v") || videoIdFromPath;
        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}`;
        }
      }
    } catch {
      return url;
    }

    return url;
  };

  const embeddedVideoSrc = getEmbeddableVideoSrc(videoSrc);

  const handleSubmitReview = async () => {
    if (rating === 0) {
      toast.error("Vui lòng chọn số sao để đánh giá");
      return;
    }

    setIsSubmittingReview(true);
    try {
      await reviewService.createReview({
        courseId,
        rating,
        comment: reviewComment,
      });
      toast.success("Cảm ơn bạn đã đánh giá khóa học!");
      setHasReviewed(true);
    } catch (err) {
      const msg =
        err?.response?.data?.message || "Có lỗi xảy ra khi lưu đánh giá";
      toast.error(msg);
    } finally {
      setIsSubmittingReview(false);
    }
  };

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
              <span>{courseData?.category || ""}</span>
              <span>{courseData?.level || ""}</span>
            </div>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              {courseData?.title}
            </h1>
            <p className="mt-2 text-slate-600 dark:text-slate-300">
              {activeLesson?.summary || courseData?.description || ""}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 dark:bg-slate-800">
                <Clock3 className="h-4 w-4" />
                {formatDuration(activeLesson?.duration)}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 dark:bg-slate-800">
                <BookOpen className="h-4 w-4" />
                {lessons.length} bài học
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                <CheckCircle2 className="h-4 w-4" />
                {progress}% đã học
              </span>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 shadow-2xl dark:border-slate-800">
              {isExternalVideo ? (
                <div className="aspect-video w-full">
                  <iframe
                    title={activeLesson?.title}
                    src={embeddedVideoSrc}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="aspect-video w-full flex items-center justify-center bg-slate-100 dark:bg-slate-900">
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-20 w-20 flex items-center justify-center rounded-full bg-white/80 dark:bg-white/10">
                      <PlayCircle className="h-10 w-10 text-slate-900 dark:text-white" />
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      Video chưa được cung cấp hoặc không thể nhúng tại đây — sẽ
                      cập nhật sau
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <div className="space-y-4">
                <article className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
                    <PlayCircle className="h-4 w-4" />
                    Bài học hiện tại
                  </div>
                  <h2 className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
                    {activeLesson?.title}
                  </h2>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    {activeLesson?.summary ||
                      courseData?.description ||
                      "Đây là màn hình học mô phỏng: video, tài liệu, checklist và bài học tiếp theo đều được hiển thị để học viên theo dõi tiến độ."}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-cyan-500 to-emerald-500 px-4 py-2.5 text-sm font-bold text-white transition hover:shadow-lg"
                      onClick={async () => {
                        try {
                          const resp =
                            await studentService.updateLessonProgress(
                              courseId,
                              activeLesson._id,
                              { markCompleted: true },
                            );
                          setEnrollment(resp.data || resp);
                          toast.success("Đã hoàn thành bài học");
                          const updatedEnrollment = resp.data || resp;
                          const updatedProgress = Number(
                            updatedEnrollment?.progressPercent || 0,
                          );
                          const updatedStatus = updatedEnrollment?.status;

                          if (
                            updatedStatus === "completed" ||
                            updatedProgress >= 100 ||
                            !nextLesson
                          ) {
                            setShowCompletionModal(true);
                            return;
                          }

                          if (nextLesson) {
                            navigate(
                              `/lesson/${courseId}/${nextLesson._id || nextLesson.id}`,
                            );
                          }
                        } catch (e) {
                          console.error(e);
                          toast.error("Không thể cập nhật tiến độ bài học");
                        }
                      }}
                    >
                      <CirclePlay className="h-4 w-4" />
                      {isLessonCompleted
                        ? "Đã hoàn thành"
                        : "Hoàn thành bài học"}
                    </button>

                    {nextLesson ? (
                      <Link
                        to={`/lesson/${courseId}/${nextLesson._id || nextLesson.id}`}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-cyan-400 hover:text-cyan-700 dark:border-slate-700 dark:text-slate-300"
                      >
                        <SkipForward className="h-4 w-4" />
                        Bài tiếp theo
                      </Link>
                    ) : null}
                  </div>
                </article>
              </div>

              <article className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
                  <FileText className="h-4 w-4" />
                  Tài liệu đi kèm
                </div>
                <div className="mt-3 space-y-2">
                  {(activeLesson?.attachments || []).length > 0 ? (
                    activeLesson.attachments.map((attachment, index) => {
                      const downloadUrl = getAttachmentDownloadUrl(
                        attachment.url,
                        attachment.fileName,
                      );

                      return (
                        <a
                          key={`${attachment.url || attachment.fileName || index}`}
                          href={downloadUrl}
                          download={attachment.fileName || true}
                          className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700 transition hover:border-cyan-300 hover:bg-cyan-50 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:border-cyan-700/60 dark:hover:bg-cyan-900/20"
                          target="_blank"
                          rel="noreferrer"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-semibold text-slate-900 dark:text-white">
                              {attachment.fileName || `Tài liệu ${index + 1}`}
                            </p>
                            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                              {[
                                attachment.mimeType,
                                formatFileSize(attachment.size),
                              ]
                                .filter(Boolean)
                                .join(" • ")}
                            </p>
                          </div>
                          <span className="inline-flex shrink-0 items-center gap-1 self-start rounded-full bg-white px-3 py-1 text-xs font-semibold text-cyan-700 shadow-sm sm:self-auto dark:bg-slate-900 dark:text-cyan-300">
                            <Download className="h-3.5 w-3.5" />
                            Tải xuống
                          </span>
                        </a>
                      );
                    })
                  ) : (activeLesson?.resources || []).length > 0 ? (
                    activeLesson.resources.map((resource) => (
                      <div
                        key={resource}
                        className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300"
                      >
                        {resource}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Bài học này chưa có tài liệu đính kèm.
                    </p>
                  )}
                </div>
              </article>
            </div>

            <article className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
                <BookOpen className="h-4 w-4" />
                Mô tả bài học
              </div>
              <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-600 dark:text-slate-300">
                {courseData?.description || "Chưa có mô tả cho bài học này."}
              </p>
            </article>

            {/* Rating Section */}
            <article className="mt-5 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
              <div className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white mb-4">
                <Star className="h-5 w-5 text-amber-400" />
                Đánh giá khóa học
              </div>

              {hasReviewed ? (
                <div className="rounded-xl bg-emerald-50 p-4 border border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800/30">
                  <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300 text-center">
                    Cảm ơn bạn đã gửi đánh giá. Phản hồi của bạn giúp chúng tôi
                    cải thiện chất lượng khóa học!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-800/40">
                    <p className="text-center text-sm font-medium text-slate-600 dark:text-slate-300">
                      Chọn điểm đánh giá từ 1 đến 5
                    </p>

                    <div className="mt-3 flex items-center justify-center gap-2 sm:gap-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className={`group inline-flex h-11 w-11 items-center justify-center rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500/50 sm:h-12 sm:w-12 ${
                            (hoverRating || rating) >= star
                              ? "border-amber-400 bg-amber-50 shadow-sm dark:bg-amber-900/20"
                              : "border-slate-300 bg-white hover:border-amber-300 dark:border-slate-600 dark:bg-slate-900/60"
                          }`}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRating(star)}
                        >
                          <Star
                            className={`h-5 w-5 sm:h-6 sm:w-6 transition-colors ${
                              (hoverRating || rating) >= star
                                ? "fill-amber-400 text-amber-400"
                                : "text-slate-300 dark:text-slate-600"
                            }`}
                          />
                        </button>
                      ))}
                    </div>

                    <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                      {[1, 2, 3, 4, 5].map((score) => (
                        <button
                          key={`score-${score}`}
                          type="button"
                          onClick={() => setRating(score)}
                          className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                            rating === score
                              ? "bg-slate-900 text-white dark:bg-cyan-500"
                              : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-700"
                          }`}
                        >
                          {score} điểm
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="review-comment"
                      className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                    >
                      Nhận xét của bạn (Không bắt buộc)
                    </label>
                    <textarea
                      id="review-comment"
                      rows={3}
                      className="block w-full rounded-xl border-slate-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white sm:text-sm p-3"
                      placeholder="Chia sẻ cảm nhận của bạn về khóa học này..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      disabled={isSubmittingReview}
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleSubmitReview}
                      disabled={isSubmittingReview || rating === 0}
                      className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50 dark:bg-cyan-600 dark:hover:bg-cyan-500"
                    >
                      {isSubmittingReview ? "Đang gửi..." : "Gửi đánh giá"}
                    </button>
                  </div>
                </div>
              )}
            </article>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
              <GraduationCap className="h-4 w-4" />
              Danh sách bài học
            </div>
            <div className="mt-4 space-y-3">
              {lessons.map((lesson, index) => {
                const lessonIdVal = lesson._id || lesson.id;
                const isActive =
                  String(lessonIdVal) ===
                  String(activeLesson?._id || activeLesson?.id);
                return (
                  <Link
                    key={lessonIdVal}
                    to={`/lesson/${courseId}/${lessonIdVal}`}
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
                          <div className="flex items-center gap-2">
                            {completedLessonIds.some(
                              (completedLessonId) =>
                                String(completedLessonId) ===
                                String(lesson._id || lesson.id),
                            ) ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Hoàn thành
                              </span>
                            ) : null}
                            <span
                              className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${lessonBadgeClass[lesson.lessonType || lesson.type || "theory"]}`}
                            >
                              {lesson.lessonType === "practice"
                                ? "thực hành"
                                : lesson.lessonType === "theory"
                                  ? "lý thuyết"
                                  : lesson.type}
                            </span>
                          </div>
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          {formatDuration(lesson.duration)}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <Link
              to={ROUTES.STUDENT_DASHBOARD}
              className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-cyan-400 hover:text-cyan-700 dark:border-slate-700 dark:text-slate-300"
            >
              Quay lại khóa học của tôi
            </Link>
          </section>
        </aside>
      </div>

      {showCompletionModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-white/20 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900 sm:p-8">
            <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <h2 className="mt-5 text-center text-2xl font-black text-slate-900 dark:text-white">
              Bạn đã hoàn thành khóa học
            </h2>
            <p className="mt-3 text-center text-sm text-slate-600 dark:text-slate-300">
              Toàn bộ bài học đã được đánh dấu hoàn thành. Bạn có thể quay về
              khóa học của mình để xem tiến độ và tiếp tục khóa khác.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                to={ROUTES.STUDENT_DASHBOARD}
                className="inline-flex flex-1 items-center justify-center rounded-xl bg-linear-to-r from-cyan-500 to-emerald-500 px-4 py-3 text-sm font-bold text-white transition hover:shadow-lg"
              >
                Về khóa học của tôi
              </Link>
              <button
                type="button"
                onClick={() => setShowCompletionModal(false)}
                className="inline-flex flex-1 items-center justify-center rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-cyan-400 hover:text-cyan-700 dark:border-slate-700 dark:text-slate-300"
              >
                Ở lại trang học
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
