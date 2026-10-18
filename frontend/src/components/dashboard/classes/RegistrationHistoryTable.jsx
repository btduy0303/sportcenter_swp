import React from 'react';

export default function RegistrationHistoryTable({
  registrations,
  isReceptionist,
  isMember,
  members = [],
  selectedMemberId,
  onMemberSelect,
  onCancelRegistration,
}) {
  return (
    <div className="space-y-4">
      {isReceptionist && (
        <div className="flex items-center gap-3 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-300 font-semibold">Chọn Hội viên để xem:</span>
          <select
            value={selectedMemberId}
            onChange={(e) => onMemberSelect(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white max-w-xs"
          >
            <option value="">-- Chọn Hội viên --</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.fullName} ({m.email})
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="overflow-x-auto bg-slate-900/60 rounded-2xl border border-slate-800">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-800/60 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="p-3.5">Mã ĐK</th>
              <th className="p-3.5">Lớp học</th>
              <th className="p-3.5">Học viên</th>
              <th className="p-3.5">Ngày đăng ký</th>
              <th className="p-3.5">Trạng thái</th>
              <th className="p-3.5">Phạt hủy muộn?</th>
              <th className="p-3.5 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {registrations.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-8 text-center text-slate-500">
                  Chưa có lượt đăng ký lớp học nào.
                </td>
              </tr>
            ) : (
              registrations.map((reg) => (
                <tr key={reg.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-3.5 font-mono text-slate-500">#{reg.id}</td>
                  <td className="p-3.5 font-bold text-white">{reg.className}</td>
                  <td className="p-3.5">{reg.memberName}</td>
                  <td className="p-3.5 text-slate-400">
                    {reg.registeredAt ? new Date(reg.registeredAt).toLocaleDateString('vi-VN') : '—'}
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        reg.status === 'REGISTERED'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : reg.status === 'WAITLIST' || reg.status === 'WAITLISTED'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {reg.status}
                    </span>
                  </td>
                  <td className="p-3.5">
                    {reg.isPenalized ? (
                      <span className="text-rose-400 font-semibold">Bị phạt</span>
                    ) : (
                      <span className="text-slate-500">Không</span>
                    )}
                  </td>
                  <td className="p-3.5 text-right">
                    {['REGISTERED', 'WAITLISTED', 'WAITLIST'].includes(reg.status) && (
                      <button
                        type="button"
                        onClick={() => onCancelRegistration(reg)}
                        className="px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-medium"
                      >
                        Hủy lớp
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
