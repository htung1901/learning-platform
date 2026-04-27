import { Link, Navigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { ROUTES } from "../../lib/constants";
import { COURSE_LIST } from "../../data/courseCatalog";

const cartItems = COURSE_LIST.slice(0, 3).map((course, index) => ({
  ...course,
  quantity: index === 0 ? 1 : 1,
  discount: index === 1 ? 10 : index === 2 ? 15 : 0,
}));

export default function CartPage() {
  const { user } = useAuthStore();

  if (user?.role === "instructor") {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  const subtotal = cartItems.reduce((sum, item) => {
    const numericPrice = Number(item.price.replace(/[^\d]/g, ""));
    return sum + numericPrice * item.quantity;
  }, 0);

  const discountAmount = cartItems.reduce((sum, item) => {
    const numericPrice = Number(item.price.replace(/[^\d]/g, ""));
    return sum + (numericPrice * item.discount * item.quantity) / 100;
  }, 0);

  const total = subtotal - discountAmount;

  const formatCurrency = (value) => `${value.toLocaleString("vi-VN")}đ`;

  return (
    <div className="relative overflow-hidden py-12 sm:py-16">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-10 h-72 w-72 rounded-full bg-cyan-300/25 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-3xl border border-white/60 bg-white/80 shadow-2xl backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-900/80">
          <div className="border-b border-slate-200/70 p-6 sm:p-8 dark:border-slate-700/70">
            <div className="inline-flex items-center gap-2 rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300">
              <ShoppingCart className="h-3.5 w-3.5" />
              Giỏ hàng của bạn
            </div>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Sẵn sàng thanh toán các khóa học yêu thích
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-300 sm:text-base">
              Kiểm tra lại khóa học trong giỏ, điều chỉnh số lượng hoặc loại bỏ
              những mục không cần thiết trước khi thanh toán.
            </p>
          </div>

          <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[1.45fr_0.85fr] lg:p-8">
            <div className="space-y-4">
              {cartItems.map((item) => (
                <article
                  key={item.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-lg dark:border-slate-700 dark:bg-slate-950/50 sm:p-5"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start">
                    <div className="relative h-40 w-full overflow-hidden rounded-2xl md:h-28 md:w-44 md:flex-shrink-0">
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                      <span className="absolute left-3 top-3 rounded-full bg-slate-950/80 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur">
                        {item.category}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                            {item.title}
                          </h2>
                          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            {item.category} • {item.level}
                          </p>
                        </div>
                        <button
                          type="button"
                          className="inline-flex items-center gap-2 self-start rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-100 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                          Xóa
                        </button>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 dark:bg-slate-800">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          Có video, bài tập và tài liệu
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-50 px-3 py-1.5 text-cyan-700 dark:bg-cyan-900/20 dark:text-cyan-300">
                          Giảm {item.discount}%
                        </span>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:border-cyan-300 hover:text-cyan-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="min-w-12 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-center text-sm font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:border-cyan-300 hover:text-cyan-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="text-right">
                          <p className="text-sm text-slate-500 line-through dark:text-slate-400">
                            {item.price}
                          </p>
                          <p className="text-xl font-black text-slate-900 dark:text-white">
                            {formatCurrency(
                              Number(item.price.replace(/[^\d]/g, "")) *
                                (1 - item.discount / 100),
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-950/50 sm:p-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Tóm tắt đơn hàng
              </h2>

              <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                <div className="flex items-center justify-between">
                  <span>Tạm tính</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {formatCurrency(subtotal)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Giảm giá</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    -{formatCurrency(discountAmount)}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-base dark:border-slate-700">
                  <span className="font-semibold text-slate-900 dark:text-white">
                    Tổng cộng
                  </span>
                  <span className="text-xl font-black text-cyan-600 dark:text-cyan-300">
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>

              <div className="mt-5 rounded-2xl bg-cyan-50 p-4 text-sm text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-200">
                <p className="font-semibold">Ưu đãi thanh toán</p>
                <p className="mt-1">
                  Thanh toán ngay để nhận tài khoản học không giới hạn và lưu
                  tiến độ trên mọi thiết bị.
                </p>
              </div>

              <button
                type="button"
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-cyan-500 to-emerald-500 px-5 py-3 text-sm font-bold text-white transition hover:shadow-lg"
              >
                Thanh toán
                <ArrowRight className="h-4 w-4" />
              </button>

              <Link
                to={ROUTES.COURSES}
                className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-cyan-400 hover:text-cyan-700 dark:border-slate-700 dark:text-slate-300"
              >
                Tiếp tục mua khóa học
              </Link>
            </aside>
          </div>
        </section>
      </div>
    </div>
  );
}
