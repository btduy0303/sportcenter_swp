import React from 'react';

export default function ScheduleFormModal({
  isOpen,
  isEditing,
  form,
  classes,
  rooms,
  dayNames,
  onChange,
  onClose,
  onSubmit,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h3 className="font-bold text-white text-base">
            {isEditing ? 'Cập nhật Ca học' : 'Xếp Lịch / Ca học mới'}
          </h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white">
            Đóng
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Chọn Lớp học *</label>
            <select
              required
              value={form.classId}
              onChange={(e) => onChange({ ...form, classId: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
            >
              <option value="">-- Chọn Lớp --</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} (HLV: {cls.coachName})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Chọn Phòng tập *</label>
            <select
              required
              value={form.roomId}
              onChange={(e) => onChange({ ...form, roomId: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
            >
              <option value="">-- Chọn Phòng --</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.roomName} (Tầng {r.floor})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Thứ trong tuần *</label>
            <select
              value={form.dayOfWeek}
              onChange={(e) => onChange({ ...form, dayOfWeek: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
            >
              {Object.entries(dayNames).map(([val, name]) => (
                <option key={val} value={val}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Giờ bắt đầu *</label>
              <input
                type="time"
                required
                value={form.startTime}
                onChange={(e) => onChange({ ...form, startTime: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Giờ kết thúc *</label>
              <input
                type="time"
                required
                value={form.endTime}
                onChange={(e) => onChange({ ...form, endTime: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
              />
            </div>
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
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
            >
              Lưu ca học
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
