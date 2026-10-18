import React from 'react';
import { UserCheck, Shield, CalendarCheck, FileText } from 'lucide-react';

export default function EcosystemSection({ onOpenDemo }) {
  const workflows = [
    {
      title: 'Quản lý Hội viên & Gói tập',
      role: 'Dành cho Lễ tân & Hội viên',
      desc: 'Đăng ký thành viên, chọn gói tập từ Cơ bản đến Premium, tự động tính hạn thẻ và theo dõi chỉ số sức khỏe cá nhân.',
      icon: UserCheck,
    },
    {
      title: 'Quản lý Lớp học & Huấn luyện viên',
      role: 'Dành cho Quản lý & HLV',
      desc: 'Mở lớp theo các bộ môn Gym, Yoga, Bơi lội, Boxing. Phân công HLV phụ trách, xếp lịch theo thứ và kiểm soát sĩ số phòng.',
      icon: CalendarCheck,
    },
    {
      title: 'Điểm danh Check-in Cơ sở',
      role: 'Dành cho Lễ tân',
      desc: 'Quét mã hoặc tra cứu thông tin để check-in ra vào. Hệ thống tự động chặn người chưa có gói tập hợp lệ hoặc điểm danh trùng.',
      icon: Shield,
    },
    {
      title: 'Thu phí & Quản lý Hóa đơn',
      role: 'Dành cho Lễ tân & Quản lý',
      desc: 'Hỗ trợ thu tiền mặt tại quầy hoặc chuyển khoản VietQR, xuất phiếu thu hóa đơn có mã tra cứu và báo cáo doanh thu minh bạch.',
      icon: FileText,
    },
  ];

  return (
    <section id="workflow" className="py-16 bg-[#080d1a] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Quy trình vận hành chuẩn trong hệ thống
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Kết nối thông suốt giữa các bộ phận: Quản lý - Lễ tân - Huấn luyện viên - Hội viên
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {workflows.map((wf, idx) => {
            const Icon = wf.icon;
            return (
              <div
                key={idx}
                className="bg-[#0f172a] rounded-2xl p-5 border border-slate-800 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>

                  <div>
                    <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider block mb-1">
                      {wf.role}
                    </span>
                    <h3 className="text-base font-bold text-white mb-1.5">
                      {wf.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {wf.desc}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500 font-mono">
                  Bước {idx + 1} / 4 trong luồng chuẩn
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
