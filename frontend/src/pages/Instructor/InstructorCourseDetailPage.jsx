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
} from "lucide-react";
import { COURSE_LIST } from "../../data/courseCatalog";

export default function InstructorCourseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const manageCoursesPath = "/dashboard/courses/manage";
  const course = COURSE_LIST.find((c) => c.id === id) ?? COURSE_LIST[0];
  const courseIndex = COURSE_LIST.findIndex((c) => c.id === id);
  const status = courseIndex >= 0 && courseIndex < 3 ? "Published" : "Draft";

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
        <div className="relative h-80 bg-gradient-to-br from-cyan-500/20 via-emerald-500/10 to-violet-500/20">
          {course.thumbnail && (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="h-full w-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white">
                  <BookOpen className="h-3.5 w-3.5" />
                  {course.category}
                </div>
                <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                  {course.title}
                </h1>
                <p className="mt-2 text-slate-300">
                  {course.category} • {course.level}
                </p>
              </div>
              <div className="flex-shrink-0 text-right">
                <span
                  className={`inline-flex rounded-full px-4 py-2 text-sm font-bold uppercase tracking-[0.18em] ${
                    status === "Published"
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
                    {course.students.toLocaleString("vi-VN")}
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
                      {course.rating}
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
                    {course.price}
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
                  <span>Thời lượng: 8-12 tuần</span>
                </li>
                <li className="flex items-center gap-3">
                  <BookOpen className="h-4 w-4 text-emerald-300" />
                  <span>Số bài học: 24+ bài</span>
                </li>
                <li className="flex items-center gap-3">
                  <MessageSquare className="h-4 w-4 text-amber-300" />
                  <span>Hỗ trợ: Đầy đủ</span>
                </li>
              </ul>
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-lg font-bold text-white">
              Danh sách bài giảng
            </h2>
            <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-4 transition hover:bg-white/10"
                >
                  <div className="h-8 w-8 rounded-full bg-cyan-400/20 text-center leading-8 text-xs font-bold text-cyan-300">
                    {i}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white">
                      Tiêu đề bài {i}: Tựa đề bài học
                    </p>
                    <p className="text-xs text-slate-400">
                      12 phút • 3 phần • Video
                    </p>
                  </div>
                  <Eye className="h-4 w-4 text-slate-500" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="flex items-center justify-end gap-3">
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
            navigate(`/dashboard/courses/manage/${course.id}/edit-lessons`)
          }
          className="inline-flex items-center gap-2 rounded-2xl border border-amber-300/30 bg-amber-400/10 px-5 py-3 text-sm font-semibold text-amber-200 transition hover:bg-amber-400/20"
        >
          <Edit3 className="h-4 w-4" />
          Chỉnh sửa
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-2xl border border-red-300/30 bg-red-400/10 px-5 py-3 text-sm font-semibold text-red-200 transition hover:bg-red-400/20"
        >
          <Trash2 className="h-4 w-4" />
          Xóa
        </button>
      </div>
    </div>
  );
}
