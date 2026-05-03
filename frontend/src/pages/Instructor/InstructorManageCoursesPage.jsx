import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Edit3,
  Eye,
  FolderKanban,
  Gauge,
  Search,
  Star,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { instructorService } from "../../services/instructorService";

export default function InstructorManageCoursesPage() {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        const data = await instructorService.getMyCourses();
        setCourses(data);
      } catch (error) {
        toast.error(
          error?.response?.data?.message || "Không thể tải danh sách khóa học",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const filteredCourses = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();
    if (!keyword) return courses;

    return courses.filter((course) => {
      const title = course.title?.toLowerCase() || "";
      const level = course.level?.toLowerCase() || "";
      const tags = (course.tags || []).join(" ").toLowerCase();
      return (
        title.includes(keyword) ||
        level.includes(keyword) ||
        tags.includes(keyword)
      );
    });
  }, [courses, searchText]);

  const formatPrice = (value) => {
    const numeric = Number(value) || 0;
    return `${numeric.toLocaleString("vi-VN")} đ`;
  };

  const normalizeStatus = (status) => {
    if (status === "published") return "Published";
    if (status === "pending") return "Pending";
    if (status === "rejected") return "Rejected";
    return "Draft";
  };

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/6 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-200">
              <FolderKanban className="h-3.5 w-3.5" />
              Quản lý khóa học
            </p>
            <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
              Danh sách khóa học của giảng viên
            </h1>
            <p className="mt-3 max-w-2xl text-slate-300">
              Tập trung vào chỉnh sửa, kiểm tra trạng thái và mở các hành động
              nhanh cho từng khóa học.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
            <Gauge className="h-4 w-4 text-amber-300" />
            {filteredCourses.length} khóa học đang theo dõi
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_auto]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />
            <input
              type="text"
              placeholder="Tìm khóa học, danh mục hoặc giảng viên..."
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-slate-950/40 py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-400 focus:border-amber-300/60 focus:ring-4 focus:ring-amber-300/10"
            />
          </label>

          <button
            type="button"
            onClick={() => navigate("/dashboard/courses/create")}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:shadow-xl"
          >
            Tạo khóa học mới
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/6 shadow-2xl backdrop-blur-xl">
        <div className="grid grid-cols-[2fr_0.7fr_0.7fr_0.7fr_0.8fr_0.9fr] gap-0 border-b border-white/10 px-5 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          <div>Khóa học</div>
          <div>Học viên</div>
          <div>Rating</div>
          <div>Giá</div>
          <div>Trạng thái</div>
          <div className="text-right">Hành động</div>
        </div>

        <div className="divide-y divide-white/10">
          {isLoading && (
            <div className="px-5 py-10 text-center text-slate-300">
              Đang tải danh sách khóa học...
            </div>
          )}

          {!isLoading && filteredCourses.length === 0 && (
            <div className="px-5 py-10 text-center text-slate-300">
              Chưa có khóa học nào. Hãy tạo khóa học đầu tiên của bạn.
            </div>
          )}

          {!isLoading &&
            filteredCourses.map((course) => {
              const status = normalizeStatus(course.status);
              const thumbnail =
                course.thumbnailUrl ||
                "https://images.unsplash.com/photo-1513258496099-48168024aec0?w=1200&auto=format&fit=crop";

              return (
                <div
                  key={course._id}
                  className="grid grid-cols-1 gap-4 px-5 py-5 lg:grid-cols-[2fr_0.7fr_0.7fr_0.7fr_0.8fr_0.9fr] lg:items-center"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={thumbnail}
                      alt={course.title}
                      className="h-16 w-24 rounded-2xl object-cover"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-base font-semibold text-white">
                        {course.title}
                      </p>
                      <p className="mt-1 text-sm text-slate-400">
                        {(course.tags && course.tags[0]) || "Tổng quát"} •{" "}
                        {course.level}
                      </p>
                    </div>
                  </div>

                  {status !== "Draft" && (
                    <div className="text-sm text-slate-300 lg:text-slate-300">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5">
                        <Users className="h-4 w-4 text-cyan-300" />
                        {(course.totalStudents || 0).toLocaleString("vi-VN")}
                      </span>
                    </div>
                  )}
                  {status === "Draft" && <div />}

                  {status !== "Draft" && (
                    <div className="text-sm text-slate-300">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5">
                        <Star className="h-4 w-4 text-amber-300" />
                        {(course.ratingAvg || 0).toFixed(1)}
                      </span>
                    </div>
                  )}
                  {status === "Draft" && <div />}

                  <div className="text-sm font-semibold text-white">
                    {formatPrice(course.price)}
                  </div>

                  <div>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${
                        status === "Published"
                          ? "bg-emerald-400/10 text-emerald-300"
                          : "bg-amber-400/10 text-amber-300"
                      }`}
                    >
                      {status}
                    </span>
                  </div>

                  <div className="flex items-center justify-start gap-2 lg:justify-end">
                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/dashboard/courses/manage/${course._id}`)
                      }
                      className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
                    >
                      <Eye className="h-4 w-4" />
                      Xem
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/dashboard/courses/manage/${course._id}/edit-lessons`,
                        )
                      }
                      className="inline-flex items-center gap-2 rounded-2xl border border-amber-300/30 bg-amber-400/10 px-3 py-2 text-sm font-semibold text-amber-200 transition hover:bg-amber-400/20"
                    >
                      <Edit3 className="h-4 w-4" />
                      Sửa
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      </section>
    </div>
  );
}
