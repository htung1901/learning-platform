import { BarChart3, TrendingUp, Users, Star } from "lucide-react";
import { COURSE_LIST } from "../../data/courseCatalog";

export default function InstructorPerformancePage() {
  const totalStudents = COURSE_LIST.reduce(
    (sum, course) => sum + course.students,
    0,
  );
  const averageRating = (
    COURSE_LIST.reduce((sum, course) => sum + course.rating, 0) /
    COURSE_LIST.length
  ).toFixed(1);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-700 bg-slate-950 p-6 shadow-lg sm:p-8">
        <p className="inline-flex items-center gap-2 rounded-full bg-cyan-900/30 px-3 py-1 text-xs font-semibold text-cyan-300">
          <BarChart3 className="h-3.5 w-3.5" />
          Hiệu suất
        </p>
        <h2 className="mt-3 text-3xl font-black text-white">
          Báo cáo hiệu suất
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Theo dõi mức độ quan tâm của học viên, rating và các chỉ số chính của
          khóa học.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Tổng học viên",
            value: totalStudents.toLocaleString("vi-VN"),
            icon: Users,
          },
          { label: "Rating trung bình", value: averageRating, icon: Star },
          { label: "Tăng trưởng", value: "+18%", icon: TrendingUp },
          {
            label: "Khóa học hoạt động",
            value: COURSE_LIST.length,
            icon: BarChart3,
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <article
              key={item.label}
              className="rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-900">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">{item.label}</p>
                  <p className="text-2xl font-black text-white">{item.value}</p>
                </div>
              </div>
            </article>
          );
        })}
      </section>

      <section className="rounded-3xl border border-slate-700 bg-slate-950 p-6 shadow-lg">
        <h3 className="text-lg font-bold text-white">Xu hướng theo khóa học</h3>
        <div className="mt-5 space-y-4">
          {COURSE_LIST.slice(0, 4).map((course, index) => {
            const width = 80 - index * 12;
            return (
              <div key={course.id}>
                <div className="mb-2 flex items-center justify-between text-sm text-slate-400">
                  <span className="font-medium text-slate-200">
                    {course.title}
                  </span>
                  <span>
                    {course.students.toLocaleString("vi-VN")} học viên
                  </span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-cyan-500 to-violet-500"
                    style={{ width: `${width}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
