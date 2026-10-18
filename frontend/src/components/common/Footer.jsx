import React from 'react';
import { Dumbbell, Phone, Mail, MapPin, Award } from 'lucide-react';

export default function Footer({ onOpenDemo }) {
  return (
    <footer className="bg-[#050811] text-slate-400 border-t border-slate-800/80 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-white">
                <Dumbbell className="w-5 h-5" />
              </div>
              <span className="text-2xl font-black text-white">
                Sport<span className="text-emerald-400">Center</span>
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
              Hệ thống quản lý trung tâm thể thao hỗ trợ quản lý thẻ hội viên, phân ca lớp học, điểm danh check-in và thống kê doanh thu.
            </p>
          </div>

          {/* Column 1: Sản phẩm */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Phân Hệ SportCenter</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#features" className="hover:text-emerald-400 transition-colors">Quản lý Hội viên & Thẻ tập</a></li>
              <li><a href="#features" className="hover:text-emerald-400 transition-colors">Đặt sân & Lịch lớp tuần</a></li>
              <li><a href="#features" className="hover:text-emerald-400 transition-colors">Thu phí tự động & POS</a></li>
              <li><a href="#features" className="hover:text-emerald-400 transition-colors">Huấn luyện viên & Trọng tài</a></li>
              <li><a href="#features" className="hover:text-emerald-400 transition-colors">Zalo Mini App đặt sân</a></li>
              <li><a href="#features" className="hover:text-emerald-400 transition-colors">Quản lý Chuỗi cơ sở</a></li>
            </ul>
          </div>

          {/* Column 2: Giải pháp */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Mô Hình Ứng Dụng</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#ecosystem" className="hover:text-emerald-400 transition-colors">Tổ hợp thể thao đa môn</a></li>
              <li><a href="#ecosystem" className="hover:text-emerald-400 transition-colors">Cụm sân Tennis & Pickleball</a></li>
              <li><a href="#ecosystem" className="hover:text-emerald-400 transition-colors">Sân bóng đá cỏ nhân tạo</a></li>
              <li><a href="#ecosystem" className="hover:text-emerald-400 transition-colors">Bể bơi & Trung tâm bơi lội</a></li>
              <li><a href="#ecosystem" className="hover:text-emerald-400 transition-colors">Phòng tập Gym & Yoga</a></li>
            </ul>
          </div>

          {/* Column 3: Thông tin đồ án */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Thông Tin Hệ Thống</h4>
            <div className="space-y-2.5 text-xs text-slate-400">
              <div>
                <strong className="text-slate-300">Đồ án chuyên ngành:</strong>
                <p>Hệ thống Quản lý Trung tâm Thể thao</p>
              </div>
              <div>
                <strong className="text-slate-300">Công nghệ:</strong>
                <p>Spring Boot & React</p>
              </div>
              <div>
                <strong className="text-slate-300">Phiên bản:</strong>
                <p>v1.0 - Năm học 2024 - 2025</p>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© 2026 SportCenter. Hệ thống Quản trị Trung tâm Thể thao.</p>
          <div className="flex items-center gap-6">
            <a href="/login" className="text-emerald-400 hover:text-emerald-300 font-bold">
              Đăng nhập hệ thống
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
