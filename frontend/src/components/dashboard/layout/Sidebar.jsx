import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';

export default function Sidebar({ isOpen, onClose }) {
  const auth = useAuth() || {};
  const { user, logout } = auth;
  const toast = useToast();
  const navigate = useNavigate();

  // Phân quyền hiển thị Menu theo từng vai trò rõ ràng:
  // - Manager: Xem Tổng quan, Quản lý Người dùng, Gói tập, Lớp học & Lịch tập, Thu phí & Hóa đơn, Hồ sơ
  // - Receptionist: Xem Tổng quan, Quản lý Hội viên, Đăng ký & Gia hạn, Lớp học & Lịch tập, Điểm danh, Thu phí & Hóa đơn, Hồ sơ
  // - Coach: Xem Lớp học & Lịch dạy, Hồ sơ cá nhân
  // - Member: Xem Gói tập, Đăng ký gói của mình, Lớp học & Lịch tập, Lịch sử thanh toán, Hồ sơ
  const isManager = user?.role === 'MANAGER';
  const isReceptionistOnly = user?.role === 'RECEPTIONIST';
  const isStaff = isManager || isReceptionistOnly;
  const isCoach = user?.role === 'COACH';
  const isMember = user?.role === 'MEMBER';

  const navItems = [
    { to: '/app', label: 'Tổng quan', show: isStaff },
    { to: '/app/users', label: isManager ? 'Quản lý Tài khoản' : 'Danh sách Hội viên', show: isStaff },
    { to: '/app/packages', label: 'Gói tập thể thao', show: isManager || isMember },
    { to: '/app/subscriptions', label: isMember ? 'Gói tập của tôi' : 'Hợp đồng & Gia hạn', show: isReceptionistOnly || isMember },
    { to: '/app/classes', label: isCoach ? 'Lịch dạy phụ trách' : 'Lớp học & Thời khóa biểu', show: true },
    { to: '/app/attendance', label: 'Điểm danh ra vào', show: isReceptionistOnly },
    { to: '/app/payments', label: isMember ? 'Lịch sử thanh toán' : 'Thu phí & Hóa đơn', show: !isCoach },
    { to: '/app/profile', label: 'Hồ sơ cá nhân', show: true },
  ].filter((item) => item.show !== false);

  const roleLabels = {
    MANAGER: { label: 'Quản lý', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
    RECEPTIONIST: { label: 'Lễ tân', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
    COACH: { label: 'HLV (Coach)', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
    MEMBER: { label: 'Hội viên', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  };


  const handleLogout = () => {
    logout();
    toast.info('Bạn đã đăng xuất khỏi hệ thống.');
    navigate('/login');
  };

  return (
    <aside
      className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 bg-[#0b1329] border-r border-slate-800 flex flex-col justify-between transition-transform duration-200 ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}
    >
      <div className="p-4 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-black text-sm">
              SC
            </div>
            <div>
              <span className="text-lg font-black text-white">
                Sport<span className="text-emerald-400">Center</span>
              </span>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Portal</p>
            </div>
          </Link>
          <Link
            to="/"
            className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-900 border border-slate-800"
          >
            Trang chủ
          </Link>
        </div>

        <div>
          <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-medium text-slate-400">Tài khoản</span>
            </div>

            <div className="flex items-center gap-2.5">
              <img
                src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt=""
                className="w-9 h-9 rounded-lg object-cover border border-slate-700 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-white truncate">{user?.fullName || 'Người dùng'}</div>
                <span
                  className={`inline-block text-[10px] px-2 py-0.2 rounded border mt-0.5 ${
                    roleLabels[user?.role]?.color || 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {roleLabels[user?.role]?.label || user?.role}
                </span>
              </div>
            </div>
          </div>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/app'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                  isActive
                    ? 'bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`
              }
            >
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-800 space-y-2">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full py-2 px-3 rounded-xl bg-rose-950/30 hover:bg-rose-900/50 text-rose-300 text-xs font-semibold border border-rose-900/40"
        >
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
