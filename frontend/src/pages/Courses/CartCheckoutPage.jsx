import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { CreditCard, ShieldCheck, TicketPercent, Wallet } from "lucide-react";
import { ROUTES } from "../../lib/constants";
import cartService from "../../services/cartService";
import paymentService from "../../services/paymentService";
import { useAuthStore } from "../../store/authStore";

const PAYMENT_METHODS = [
  { key: "card", label: "Thẻ ngân hàng", icon: CreditCard },
  { key: "momo", label: "Ví MoMo", icon: Wallet },
  { key: "vnpay", label: "VNPay", icon: ShieldCheck },
];

const toCurrency = (value) =>
  Number(value || 0).toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  });

export default function CartCheckoutPage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [coupon, setCoupon] = useState("");
  const [isPaid, setIsPaid] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchCart = async () => {
      setLoading(true);
      try {
        const res = await cartService.getCart();
        if (!mounted) return;
        setCartItems(res.data || []);
      } catch (error) {
        console.error("Failed to load cart checkout data", error);
        if (mounted) setCartItems([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchCart();
    return () => {
      mounted = false;
    };
  }, []);

  const totals = useMemo(() => {
    const price = cartItems.reduce(
      (sum, item) => sum + Number(item.price || 0),
      0,
    );
    const discount =
      coupon.trim().toUpperCase() === "SAVE10" ? Math.round(price * 0.1) : 0;
    const vat = Math.round((price - discount) * 0.08);
    const total = Math.max(0, price - discount + vat);
    return { price, discount, vat, total };
  }, [cartItems, coupon]);

  if (user?.role === "instructor") {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (isPaid) {
    return (
      <div className="relative py-16">
        <div className="mx-auto w-full max-w-3xl px-4 sm:px-6">
          <section className="rounded-3xl border border-emerald-200 bg-white p-8 text-center shadow-xl dark:border-emerald-900/50 dark:bg-slate-900">
            <div className="mx-auto mb-5 inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">
              Thanh toán giỏ hàng thành công
            </h1>
            <p className="mt-3 text-slate-600 dark:text-slate-300">
              Bạn đã thanh toán xong các khóa học trong giỏ. Hệ thống đã mở khóa
              và gửi biên nhận về email của bạn.
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

  if (cartItems.length === 0) {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-3xl items-center justify-center px-4 py-16 text-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">
            Giỏ hàng đang trống
          </h1>
          <p className="mt-3 text-slate-600 dark:text-slate-300">
            Thêm khóa học vào giỏ trước khi thanh toán.
          </p>
          <Link
            to={ROUTES.COURSES}
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-linear-to-r from-cyan-500 to-emerald-500 px-5 py-3 text-sm font-bold text-white transition hover:shadow-lg"
          >
            Đi đến danh sách khóa học
          </Link>
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
            Thanh toán giỏ hàng
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-300">
            Hoàn tất vài bước cuối để mở khóa toàn bộ khóa học trong giỏ.
          </p>

          <article className="mt-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
            {cartItems.map((item) => (
              <div
                key={item._id}
                className="flex gap-4 border-b border-slate-100 pb-4 last:border-0 last:pb-0 dark:border-slate-800"
              >
                <img
                  src={item.thumbnail || item.thumbnailUrl}
                  alt={item.title}
                  className="h-20 w-28 rounded-xl object-cover"
                />
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {item.category || "Chung"} • {item.level || "beginner"}
                  </p>
                  <h2 className="mt-1 line-clamp-2 text-lg font-bold text-slate-900 dark:text-white">
                    {item.title}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {toCurrency(item.price)}
                  </p>
                </div>
              </div>
            ))}
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
              <span>Tạm tính</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {toCurrency(totals.price)}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
              <span>Giảm giá</span>
              <span className="font-semibold text-emerald-600">
                -{toCurrency(totals.discount)}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
              <span>VAT (8%)</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {toCurrency(totals.vat)}
              </span>
            </div>
          </div>

          <div className="my-4 h-px bg-slate-200 dark:bg-slate-700" />

          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Tổng thanh toán
            </span>
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {toCurrency(totals.total)}
            </span>
          </div>

          <button
            type="button"
            onClick={async () => {
              try {
                await paymentService.fakeCartPay({
                  paymentMethod,
                  coupon,
                });
                setIsPaid(true);
              } catch (error) {
                console.error("Cart payment failed", error);
                alert("Thanh toán giỏ hàng thất bại (mô phỏng)");
              }
            }}
            className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-linear-to-r from-cyan-500 to-emerald-500 px-4 py-3 text-sm font-bold text-white transition hover:shadow-lg"
          >
            Xác nhận thanh toán
          </button>

          <Link
            to={ROUTES.CART}
            className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-cyan-400 hover:text-cyan-700 dark:border-slate-700 dark:text-slate-300"
          >
            Quay lại giỏ hàng
          </Link>

          <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
            Giao dịch được mô phỏng cho mục đích demo giao diện.
          </p>
        </aside>
      </div>
    </div>
  );
}
