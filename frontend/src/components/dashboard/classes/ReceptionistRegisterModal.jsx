import React from 'react';

export default function ReceptionistRegisterModal({
  isOpen,
  form,
  members,
  classes,
  onChange,
  onClose,
  onSubmit,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h3 className="font-bold text-white text-base">Đăng ký lớp học cho Hội viên</h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white">
            Đóng
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Chọn Hội viên *</label>
            <select
              required
              value={form.memberId}
              onChange={(e) => onChange({ ...form, memberId: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
            >
              <option value="">-- Chọn Hội viên --</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.fullName} ({m.phone || m.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Chọn Lớp học *</label>
            <select
              required
              value={form.classId}
              onChange={(e) => onChange({ ...form, classId: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
            >
              <option value="">-- Chọn Lớp --</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} (Bộ môn: {c.categoryName})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="waitlistCheck"
              checked={form.joinWaitlist}
              onChange={(e) => onChange({ ...form, joinWaitlist: e.target.checked })}
              className="rounded bg-slate-900 border-slate-700 text-emerald-500"
            />
            <label htmlFor="waitlistCheck" className="text-slate-300 cursor-pointer">
              Chấp nhận vào Danh sách chờ (Waitlist) nếu lớp đầy
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold"
            >
              Xác nhận đăng ký
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
