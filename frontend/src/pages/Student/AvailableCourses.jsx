import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import studentService from "../../services/studentService";
import { ROUTES } from "../../lib/constants";
import { getInstructorDisplayName } from "../../lib/courseUtils";
import { useAuthStore } from "../../store/authStore";

export default function AvailableCourses() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    if (!user) return;
    if (user.role === "instructor") {
      navigate(ROUTES.DASHBOARD);
      return;
    }

    let mounted = true;
    const fetch = async () => {
      setLoading(true);
      try {
        const [availableData, ownedData] = await Promise.all([
          studentService.getAvailableCourses(page, 12),
          studentService.getMyCourses(),
        ]);

        if (!mounted) return;

        const ownedIds = new Set(
          (ownedData.data || []).map((item) => String(item.courseId)),
        );
        const filteredCourses = (availableData.data || []).filter(
          (course) => !ownedIds.has(String(course._id)),
        );

        setCourses(filteredCourses);
        setPagination(availableData.pagination);
      } catch (error) {
        if (isAuthenticated) {
          toast.error(error?.response?.data?.message || "Lỗi khi lấy dữ liệu");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetch();
    return () => {
      mounted = false;
    };
  }, [user, page, navigate, isAuthenticated]);

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="mb-4 text-2xl font-bold">Khóa học chưa mua</h1>

      {courses.length === 0 ? (
        <div className="py-16 text-center">
          Không có khóa học mới để hiển thị
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => (
            <article key={course._id} className="rounded-xl border p-4">
              <div className="flex items-start gap-4">
                <img
                  src={course.thumbnailUrl || "/placeholder.png"}
                  alt={course.title}
                  className="h-24 w-36 rounded object-cover"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{course.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Giảng viên: {getInstructorDisplayName(course)}
                  </p>
                  <p className="mt-1 line-clamp-3 text-sm text-slate-500">
                    {course.description}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="text-sm text-slate-600">
                      {course.totalLessons || 0} bài
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/courses/${course._id}`)}
                        className="rounded bg-cyan-500 px-3 py-1 text-sm text-white"
                      >
                        Xem chi tiết
                      </button>
                      <div className="flex items-center gap-1 text-sm text-slate-600">
                        <ShoppingCart className="h-4 w-4" /> Chưa mua
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {pagination && pagination.pages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          {Array.from({ length: pagination.pages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`rounded px-3 py-1 ${pagination.page === i + 1 ? "bg-purple-600 text-white" : "border bg-white"}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
