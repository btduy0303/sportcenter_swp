import React from 'react';

export default function CategoryManager({
  categories,
  onOpenCreate,
  onEditCategory,
  onDeleteCategory,
}) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-xs text-slate-400">Danh mục các bộ môn thể thao trong trung tâm</p>
        <button
          type="button"
          onClick={onOpenCreate}
          className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs transition"
        >
          Thêm Bộ môn mới
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div key={cat.id} className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-white text-sm">{cat.name}</h4>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => onEditCategory(cat)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Sửa
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteCategory(cat.id, cat.name)}
                  className="text-xs text-rose-400 hover:text-rose-300"
                >
                  Xóa
                </button>
              </div>
            </div>
            <p className="text-xs text-slate-400">{cat.description || 'Chưa có mô tả'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
