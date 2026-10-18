import React from 'react';

export default function RoomManager({
  rooms,
  onOpenCreate,
  onEditRoom,
  onDeleteRoom,
}) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-xs text-slate-400">Danh sách các phòng chức năng, sân tập của trung tâm</p>
        <button
          type="button"
          onClick={onOpenCreate}
          className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs transition"
        >
          Thêm Phòng tập mới
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {rooms.map((room) => (
          <div key={room.id} className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-white text-sm">{room.roomName}</h4>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => onEditRoom(room)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Sửa
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteRoom(room.id, room.roomName)}
                  className="text-xs text-rose-400 hover:text-rose-300"
                >
                  Xóa
                </button>
              </div>
            </div>
            <div className="text-xs text-slate-300 space-y-1">
              <div>Vị trí: Tầng {room.floor}</div>
              <div>Sức chứa: {room.capacity} người</div>
              <div>
                Tình trạng: <span className="text-emerald-400 font-semibold">{room.maintenanceStatus}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
