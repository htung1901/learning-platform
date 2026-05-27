import { useState, useEffect } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { CreditCard, ShieldCheck, TicketPercent, Wallet } from "lucide-react";
import { ROUTES } from "../../lib/constants";
import courseService from "../../services/courseService";
import paymentService from "../../services/paymentService";
import studentService from "../../services/studentService";
import { useAuthStore } from "../../store/authStore";

const getCourseOwnerId = (course) =>
  course?.instructorId?._id || course?.instructorId?.id || course?.instructorId;

const PAYMENT_METHODS = [
  { key: "card", label: "Thẻ ngân hàng", icon: CreditCard },
  { key: "momo", label: "Ví MoMo", icon: Wallet },
  { key: "vnpay", label: "VNPay", icon: ShieldCheck },
];

// parsePrice removed; using numeric course.price from API

const toCurrency = (value) =>
  value.toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  });

export default function CourseCheckoutPage() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOwned, setIsOwned] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [coupon, setCoupon] = useState("");
  const [isPaid, setIsPaid] = useState(false);
  const { user } = useAuthStore();
  const isCreator = Boolean(
    user?._id && String(getCourseOwnerId(course) || "") === String(user._id),
  );

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await courseService.getCourseById(id);
        if (!mounted) return;
        setCourse(res.data);
      } catch {
        if (!mounted) return;
        setCourse(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetch();
    return () => (mounted = false);
  }, [id]);

  useEffect(() => {
    let mounted = true;

    const checkOwnership = async () => {
      if (!user || user.role === "instructor") return;

      try {
        const response = await studentService.getMyCourses();
        if (!mounted) return;

        const owned = (response.data || []).some(
          (item) => String(item.courseId) === String(id),
        );
        setIsOwned(owned);
      } catch {
        if (mounted) setIsOwned(false);
      }
    };

    checkOwnership();

    return () => {
      mounted = false;
    };
  }, [id, user]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (!course) return <Navigate to={ROUTES.COURSES} replace />;
  if (isOwned || isCreator) {
    return <Navigate to={`/courses/${id}`} replace />;
  }

  const price = Number(course.price || 0);
  const discount =
    coupon.trim().toUpperCase() === "SAVE10" ? Math.round(price * 0.1) : 0;

  const vat = Math.round((price - discount) * 0.08);
  const total = Math.max(0, price - discount + vat);

  if (isPaid) {
    return (
      <div className="relative py-16">
        <div className="mx-auto w-full max-w-3xl px-4 sm:px-6">
          <section className="rounded-3xl border border-emerald-200 bg-white p-8 text-center shadow-xl dark:border-emerald-900/50 dark:bg-slate-900">
            <div className="mx-auto mb-5 inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">
              Thanh toán thành công
            </h1>
            <p className="mt-3 text-slate-600 dark:text-slate-300">
              Bạn đã sở hữu khóa học <strong>{course.title}</strong>. Chúng tôi
              đã gửi biên nhận về email của bạn.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to={ROUTES.ENROLLED_COURSES}
                className="inline-flex items-center justify-center rounded-xl bg-linear-to-r from-cyan-500 to-emerald-500 px-5 py-3 text-sm font-bold text-white transition hover:shadow-lg"
              >
                Vào học ngay
              </Link>
              <Link
                to={ROUTES.COURSES}
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-cyan-400 hover:text-cyan-700 dark:border-slate-700 dark:text-slate-300"
              >
                Mua thêm khóa học khác
              </Link>
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden py-10 sm:py-14">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 right-4 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-amber-300/20 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8">
        <section className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-lg backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-900/70 sm:p-8">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Thanh toán khóa học
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-300">
            Hoàn tất vài bước cuối để mở khóa toàn bộ nội dung học.
          </p>

          <article className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
            <div className="flex gap-4">
              <img
                src={course.thumbnailUrl}
                alt={course.title}
                className="h-24 w-36 rounded-xl object-cover"
              />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {course.category || "Chung"} • {course.level || "beginner"}
                </p>
                <h2 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                  {course.title}
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Giảng viên:{" "}
                  {course.instructorId?.displayName || course.instructor?.name}
                </p>
              </div>
            </div>
          </article>

          <div className="mt-7">
            <p className="mb-3 text-sm font-semibold text-slate-600 dark:text-slate-300">
              Chọn phương thức thanh toán
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {PAYMENT_METHODS.map((method) => {
                const Icon = method.icon;
                const active = paymentMethod === method.key;
                return (
                  <button
                    key={method.key}
                    type="button"
                    onClick={() => setPaymentMethod(method.key)}
                    className={`rounded-xl border px-4 py-3 text-left transition ${
                      active
                        ? "border-cyan-500 bg-cyan-50 text-cyan-700 dark:border-cyan-400 dark:bg-cyan-900/20 dark:text-cyan-300"
                        : "border-slate-200 bg-white text-slate-700 hover:border-cyan-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                    }`}
                  >
                    <Icon className="mb-2 h-4 w-4" />
                    <span className="text-sm font-semibold">
                      {method.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-7 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Mã giảm giá
            </label>
            <div className="mt-2 flex gap-2">
              <div className="relative flex-1">
                <TicketPercent className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={coupon}
                  onChange={(event) => setCoupon(event.target.value)}
                  placeholder="Nhập mã (ví dụ: SAVE10)"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-cyan-400 dark:focus:ring-cyan-900/30"
                />
              </div>
            </div>
            {coupon.trim() && coupon.trim().toUpperCase() !== "SAVE10" ? (
              <p className="mt-2 text-xs font-medium text-rose-600">
                Mã không hợp lệ. Dùng SAVE10 để giảm 10%.
              </p>
            ) : null}
          </div>
        </section>

        <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Chi tiết đơn hàng
          </h3>

          <div className="mt-5 space-y-3 text-sm">
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
              <span>Giá khóa học</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {toCurrency(price)}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
              <span>Giảm giá</span>
              <span className="font-semibold text-emerald-600">
                -{toCurrency(discount)}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
              <span>VAT (8%)</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {toCurrency(vat)}
              </span>
            </div>
          </div>

          <div className="my-4 h-px bg-slate-200 dark:bg-slate-700" />

          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Tổng thanh toán
            </span>
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {toCurrency(total)}
            </span>
          </div>

          <button
            type="button"
            onClick={async () => {
              try {
                await paymentService.fakePay({
                  courseId: course._id,
                  paymentMethod,
                });
                setIsPaid(true);
              } catch (e) {
                console.error("Payment failed", e);
                alert("Thanh toán thất bại (mô phỏng)");
              }
            }}
            className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-linear-to-r from-cyan-500 to-emerald-500 px-4 py-3 text-sm font-bold text-white transition hover:shadow-lg"
          >
            Xác nhận thanh toán
          </button>

          <Link
            to={`/courses/${course._id}`}
            className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-cyan-400 hover:text-cyan-700 dark:border-slate-700 dark:text-slate-300"
          >
            Quay lại trang khóa học
          </Link>
        </aside>
      </div>
    </div>
  );
}
