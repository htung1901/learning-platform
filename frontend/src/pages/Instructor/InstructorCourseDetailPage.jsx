import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  DollarSign,
  Eye,
  MessageSquare,
  Star,
  Users,
  BarChart3,
  Edit3,
  Trash2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "../../store/authStore";
import { instructorService } from "../../services/instructorService";
import courseService from "../../services/courseService";

const formatPrice = (value) => {
  const numeric = Number(value) || 0;
  return `${numeric.toLocaleString("vi-VN")} đ`;
};

const formatDuration = (durationInSeconds = 0) => {
  const total = Number(durationInSeconds) || 0;
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m${seconds > 0 ? ` ${seconds}s` : ""}`;
  }

  if (minutes > 0) {
    return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
  }

  return `${seconds}s`;
};

const normalizeStatus = (status) => {
  if (status === "published") return "Đã xuất bản";
  if (status === "pending") return "Chờ duyệt";
  if (status === "rejected") return "Bị từ chối";
  if (status === "archived") return "Đã lưu trữ";
  return "Bản nháp";
};

export default function InstructorCourseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const manageCoursesPath = "/dashboard/courses/manage";
  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [prereqCourses, setPrereqCourses] = useState([]);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const data = await instructorService.getMyCourseDetail(id);
        setCourse(data);
      } catch (error) {
        if (isAuthenticated) {
          toast.error(
            error?.response?.data?.message || "Không thể tải chi tiết khóa học",
          );
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourse();
  }, [id, isAuthenticated]);

  // Fetch prerequisite course details (if any) so we can display titles
  useEffect(() => {
    let cancelled = false;
    const fetchPrereqs = async () => {
      if (!course?.prerequisites || course.prerequisites.length === 0) {
        setPrereqCourses([]);
        return;
      }

      try {
        const results = await Promise.all(
          course.prerequisites.map(async (pid) => {
            try {
              const resp = await courseService.getCourseById(pid);
              return resp?.data || resp?.course || resp;
              // eslint-disable-next-line no-unused-vars
            } catch (err) {
              return null;
            }
          }),
        );

        if (cancelled) return;
        setPrereqCourses(results.filter(Boolean));
        // eslint-disable-next-line no-unused-vars
      } catch (err) {
        if (!cancelled) setPrereqCourses([]);
      }
    };

    fetchPrereqs();
    return () => {
      cancelled = true;
    };
  }, [course?.prerequisites]);

  const lessons = useMemo(() => course?.lessons || [], [course]);
  const status = normalizeStatus(course?.status);

  const handleDeleteCourse = async () => {
    if (!course?._id || isDeleting) return;

    const confirmed = window.confirm(
      "Bạn có chắc muốn xóa khóa học này không? Hành động này không thể hoàn tác.",
    );
    if (!confirmed) return;

    try {
      setIsDeleting(true);
      await instructorService.deleteCourse(course._id);
      toast.success("Đã xóa khóa học");
      navigate(manageCoursesPath);
    } catch (error) {
      if (isAuthenticated) {
        toast.error(error?.response?.data?.message || "Không thể xóa khóa học");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center rounded-3xl border border-white/10 bg-white/6 p-10 text-slate-300">
        <Loader2 className="mr-3 h-5 w-5 animate-spin" />
        Đang tải chi tiết khóa học...
      </div>
    );
  }

  if (!course) {
    return (
      <div className="space-y-4 rounded-3xl border border-white/10 bg-white/6 p-8 text-slate-200 shadow-2xl backdrop-blur-xl">
        <h1 className="text-2xl font-black text-white">
          Không tìm thấy khóa học
        </h1>
        <p className="text-slate-300">
          Khóa học có thể đã bị xóa hoặc bạn không có quyền xem.
        </p>
        <button
          type="button"
          onClick={() => navigate(manageCoursesPath)}
          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại danh sách
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/10 bg-white/6 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          Danh sách khóa học của giảng viên
        </p>
        <h1 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">
          Xem chi tiết khóa học
        </h1>
        <p className="mt-2 text-slate-300">
          Xem nhanh tiêu đề, trạng thái và danh sách bài giảng của khóa học.
        </p>
      </section>

      <button
        type="button"
        onClick={() => navigate(manageCoursesPath)}
        className="inline-flex items-center gap-2 text-slate-400 transition hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại danh sách khóa học của giảng viên
      </button>

      <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/6 shadow-2xl backdrop-blur-xl">
        <div className="relative h-80 bg-linear-to-br from-cyan-500/20 via-emerald-500/10 to-violet-500/20">
          {course.thumbnailUrl && (
            <img
              src={course.thumbnailUrl}
              alt={course.title}
              className="h-full w-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white">
                  <BookOpen className="h-3.5 w-3.5" />
                  {(course.tags && course.tags[0]) ||
                    course.category ||
                    "Tổng quát"}
                </div>
                <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                  {course.title}
                </h1>
                <p className="mt-2 text-slate-300">
                  {(course.tags && course.tags[0]) || "Tổng quát"} •{" "}
                  {course.level}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <span
                  className={`inline-flex rounded-full px-4 py-2 text-sm font-bold uppercase tracking-[0.18em] ${
                    status === "Đã xuất bản"
                      ? "bg-emerald-400/10 text-emerald-300"
                      : "bg-amber-400/10 text-amber-300"
                  }`}
                >
                  {status}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8 p-8">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Học viên</p>
                  <p className="mt-2 text-3xl font-bold text-white">
                    {(course.totalStudents || 0).toLocaleString("vi-VN")}
                  </p>
                </div>
                <Users className="h-8 w-8 text-cyan-300/60" />
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Rating</p>
                  <div className="mt-2 flex items-center gap-2">
                    <p className="text-3xl font-bold text-white">
                      {(course.ratingAvg || 0).toFixed(1)}
                    </p>
                    <Star className="h-6 w-6 fill-amber-300 text-amber-300" />
                  </div>
                </div>
                <BarChart3 className="h-8 w-8 text-amber-300/60" />
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Giá bán</p>
                  <p className="mt-2 text-3xl font-bold text-white">
                    {formatPrice(course.price)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-emerald-300/60" />
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <h2 className="mb-4 text-lg font-bold text-white">
                Mô tả khóa học
              </h2>
              <p className="text-slate-300">
                {course.description ||
                  "Khóa học này cung cấp kiến thức toàn diện về chủ đề được chọn. Học viên sẽ học được các kỹ năng thực tiễn, có thể áp dụng ngay vào công việc."}
              </p>
            </div>

            <div>
              <h2 className="mb-4 text-lg font-bold text-white">
                Thông tin chi tiết
              </h2>
              <ul className="space-y-3 text-sm text-slate-300">
                <li className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-cyan-300" />
                  <span>
                    Thời lượng: {formatDuration(course.totalDuration)}
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <BookOpen className="h-4 w-4 text-emerald-300" />
                  <span>
                    Số bài học: {course.totalLessons || lessons.length || 0} bài
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <Star className="h-4 w-4 text-amber-300" />
                  <span>Điểm ưu tiên: {course?.valueScore ?? "-"}</span>
                </li>
                <li className="flex items-center gap-3">
                  <MessageSquare className="h-4 w-4 text-amber-300" />
                  <span>Trạng thái: {status}</span>
                </li>
              </ul>
            </div>
          </div>

          {prereqCourses.length > 0 && (
            <div>
              <h2 className="mb-4 text-lg font-bold text-white">
                Điều kiện tiên quyết
              </h2>
              <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-6">
                {prereqCourses.map((pc) => (
                  <div
                    key={pc._id || pc.id}
                    className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {pc.title}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-300">
                        {(pc.tags && pc.tags[0]) || pc.category || "Tổng quát"}{" "}
                        • {pc.level}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/dashboard/courses/manage/${pc._id || pc.id}`)
                      }
                      className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
                    >
                      Xem
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="mb-4 text-lg font-bold text-white">
              Danh sách bài giảng
            </h2>
            <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-6">
              {lessons.length === 0 ? (
                <div className="rounded-xl border border-dashed border-white/10 bg-white/5 px-4 py-6 text-center text-sm text-slate-300">
                  Khóa học này chưa có bài học nào.
                </div>
              ) : (
                lessons.map((lesson, index) => (
                  <div
                    key={lesson._id || lesson.id || index}
                    className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/5 p-4 transition hover:bg-white/10"
                  >
                    <div className="h-8 w-8 rounded-full bg-cyan-400/20 text-center leading-8 text-xs font-bold text-cyan-300">
                      {lesson.order || index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white">
                        {lesson.title || `Bài học ${index + 1}`}
                      </p>
                      <p className="text-xs text-slate-400">
                        {formatDuration(lesson.duration)} •{" "}
                        {lesson.videoUrl ? "Video" : "Nội dung"}
                      </p>
                      {lesson.summary && (
                        <p className="mt-1 text-xs text-slate-300">
                          {lesson.summary}
                        </p>
                      )}
                    </div>
                    <Eye className="h-4 w-4 text-slate-500" />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="flex items-center justify-end gap-3">
        {course &&
          (course.status === "draft" || course.status === "rejected") && (
            <button
              type="button"
              onClick={async () => {
                if (isSubmitting) return;
                try {
                  setIsSubmitting(true);
                  const updated = await instructorService.submitCourseForReview(
                    course._id,
                  );
                  setCourse(updated);
                  toast.success("Đã gửi khóa học lên chờ duyệt");
                } catch (error) {
                  if (isAuthenticated) {
                    toast.error(
                      error?.response?.data?.message || "Lỗi khi gửi duyệt",
                    );
                  }
                } finally {
                  setIsSubmitting(false);
                }
              }}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-2xl border border-amber-300/30 bg-amber-500/10 px-5 py-3 text-sm font-semibold text-amber-200 transition hover:bg-amber-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Đang gửi..." : "Gửi duyệt"}
            </button>
          )}
        <button
          type="button"
          onClick={() => navigate(manageCoursesPath)}
          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại danh sách
        </button>
        <button
          type="button"
          onClick={() =>
            navigate(`/dashboard/courses/manage/${course._id}/edit-lessons`)
          }
          className="inline-flex items-center gap-2 rounded-2xl border border-amber-300/30 bg-amber-400/10 px-5 py-3 text-sm font-semibold text-amber-200 transition hover:bg-amber-400/20"
        >
          <Edit3 className="h-4 w-4" />
          Chỉnh sửa
        </button>
        <button
          type="button"
          onClick={handleDeleteCourse}
          disabled={isDeleting}
          className="inline-flex items-center gap-2 rounded-2xl border border-red-300/30 bg-red-400/10 px-5 py-3 text-sm font-semibold text-red-200 transition hover:bg-red-400/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Trash2 className="h-4 w-4" />
          {isDeleting ? "Đang xóa..." : "Xóa"}
        </button>
      </div>
    </div>
  );
}
