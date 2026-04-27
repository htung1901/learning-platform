import { Link, Navigate } from "react-router-dom";
import { BookOpen, Users, Award, Zap, ArrowRight, Star } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { ROUTES } from "../../lib/constants";

export default function HomePage() {
  const { isAuthenticated, user } = useAuthStore();

  if (user?.role === "instructor") {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return (
    <div className="bg-white dark:bg-slate-950 overflow-hidden">
      {/* Hero Section with Gradient Background */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50 dark:from-blue-900/20 dark:via-purple-900/10 dark:to-pink-900/20"></div>
        <div className="absolute top-0 right-0 -z-10 w-96 h-96 bg-blue-200 dark:bg-blue-900/20 rounded-full filter blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 left-0 -z-10 w-96 h-96 bg-purple-200 dark:bg-purple-900/20 rounded-full filter blur-3xl opacity-20"></div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="mb-8 inline-block">
            <span className="inline-block px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-semibold">
              ✨ Khám phá cách học mới
            </span>
          </div>

          <div className="mb-8">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Nâng cao kỹ năng của bạn
              </span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Tự học từ những khóa học thiết kế bởi chuyên gia. Nhận chứng chỉ.
              Tiến bộ.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              to={ROUTES.COURSES}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-xl hover:from-blue-700 hover:to-purple-700 transition font-semibold inline-flex items-center justify-center gap-2 group"
            >
              Xem khóa học
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
            </Link>
            {!isAuthenticated && (
              <Link
                to={ROUTES.SIGNUP}
                className="px-8 py-4 border-2 border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/10 transition font-semibold inline-flex items-center justify-center gap-2"
              >
                Đăng ký miễn phí
              </Link>
            )}
          </div>

          <div className="flex justify-center gap-8 text-sm text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span>4.9/5 từ 10k+ học viên</span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <span>|</span>
              <span>Bắt đầu miễn phí ngay hôm nay</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block mb-4 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-semibold">
              Tại sao chọn chúng tôi?
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Kinh nghiệm học tập tuyệt vời
            </h2>
            <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Chúng tôi cung cấp một nền tảng học tập hoàn chỉnh với tất cả tính
              năng bạn cần
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group relative bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-4 group-hover:shadow-lg transition-shadow">
                  <BookOpen className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                  Khóa học chất lượng
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Tất cả khóa học được tạo bởi các chuyên gia có kinh nghiệm và
                  được cập nhật thường xuyên
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group relative bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-green-500 dark:hover:border-green-500 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mb-4 group-hover:shadow-lg transition-shadow">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                  Cộng đồng sôi động
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Kết nối với hàng ngàn học viên, chia sẻ kinh nghiệm và học hỏi
                  lẫn nhau
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group relative bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-purple-500 dark:hover:border-purple-500 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mb-4 group-hover:shadow-lg transition-shadow">
                  <Award className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                  Chứng chỉ công nhận
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Nhận chứng chỉ được công nhận sau khi hoàn thành khóa học
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-transparent bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text mb-2">
                10K+
              </div>
              <p className="text-slate-300">Học viên hoạt động</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text mb-2">
                500+
              </div>
              <p className="text-slate-300">Khóa học chất lượng</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-transparent bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text mb-2">
                50+
              </div>
              <p className="text-slate-300">Giảng viên hàng đầu</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-transparent bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text mb-2">
                4.9★
              </div>
              <p className="text-slate-300">Đánh giá trung bình</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Cách bắt đầu
            </h2>
            <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto text-lg">
              Chỉ với 4 bước đơn giản để bắt đầu hành trình học tập của bạn
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[
              { step: "1", title: "Đăng ký", desc: "Tạo tài khoản miễn phí" },
              {
                step: "2",
                title: "Chọn khóa",
                desc: "Chọn khóa học yêu thích",
              },
              { step: "3", title: "Học tập", desc: "Bắt đầu học ngay lập tức" },
              {
                step: "4",
                title: "Nhận chứng chỉ",
                desc: "Hoàn thành và nhận giấy chứng nhận",
              },
            ].map((item, idx) => (
              <div key={idx} className="relative">
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-700 p-6 rounded-xl border border-slate-200 dark:border-slate-600 text-center">
                  <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {item.desc}
                  </p>
                </div>
                {idx < 3 && (
                  <div className="hidden md:block absolute top-1/3 -right-2 w-4 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      {!isAuthenticated && (
        <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-10"></div>
          <div className="absolute top-0 right-0 -z-10 w-96 h-96 bg-blue-300 dark:bg-blue-900/20 rounded-full filter blur-3xl opacity-20"></div>

          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-6">
              Bắt đầu hành trình học tập của bạn ngay hôm nay
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
              Hơn 10,000 học viên đã thay đổi cuộc sống của họ thông qua các
              khóa học của chúng tôi. Đây là lúc của bạn.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to={ROUTES.SIGNUP}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-xl hover:from-blue-700 hover:to-purple-700 transition font-semibold inline-flex items-center justify-center gap-2 group"
              >
                Đăng ký miễn phí
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
              </Link>
              <Link
                to={ROUTES.LOGIN}
                className="px-8 py-4 border-2 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg hover:border-slate-400 dark:hover:border-slate-500 transition font-semibold"
              >
                Hoặc đăng nhập
              </Link>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-8">
              Không cần thẻ tín dụng. Truy cập ngay để bắt đầu.
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
