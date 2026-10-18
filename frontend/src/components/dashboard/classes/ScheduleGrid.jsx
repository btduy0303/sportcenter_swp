import React from 'react';

export default function ScheduleGrid({
  schedules,
  isManager,
  isMember,
  myRegistrations,
  onRegisterMyself,
  onEditSchedule,
  onDeleteSchedule,
}) {
  if (schedules.length === 0) {
    return (
      <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800 text-slate-400">
        <p className="text-sm">Không tìm thấy ca học nào phù hợp với bộ lọc.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {schedules.map((s) => (
        <div
          key={s.id}
          className="bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 rounded-2xl p-4 flex flex-col justify-between transition-all hover:shadow-xl group"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-xs uppercase tracking-wider">
                {s.dayOfWeekName || `Thứ ${s.dayOfWeek + 1}`}
              </span>
              <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                {s.startTime?.slice(0, 5)} - {s.endTime?.slice(0, 5)}
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition">
                {s.className}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                <span className="text-indigo-400 font-medium">{s.categoryName}</span>
                <span>•</span>
                <span className="text-amber-400 font-medium">Cấp độ: {s.level}</span>
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800/80 text-xs space-y-1.5 text-slate-300">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">HLV Phụ trách:</span>
                <span className="font-semibold text-white">{s.coachName || 'Chưa phân công'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Phòng học:</span>
                <span className="font-semibold text-white">
                  {s.roomName} (Tầng {s.floor || '1'})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Sức chứa phòng / Lớp:</span>
                <span className="font-mono text-slate-300">
                  {s.classMaxCapacity || 20} người
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between">
            {isMember && (() => {
              const myReg = myRegistrations.find(
                (r) => String(r.classId) === String(s.classId) && ['REGISTERED', 'WAITLISTED', 'WAITLIST'].includes(r.status)
              );
              if (myReg) {
                return (
                  <button
                    type="button"
                    disabled
                    className="w-full py-2 rounded-xl bg-slate-800 text-emerald-400 border border-emerald-500/30 font-bold text-xs cursor-not-allowed"
                  >
                    {myReg.status === 'REGISTERED' ? 'Đã đăng ký' : 'Đang trong danh sách chờ'}
                  </button>
                );
              }
              return (
                <button
                  type="button"
                  onClick={() => onRegisterMyself(s.classId, false)}
                  className="w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5"
                >
                  Đăng ký tham gia lớp
                </button>
              );
            })()}

            {isManager && (
              <div className="flex items-center justify-end gap-2 w-full">
                <button
                  type="button"
                  onClick={() => onEditSchedule(s)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
                >
                  Sửa
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteSchedule(s.id)}
                  className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs transition"
                >
                  Xóa
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
