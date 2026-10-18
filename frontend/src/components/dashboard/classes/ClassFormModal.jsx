import React from 'react';

export default function ClassFormModal({
  isOpen,
  isEditing,
  form,
  categories,
  coaches,
  onChange,
  onClose,
  onSubmit,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h3 className="font-bold text-white text-base">
            {isEditing ? 'Cập nhật Lớp học' : 'Tạo Lớp học Thể thao mới'}
          </h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white">
            Đóng
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Tên lớp học *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => onChange({ ...form, name: e.target.value })}
              placeholder="Ví dụ: Yoga Bình Minh Khóa 01"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Bộ môn *</label>
              <select
                required
                value={form.categoryId}
                onChange={(e) => onChange({ ...form, categoryId: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
              >
                <option value="">-- Chọn Bộ môn --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Huấn luyện viên phụ trách *</label>
              <select
                required
                value={form.coachId}
                onChange={(e) => onChange({ ...form, coachId: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
              >
                <option value="">-- Chọn HLV --</option>
                {coaches.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.fullName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Cấp độ</label>
              <select
                value={form.level}
                onChange={(e) => onChange({ ...form, level: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
              >
                <option value="BEGINNER">Cơ bản (Beginner)</option>
                <option value="INTERMEDIATE">Trung cấp</option>
                <option value="ADVANCED">Nâng cao</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Sĩ số tối đa *</label>
              <input
                type="number"
                min="1"
                required
                value={form.maxCapacity}
                onChange={(e) => onChange({ ...form, maxCapacity: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Hạng gói (Tier) *</label>
              <input
                type="number"
                min="1"
                required
                value={form.requiredTierLevel}
                onChange={(e) => onChange({ ...form, requiredTierLevel: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Mô tả chi tiết lớp</label>
            <textarea
              rows="3"
              value={form.description}
              onChange={(e) => onChange({ ...form, description: e.target.value })}
              placeholder="Mô tả nội dung chương trình giảng dạy..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
            />
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
              Lưu lớp học
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
