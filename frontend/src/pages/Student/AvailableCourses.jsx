import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import studentService from "../../services/studentService";
import { ROUTES } from "../../lib/constants";
import { useAuthStore } from "../../store/authStore";
import { ShoppingCart, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

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

    const fetch = async () => {
      setLoading(true);
      try {
        const data = await studentService.getAvailableCourses(page, 12);
        setCourses(data.data);
        setPagination(data.pagination);
      } catch (error) {
        if (isAuthenticated) {
          toast.error(error?.response?.data?.message || "Lỗi khi lấy dữ liệu");
        }
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [user, page, navigate, isAuthenticated]);

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-4">Khóa học chưa mua</h1>

      {courses.length === 0 ? (
        <div className="text-center py-16">
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
                  className="h-24 w-36 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{course.title}</h3>
                  <p className="text-sm text-slate-500 mt-1 line-clamp-3">
                    {course.description}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="text-sm text-slate-600">
                      {course.totalLessons || 0} bài
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/courses/${course._id}`)}
                        className="px-3 py-1 rounded bg-cyan-500 text-white text-sm"
                      >
                        Xem chi tiết
                      </button>
                      <div className="text-sm text-slate-600 flex items-center gap-1">
                        <ShoppingCart className="w-4 h-4" /> Chưa mua
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
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: pagination.pages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-3 py-1 rounded ${pagination.page === i + 1 ? "bg-purple-600 text-white" : "bg-white border"}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
