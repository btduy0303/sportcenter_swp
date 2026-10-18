import React from 'react';

export default function SportClassTable({ classes, onEditClass }) {
  return (
    <div className="overflow-x-auto bg-slate-900/60 rounded-2xl border border-slate-800">
      <table className="w-full text-left text-xs text-slate-300">
        <thead className="bg-slate-800/60 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-800">
          <tr>
            <th className="p-3.5">ID</th>
            <th className="p-3.5">Tên lớp học</th>
            <th className="p-3.5">Bộ môn</th>
            <th className="p-3.5">HLV phụ trách</th>
            <th className="p-3.5">Cấp độ</th>
            <th className="p-3.5">Sĩ số tối đa</th>
            <th className="p-3.5">Hạng gói (Tier)</th>
            <th className="p-3.5 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60">
          {classes.length === 0 ? (
            <tr>
              <td colSpan="8" className="p-8 text-center text-slate-500">
                Chưa có lớp học nào được tạo.
              </td>
            </tr>
          ) : (
            classes.map((cls) => (
              <tr key={cls.id} className="hover:bg-slate-800/40 transition">
                <td className="p-3.5 font-mono text-slate-500">#{cls.id}</td>
                <td className="p-3.5 font-bold text-white">{cls.name}</td>
                <td className="p-3.5">
                  <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {cls.categoryName}
                  </span>
                </td>
                <td className="p-3.5 text-slate-200">{cls.coachName}</td>
                <td className="p-3.5">
                  <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {cls.level}
                  </span>
                </td>
                <td className="p-3.5 font-mono">{cls.maxCapacity} học viên</td>
                <td className="p-3.5 font-mono">Tier ≥ {cls.requiredTierLevel}</td>
                <td className="p-3.5 text-right">
                  <button
                    type="button"
                    onClick={() => onEditClass(cls)}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                  >
                    Chỉnh sửa
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
