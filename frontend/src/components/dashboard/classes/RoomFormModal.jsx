import React from 'react';

export default function RoomFormModal({
  isOpen,
  isEditing,
  form,
  onChange,
  onClose,
  onSubmit,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h3 className="font-bold text-white text-base">
            {isEditing ? 'Cập nhật Phòng tập' : 'Thêm Phòng tập mới'}
          </h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white">
            Đóng
          </button>
        </div>
        <form onSubmit={onSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Tên phòng *</label>
            <input
              type="text"
              required
              value={form.roomName}
              onChange={(e) => onChange({ ...form, roomName: e.target.value })}
              placeholder="Ví dụ: Phòng Yoga A1"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Tầng</label>
              <input
                type="text"
                value={form.floor}
                onChange={(e) => onChange({ ...form, floor: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Sức chứa</label>
              <input
                type="number"
                min="1"
                value={form.capacity}
                onChange={(e) => onChange({ ...form, capacity: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold"
            >
              Lưu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
