import { Link } from "react-router-dom";
import { GraduationCap, Mail, MapPin, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative mt-16 pt-16 bg-gradient-to-b from-slate-900 via-slate-900 to-black text-white overflow-hidden">
      {/* Decorative blurred elements */}
      <div className="absolute top-0 left-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4 group">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                <GraduationCap size={24} className="text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                EduHub
              </span>
            </div>
            <p className="text-sm text-slate-300 mb-6 leading-relaxed">
              Nền tảng học tập trực tuyến hàng đầu với hơn 10,000 khóa học chất
              lượng cao
            </p>
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-slate-400 hover:text-blue-400 transition-colors cursor-pointer">
                <Mail size={16} className="flex-shrink-0" />
                <span>hello@eduhub.com</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-400 hover:text-blue-400 transition-colors cursor-pointer">
                <Phone size={16} className="flex-shrink-0" />
                <span>+84 123 456 789</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-400 hover:text-blue-400 transition-colors cursor-pointer">
                <MapPin size={16} className="flex-shrink-0" />
                <span>TP. Hồ Chí Minh, Việt Nam</span>
              </div>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-white mb-6 relative inline-block">
              Khóa học
              <div className="absolute bottom-0 left-0 w-12 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
            </h4>
            <ul className="space-y-3 text-sm text-slate-300">
              <li>
                <Link
                  to="#"
                  className="hover:text-blue-400 hover:translate-x-1 transition-all duration-200 inline-flex items-center gap-2"
                >
                  <span className="w-1 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></span>
                  Lập trình
                </Link>
              </li>
              <li>
                <Link
                  to="#"
                  className="hover:text-blue-400 hover:translate-x-1 transition-all duration-200 inline-flex items-center gap-2"
                >
                  <span className="w-1 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></span>
                  Thiết kế
                </Link>
              </li>
              <li>
                <Link
                  to="#"
                  className="hover:text-blue-400 hover:translate-x-1 transition-all duration-200 inline-flex items-center gap-2"
                >
                  <span className="w-1 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></span>
                  Marketing
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-white mb-6 relative inline-block">
              Công ty
              <div className="absolute bottom-0 left-0 w-12 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
            </h4>
            <ul className="space-y-3 text-sm text-slate-300">
              <li>
                <Link
                  to="#"
                  className="hover:text-purple-400 hover:translate-x-1 transition-all duration-200 inline-flex items-center gap-2"
                >
                  <span className="w-1 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></span>
                  Về chúng tôi
                </Link>
              </li>
              <li>
                <Link
                  to="#"
                  className="hover:text-purple-400 hover:translate-x-1 transition-all duration-200 inline-flex items-center gap-2"
                >
                  <span className="w-1 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></span>
                  Liên hệ
                </Link>
              </li>
              <li>
                <Link
                  to="#"
                  className="hover:text-purple-400 hover:translate-x-1 transition-all duration-200 inline-flex items-center gap-2"
                >
                  <span className="w-1 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></span>
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-white mb-6 relative inline-block">
              Pháp lý
              <div className="absolute bottom-0 left-0 w-12 h-1 bg-gradient-to-r from-pink-500 to-red-500 rounded-full"></div>
            </h4>
            <ul className="space-y-3 text-sm text-slate-300">
              <li>
                <Link
                  to="#"
                  className="hover:text-pink-400 hover:translate-x-1 transition-all duration-200 inline-flex items-center gap-2"
                >
                  <span className="w-1 h-1 bg-gradient-to-r from-pink-500 to-red-500 rounded-full"></span>
                  Điều khoản
                </Link>
              </li>
              <li>
                <Link
                  to="#"
                  className="hover:text-pink-400 hover:translate-x-1 transition-all duration-200 inline-flex items-center gap-2"
                >
                  <span className="w-1 h-1 bg-gradient-to-r from-pink-500 to-red-500 rounded-full"></span>
                  Chính sách
                </Link>
              </li>
              <li>
                <Link
                  to="#"
                  className="hover:text-pink-400 hover:translate-x-1 transition-all duration-200 inline-flex items-center gap-2"
                >
                  <span className="w-1 h-1 bg-gradient-to-r from-pink-500 to-red-500 rounded-full"></span>
                  Quyền riêng tư
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-700/50 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-center md:text-left text-sm text-slate-400">
              © 2025 EduHub. Tất cả quyền được bảo lưu.
            </p>
            {/* Newsletter */}
            <div className="flex items-center gap-2">
              <input
                type="email"
                placeholder="Nhận tin tức mới nhất"
                className="px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-300 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
              />
              <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg text-sm font-medium transition-all">
                Đăng ký
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
