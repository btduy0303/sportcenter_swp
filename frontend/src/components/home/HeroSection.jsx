import React from 'react';
import { ArrowRight, CheckCircle2, Shield, Calendar, Users, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function HeroSection({ onOpenDemo }) {
  const { isAuthenticated } = useAuth();
  return (
    <section className="relative overflow-hidden pt-10 pb-16 lg:pt-16 lg:pb-24 border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight">
            Quản trị vận hành{' '}
            <span className="text-emerald-400">
              Trung tâm Thể thao
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Hệ thống hỗ trợ số hóa nghiệp vụ quản lý hội viên, xếp lịch ca học theo huấn luyện viên, kiểm soát điểm danh ra vào cơ sở và theo dõi thanh toán hóa đơn.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to={isAuthenticated ? "/app" : "/login"}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition cursor-pointer shadow-lg shadow-emerald-600/20"
            >
              <span>{isAuthenticated ? "Trải nghiệm ngay" : "Đăng nhập hệ thống"}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="#features"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition"
            >
              <span>Xem các chức năng</span>
            </a>
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Phân quyền 4 vai trò rõ ràng</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Kiểm soát điểm danh ra vào</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Thanh toán quầy & VietQR</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
