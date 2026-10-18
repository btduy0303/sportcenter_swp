import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import KpiCard from '../../components/dashboard/overview/KpiCard';
import RecentActivities from '../../components/dashboard/overview/RecentActivities';

export default function OverviewPage() {
  const { user, isManager, isReceptionist } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSubs: 0,
    todayCheckIns: 0,
    totalRevenue: 0,
  });
  const [recentAttendances, setRecentAttendances] = useState([]);
  const [recentSubs, setRecentSubs] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      if (isManager) {
        const today = new Date().toISOString().split('T')[0];
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const [memberStats, revenueReport, accounts] = await Promise.all([
          api.getMemberStatsReport(7).catch(() => null),
          api.getRevenueReport(thirtyDaysAgo, today).catch(() => null),
          api.getAllAccounts().catch(() => []),
        ]);

        const totalRev = revenueReport?.totalRevenue ? Number(revenueReport.totalRevenue) : 0;
        const totalMembers = memberStats?.totalMembers ?? accounts.length;
        const activeMembers = memberStats?.membersWithActivePackage ?? 0;
        const expiringSoon = memberStats?.expiringSoon ?? 0;

        setStats({
          totalUsers: totalMembers,
          activeSubs: activeMembers,
          todayCheckIns: expiringSoon,
          totalRevenue: totalRev,
        });
      } else {
        // Receptionist / Member
        const pkgs = await api.getActivePackages().catch(() => []);
        setStats({
          totalUsers: 1,
          activeSubs: pkgs.length,
          todayCheckIns: 0,
          totalRevenue: 0,
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const kpis = [
    {
      title: 'Tổng người dùng & hội viên',
      value: stats.totalUsers,
      sub: 'Tài khoản ghi nhận hệ thống',
      borderColor: 'border-blue-500/30',
    },
    {
      title: 'Hội viên có gói hiệu lực',
      value: stats.activeSubs,
      sub: 'Đang hoạt động tại trung tâm',
      borderColor: 'border-emerald-500/30',
    },
    {
      title: 'Hết hạn trong 7 ngày tới',
      value: stats.todayCheckIns,
      sub: 'Cần liên hệ hỗ trợ gia hạn',
      borderColor: 'border-purple-500/30',
    },
    {
      title: 'Doanh thu ghi nhận (30 ngày)',
      value: `${(stats.totalRevenue ? (stats.totalRevenue / 1000000).toFixed(1) : 0)}M ₫`,
      sub: 'Thanh toán thành công (Success)',
      borderColor: 'border-amber-500/30',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-[#0b1329] border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold tracking-wider border border-emerald-500/20 inline-block">
            Bảng điều hành
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Xin chào, {user?.fullName}!
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Hệ thống quản trị SportCenter: Quản lý hội viên, dịch vụ gói tập, gia hạn và điểm danh ra vào.
          </p>
        </div>

        {isReceptionist && (
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              to="/app/attendance"
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-colors"
            >
              Check-in Cổng
            </Link>
            <Link
              to="/app/subscriptions"
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors"
            >
              Đăng ký Gói
            </Link>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpis.map((kpi, idx) => (
          <KpiCard key={idx} {...kpi} />
        ))}
      </div>

      <RecentActivities attendances={recentAttendances} subscriptions={recentSubs} />
    </div>
  );
}
