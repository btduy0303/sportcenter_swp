import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import CountdownConfirmModal from '../../components/common/CountdownConfirmModal';

export default function ClassesPage() {
  const { user, isManager, isReceptionist, isMember } = useAuth();
  const toast = useToast();
  const isCoach = user?.role === 'COACH';

  // Active Tab: 'schedules', 'classes', 'categories', 'rooms', 'registrations'
  const [activeTab, setActiveTab] = useState(isCoach ? 'schedules' : (isMember ? 'schedules' : 'classes'));
  const [loading, setLoading] = useState(false);

  // Data states
  const [categories, setCategories] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [classes, setClasses] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [members, setMembers] = useState([]);

  // Filter states
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('');
  const [receptionistSelectedMember, setReceptionistSelectedMember] = useState('');

  // Modals state
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [isReceptionistRegModalOpen, setIsReceptionistRegModalOpen] = useState(false);

  // Editing items
  const [editingItem, setEditingItem] = useState(null);

  // Forms state
  const [classForm, setClassForm] = useState({
    categoryId: '',
    coachId: '',
    name: '',
    description: '',
    level: 'BEGINNER',
    maxCapacity: 20,
    requiredTierLevel: 2,
  });

  const [scheduleForm, setScheduleForm] = useState({
    classId: '',
    roomId: '',
    dayOfWeek: 1,
    startTime: '08:00',
    endTime: '09:30',
  });

  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });
  const [roomForm, setRoomForm] = useState({
    roomName: '',
    floor: '1',
    capacity: 25,
    description: '',
    maintenanceStatus: 'GOOD',
  });

  const [receptionistRegForm, setReceptionistRegForm] = useState({
    memberId: '',
    classId: '',
    joinWaitlist: false,
  });

  // Confirm modal
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Xác nhận',
    type: 'danger',
    action: null,
  });

  // Day of week mapping
  const dayNames = {
    1: 'Thứ 2',
    2: 'Thứ 3',
    3: 'Thứ 4',
    4: 'Thứ 5',
    5: 'Thứ 6',
    6: 'Thứ 7',
    7: 'Chủ Nhật',
  };

  useEffect(() => {
    loadInitialData();
  }, [user]);

  const showMsg = (text, type = 'success') => {
    if (type === 'error') toast.error(text);
    else if (type === 'warning') toast.warning(text);
    else toast.success(text);
  };

  const loadInitialData = async () => {
    setLoading(true);
    try {
      // Load categories & rooms for options
      const [catsRes, roomsRes] = await Promise.all([
        api.getSportCategories().catch(() => []),
        api.getRooms().catch(() => []),
      ]);
      setCategories(Array.isArray(catsRes) ? catsRes : []);
      setRooms(Array.isArray(roomsRes) ? roomsRes : []);

      // Load classes
      if (isManager) {
        const [clsRes, accsRes] = await Promise.all([
          api.getSportClasses().catch(() => []),
          api.getAllAccounts().catch(() => []),
        ]);
        setClasses(Array.isArray(clsRes) ? clsRes : []);
        const coachList = Array.isArray(accsRes) ? accsRes.filter(a => a.role === 'COACH') : [];
        setCoaches(coachList);
      }

      // Load schedules
      if (isCoach) {
        const myScheds = await api.getCoachMySchedules().catch(() => []);
        setSchedules(Array.isArray(myScheds) ? myScheds : []);
      } else {
        const allScheds = await api.getAllClassSchedules().catch(() => []);
        setSchedules(Array.isArray(allScheds) ? allScheds : []);
      }

      // Load registrations for Member
      if (isMember) {
        const myRegs = await api.getMyClassRegistrations().catch(() => []);
        setMyRegistrations(Array.isArray(myRegs) ? myRegs : []);
      }

      // Load members for Receptionist only (Manager calls getAllAccounts)
      if (user?.role === 'RECEPTIONIST') {
        const mems = await api.searchReceptionistMembers('').catch(() => []);
        setMembers(Array.isArray(mems) ? mems : []);
      } else if (isManager) {
        const mems = await api.getAllAccounts().catch(() => []);
        const onlyMems = Array.isArray(mems) ? mems.filter(u => u.role === 'MEMBER') : [];
        setMembers(onlyMems);
      }
    } catch (e) {
      console.error(e);
      showMsg('Không thể tải toàn bộ dữ liệu lịch học: ' + e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // ==================== MEMBER ACTIONS ====================
  const handleRegisterMyself = async (classId, joinWaitlist = false) => {
    try {
      const res = await api.registerMyClass(classId, joinWaitlist);
      showMsg(`Đăng ký thành công lớp #${classId}! Trạng thái: ${res.status}`);
      const updatedRegs = await api.getMyClassRegistrations();
      setMyRegistrations(Array.isArray(updatedRegs) ? updatedRegs : []);
    } catch (err) {
      // If capacity full and not yet waitlist, prompt user
      if (err.message && err.message.toLowerCase().includes('đầy') || err.message.toLowerCase().includes('capacity')) {
        setConfirmModal({
          isOpen: true,
          title: 'Lớp học đã đủ sĩ số',
          message: 'Lớp này hiện đã đầy. Bạn có muốn ghi danh vào Danh sách chờ (Waitlist) để nhận lượt khi có người hủy không?',
          confirmText: 'Vào danh sách chờ',
          type: 'warning',
          action: () => handleRegisterMyself(classId, true),
        });
      } else {
        showMsg(err.message, 'error');
      }
    }
  };

  const handleCancelMyRegistration = (regId, className) => {
    setConfirmModal({
      isOpen: true,
      title: 'Hủy đăng ký lớp',
      message: `Bạn có chắc chắn muốn hủy đăng ký lớp "${className}"? Lưu ý: Nếu hủy trong vòng 2 giờ trước giờ học, bạn có thể bị phạt hủy muộn theo nội quy trung tâm.`,
      confirmText: 'Xác nhận hủy',
      type: 'danger',
      action: async () => {
        try {
          await api.cancelMyClassRegistration(regId);
          showMsg('Hủy đăng ký lớp thành công.');
          const updatedRegs = await api.getMyClassRegistrations();
          setMyRegistrations(Array.isArray(updatedRegs) ? updatedRegs : []);
        } catch (err) {
          showMsg(err.message, 'error');
        }
      },
    });
  };

  // ==================== RECEPTIONIST ACTIONS ====================
  const handleLoadMemberRegistrations = async (memberId) => {
    setReceptionistSelectedMember(memberId);
    if (!memberId) {
      setMyRegistrations([]);
      return;
    }
    try {
      const res = await api.getMemberClassRegistrationsByReceptionist(memberId);
      setMyRegistrations(Array.isArray(res) ? res : []);
    } catch (err) {
      showMsg(err.message, 'error');
    }
  };

  const handleReceptionistRegister = async (e) => {
    e.preventDefault();
    if (!receptionistRegForm.memberId || !receptionistRegForm.classId) {
      showMsg('Vui lòng chọn hội viên và lớp học', 'error');
      return;
    }
    try {
      await api.registerMemberClassByReceptionist({
        userId: Number(receptionistRegForm.memberId),
        classId: Number(receptionistRegForm.classId),
      }, receptionistRegForm.joinWaitlist);
      showMsg('Lễ tân đăng ký lớp cho hội viên thành công!');
      setIsReceptionistRegModalOpen(false);
      handleLoadMemberRegistrations(receptionistRegForm.memberId);
    } catch (err) {
      if (err.message && (err.message.includes('đầy') || err.message.includes('capacity'))) {
        setConfirmModal({
          isOpen: true,
          title: 'Lớp học đã đủ sĩ số',
          message: 'Lớp học hiện đã kín chỗ. Bạn có muốn thêm hội viên này vào Danh sách chờ (Waitlist) không?',
          confirmText: 'Vào Waitlist',
          type: 'warning',
          action: async () => {
            await api.registerMemberClassByReceptionist({
              userId: Number(receptionistRegForm.memberId),
              classId: Number(receptionistRegForm.classId),
            }, true);
            showMsg('Đã đưa hội viên vào Waitlist thành công!');
            setIsReceptionistRegModalOpen(false);
            handleLoadMemberRegistrations(receptionistRegForm.memberId);
          },
        });
      } else {
        showMsg(err.message, 'error');
      }
    }
  };

  const handleReceptionistCancelReg = (regId) => {
    setConfirmModal({
      isOpen: true,
      title: 'Hủy đăng ký lớp cho hội viên',
      message: 'Xác nhận hủy đăng ký lớp này cho hội viên?',
      confirmText: 'Hủy đăng ký',
      type: 'danger',
      action: async () => {
        try {
          await api.cancelMemberClassRegistrationByReceptionist(regId);
          showMsg('Đã hủy đăng ký lớp thành công.');
          if (receptionistSelectedMember) {
            handleLoadMemberRegistrations(receptionistSelectedMember);
          }
        } catch (err) {
          showMsg(err.message, 'error');
        }
      },
    });
  };

  // ==================== MANAGER CRUD ====================
  // 1. Sport Class
  const handleSaveClass = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        categoryId: Number(classForm.categoryId),
        coachId: Number(classForm.coachId),
        name: classForm.name,
        description: classForm.description,
        level: classForm.level,
        maxCapacity: Number(classForm.maxCapacity),
        requiredTierLevel: Number(classForm.requiredTierLevel),
      };

      if (editingItem) {
        await api.updateSportClass(editingItem.id, payload);
        showMsg('Cập nhật thông tin lớp học thành công!');
      } else {
        await api.createSportClass(payload);
        showMsg('Tạo lớp học mới thành công!');
      }
      setIsClassModalOpen(false);
      setEditingItem(null);
      const res = await api.getSportClasses();
      setClasses(Array.isArray(res) ? res : []);
    } catch (err) {
      showMsg(err.message, 'error');
    }
  };

  // 2. Class Schedule
  const handleSaveSchedule = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        classId: Number(scheduleForm.classId),
        roomId: Number(scheduleForm.roomId),
        dayOfWeek: Number(scheduleForm.dayOfWeek),
        startTime: scheduleForm.startTime,
        endTime: scheduleForm.endTime,
      };

      if (editingItem) {
        await api.updateClassSchedule(editingItem.id, payload);
        showMsg('Cập nhật lịch học thành công!');
      } else {
        await api.createClassSchedule(payload);
        showMsg('Thêm ca học thành công!');
      }
      setIsScheduleModalOpen(false);
      setEditingItem(null);
      const res = await api.getAllClassSchedules();
      setSchedules(Array.isArray(res) ? res : []);
    } catch (err) {
      showMsg(err.message, 'error');
    }
  };

  const handleDeleteSchedule = (id) => {
    setConfirmModal({
      isOpen: true,
      title: 'Xóa lịch hoạt động lớp',
      message: 'Bạn có chắc chắn muốn xóa ca học này khỏi thời khóa biểu?',
      confirmText: 'Xóa lịch',
      type: 'danger',
      action: async () => {
        try {
          await api.deleteClassSchedule(id);
          showMsg('Đã xóa ca học thành công.');
          const res = await api.getAllClassSchedules();
          setSchedules(Array.isArray(res) ? res : []);
        } catch (err) {
          showMsg(err.message, 'error');
        }
      },
    });
  };

  // 3. Sport Category
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.updateSportCategory(editingItem.id, categoryForm);
        showMsg('Cập nhật bộ môn thành công!');
      } else {
        await api.createSportCategory(categoryForm);
        showMsg('Thêm bộ môn mới thành công!');
      }
      setIsCategoryModalOpen(false);
      setEditingItem(null);
      const res = await api.getSportCategories();
      setCategories(Array.isArray(res) ? res : []);
    } catch (err) {
      showMsg(err.message, 'error');
    }
  };

  const handleDeleteCategory = (id, name) => {
    setConfirmModal({
      isOpen: true,
      title: 'Xóa bộ môn thể thao',
      message: `Xác nhận xóa bộ môn "${name}"? Các lớp học liên kết có thể bị ảnh hưởng.`,
      confirmText: 'Xóa bộ môn',
      type: 'danger',
      action: async () => {
        try {
          await api.deleteSportCategory(id);
          showMsg('Đã xóa bộ môn thành công.');
          const res = await api.getSportCategories();
          setCategories(Array.isArray(res) ? res : []);
        } catch (err) {
          showMsg(err.message, 'error');
        }
      },
    });
  };

  // 4. Room
  const handleSaveRoom = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...roomForm,
        capacity: Number(roomForm.capacity),
      };
      if (editingItem) {
        await api.updateRoom(editingItem.id, payload);
        showMsg('Cập nhật phòng tập thành công!');
      } else {
        await api.createRoom(payload);
        showMsg('Tạo phòng tập mới thành công!');
      }
      setIsRoomModalOpen(false);
      setEditingItem(null);
      const res = await api.getRooms();
      setRooms(Array.isArray(res) ? res : []);
    } catch (err) {
      showMsg(err.message, 'error');
    }
  };

  const handleDeleteRoom = (id, name) => {
    setConfirmModal({
      isOpen: true,
      title: 'Xóa phòng tập',
      message: `Xác nhận xóa phòng "${name}"?`,
      confirmText: 'Xóa phòng',
      type: 'danger',
      action: async () => {
        try {
          await api.deleteRoom(id);
          showMsg('Đã xóa phòng tập thành công.');
          const res = await api.getRooms();
          setRooms(Array.isArray(res) ? res : []);
        } catch (err) {
          showMsg(err.message, 'error');
        }
      },
    });
  };

  // Filtered schedules
  const filteredSchedules = schedules.filter((s) => {
    if (selectedDay && String(s.dayOfWeek) !== String(selectedDay)) return false;
    if (selectedCategoryFilter && s.categoryName !== selectedCategoryFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <span>🏋️‍♂️</span> Lớp học & Thời khóa biểu
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Quản lý lịch mở lớp, huấn luyện viên phụ trách, phòng tập và đăng ký tham gia lớp học
          </p>
        </div>

        {/* Action Buttons for Roles */}
        <div className="flex flex-wrap items-center gap-2">
          {isManager && (
            <>
              <button
                onClick={() => {
                  setEditingItem(null);
                  setClassForm({
                    categoryId: categories[0]?.id || '',
                    coachId: coaches[0]?.id || '',
                    name: '',
                    description: '',
                    level: 'BEGINNER',
                    maxCapacity: 20,
                    requiredTierLevel: 2,
                  });
                  setIsClassModalOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs transition shadow-lg shadow-emerald-500/20 flex items-center gap-1.5"
              >
                <span>➕</span> Tạo lớp học
              </button>

              <button
                onClick={() => {
                  setEditingItem(null);
                  setScheduleForm({
                    classId: classes[0]?.id || '',
                    roomId: rooms[0]?.id || '',
                    dayOfWeek: 1,
                    startTime: '08:00',
                    endTime: '09:30',
                  });
                  setIsScheduleModalOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition shadow-lg shadow-blue-500/20 flex items-center gap-1.5"
              >
                <span>📅</span> Xếp ca học
              </button>
            </>
          )}

          {isReceptionist && (
            <button
              onClick={() => {
                setReceptionistRegForm({
                  memberId: members[0]?.id || '',
                  classId: classes[0]?.id || '',
                  joinWaitlist: false,
                });
                setIsReceptionistRegModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs transition shadow-lg shadow-emerald-500/20 flex items-center gap-1.5"
            >
              Đăng ký lớp hộ Hội viên
            </button>
          )}
        </div>
      </div>



      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 gap-2 overflow-x-auto pb-1 text-sm font-medium">
        <button
          onClick={() => setActiveTab('schedules')}
          className={`px-4 py-2.5 rounded-lg transition whitespace-nowrap ${activeTab === 'schedules'
            ? 'bg-slate-800 text-white font-bold border-b-2 border-emerald-500'
            : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
            }`}
        >
          Thời khóa biểu & Ca học ({schedules.length})
        </button>

        {isManager && (
          <>
            <button
              onClick={() => setActiveTab('classes')}
              className={`px-4 py-2.5 rounded-lg transition whitespace-nowrap ${activeTab === 'classes'
                ? 'bg-slate-800 text-white font-bold border-b-2 border-emerald-500'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
                }`}
            >
              Lớp thể thao ({classes.length})
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-4 py-2.5 rounded-lg transition whitespace-nowrap ${activeTab === 'categories'
                ? 'bg-slate-800 text-white font-bold border-b-2 border-emerald-500'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
                }`}
            >
              Bộ môn ({categories.length})
            </button>
            <button
              onClick={() => setActiveTab('rooms')}
              className={`px-4 py-2.5 rounded-lg transition whitespace-nowrap ${activeTab === 'rooms'
                ? 'bg-slate-800 text-white font-bold border-b-2 border-emerald-500'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
                }`}
            >
              Phòng tập ({rooms.length})
            </button>
          </>
        )}

        {(isMember || isReceptionist) && (
          <button
            onClick={() => setActiveTab('registrations')}
            className={`px-4 py-2.5 rounded-lg transition whitespace-nowrap ${activeTab === 'registrations'
              ? 'bg-slate-800 text-white font-bold border-b-2 border-emerald-500'
              : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
              }`}
          >
            {isMember ? 'Lớp tôi đã đăng ký' : 'Lịch sử đăng ký lớp của Hội viên'}
          </button>
        )}
      </div>

      {/* ===================== TAB 1: SCHEDULES ===================== */}
      {activeTab === 'schedules' && (
        <div className="space-y-4">
          {/* Schedule Filters */}
          <div className="flex flex-wrap items-center gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400 font-semibold">Lọc theo thứ:</span>
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
            >
              <option value="">Tất cả các ngày</option>
              {Object.entries(dayNames).map(([key, name]) => (
                <option key={key} value={key}>
                  {name}
                </option>
              ))}
            </select>

            <span className="text-slate-400 font-semibold ml-2">Lọc bộ môn:</span>
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
            >
              <option value="">Tất cả bộ môn</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Schedule Cards / Table */}
          {loading ? (
            <div className="py-12 text-center text-slate-500">Đang tải lịch học...</div>
          ) : filteredSchedules.length === 0 ? (
            <div className="py-12 text-center bg-slate-900/30 rounded-2xl border border-slate-800/80">
              <p className="text-slate-400">Không có lịch học nào phù hợp với bộ lọc hiện tại.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSchedules.map((s) => (
                <div
                  key={s.id}
                  className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between transition group shadow-md"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {s.dayOfWeekName || dayNames[s.dayOfWeek] || `Thứ ${s.dayOfWeek}`}
                      </span>
                      <span className="text-xs font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded">
                        {s.startTime?.slice(0, 5)} - {s.endTime?.slice(0, 5)}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition">
                        {s.className}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                        <span className="text-indigo-400 font-medium">🏅 {s.categoryName}</span>
                        <span>•</span>
                        <span className="text-amber-400 font-medium">Cấp độ: {s.level}</span>
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 text-xs space-y-1.5 text-slate-300">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">HLV Phụ trách:</span>
                        <span className="font-semibold text-white">👨‍🏫 {s.coachName || 'Chưa phân công'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Phòng học:</span>
                        <span className="font-semibold text-white">
                          📍 {s.roomName} (Tầng {s.floor || '1'})
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

                  {/* Actions */}
                  <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between">
                    {isMember && (
                      <button
                        onClick={() => handleRegisterMyself(s.classId, false)}
                        className="w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5"
                      >
                        <span>📝</span> Đăng ký tham gia lớp
                      </button>
                    )}

                    {isManager && (
                      <div className="flex items-center justify-end gap-2 w-full">
                        <button
                          onClick={() => {
                            setEditingItem(s);
                            setScheduleForm({
                              classId: s.classId,
                              roomId: s.roomId,
                              dayOfWeek: s.dayOfWeek,
                              startTime: s.startTime?.slice(0, 5) || '08:00',
                              endTime: s.endTime?.slice(0, 5) || '09:30',
                            });
                            setIsScheduleModalOpen(true);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDeleteSchedule(s.id)}
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
          )}
        </div>
      )}

      {/* ===================== TAB 2: SPORT CLASSES (MANAGER) ===================== */}
      {activeTab === 'classes' && isManager && (
        <div className="space-y-4">
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
                      <td className="p-3.5 text-slate-200">👨‍🏫 {cls.coachName}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          {cls.level}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono">{cls.maxCapacity} học viên</td>
                      <td className="p-3.5 font-mono">Tier ≥ {cls.requiredTierLevel}</td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => {
                            setEditingItem(cls);
                            setClassForm({
                              categoryId: cls.categoryId,
                              coachId: cls.coachId,
                              name: cls.name,
                              description: cls.description || '',
                              level: cls.level,
                              maxCapacity: cls.maxCapacity,
                              requiredTierLevel: cls.requiredTierLevel,
                            });
                            setIsClassModalOpen(true);
                          }}
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
        </div>
      )}

      {/* ===================== TAB 3: CATEGORIES (MANAGER) ===================== */}
      {activeTab === 'categories' && isManager && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-xs text-slate-400">Danh mục các bộ môn thể thao trong trung tâm</p>
            <button
              onClick={() => {
                setEditingItem(null);
                setCategoryForm({ name: '', description: '' });
                setIsCategoryModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs transition"
            >
              ➕ Thêm Bộ môn mới
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <div key={cat.id} className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-sm">🏅 {cat.name}</h4>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => {
                        setEditingItem(cat);
                        setCategoryForm({ name: cat.name, description: cat.description || '' });
                        setIsCategoryModalOpen(true);
                      }}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(cat.id, cat.name)}
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
      )}

      {/* ===================== TAB 4: ROOMS (MANAGER) ===================== */}
      {activeTab === 'rooms' && isManager && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-xs text-slate-400">Danh sách các phòng chức năng, sân tập của trung tâm</p>
            <button
              onClick={() => {
                setEditingItem(null);
                setRoomForm({
                  roomName: '',
                  floor: '1',
                  capacity: 25,
                  description: '',
                  maintenanceStatus: 'GOOD',
                });
                setIsRoomModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs transition"
            >
              ➕ Thêm Phòng tập mới
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {rooms.map((room) => (
              <div key={room.id} className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-sm">🏢 {room.roomName}</h4>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => {
                        setEditingItem(room);
                        setRoomForm({
                          roomName: room.roomName,
                          floor: room.floor || '1',
                          capacity: room.capacity || 20,
                          description: room.description || '',
                          maintenanceStatus: room.maintenanceStatus || 'GOOD',
                        });
                        setIsRoomModalOpen(true);
                      }}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDeleteRoom(room.id, room.roomName)}
                      className="text-xs text-rose-400 hover:text-rose-300"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
                <div className="text-xs text-slate-300 space-y-1">
                  <div>Vị trí: Tầng {room.floor}</div>
                  <div>Sức chứa: {room.capacity} người</div>
                  <div>Tình trạng: <span className="text-emerald-400 font-semibold">{room.maintenanceStatus}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================== TAB 5: REGISTRATIONS (MEMBER & RECEPTIONIST) ===================== */}
      {activeTab === 'registrations' && (isMember || isReceptionist) && (
        <div className="space-y-4">
          {isReceptionist && (
            <div className="flex items-center gap-3 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-300 font-semibold">Chọn Hội viên để xem:</span>
              <select
                value={receptionistSelectedMember}
                onChange={(e) => handleLoadMemberRegistrations(e.target.value)}
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
                {myRegistrations.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-slate-500">
                      Chưa có lượt đăng ký lớp học nào.
                    </td>
                  </tr>
                ) : (
                  myRegistrations.map((reg) => (
                    <tr key={reg.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3.5 font-mono text-slate-500">#{reg.id}</td>
                      <td className="p-3.5 font-bold text-white">{reg.className}</td>
                      <td className="p-3.5">{reg.memberName}</td>
                      <td className="p-3.5 text-slate-400">
                        {reg.registeredAt ? new Date(reg.registeredAt).toLocaleDateString('vi-VN') : '—'}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold ${reg.status === 'REGISTERED'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : reg.status === 'WAITLIST'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}
                        >
                          {reg.status}
                        </span>
                      </td>
                      <td className="p-3.5">
                        {reg.isPenalized ? (
                          <span className="text-rose-400 font-semibold">⚠️ Bị phạt</span>
                        ) : (
                          <span className="text-slate-500">Không</span>
                        )}
                      </td>
                      <td className="p-3.5 text-right">
                        {reg.status !== 'CANCELED' && reg.status !== 'LATE_CANCELED' && (
                          <button
                            onClick={() => {
                              if (isMember) {
                                handleCancelMyRegistration(reg.id, reg.className);
                              } else if (isReceptionist) {
                                handleReceptionistCancelReg(reg.id);
                              }
                            }}
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
      )}

      {/* ===================== MODAL: CREATE/EDIT SPORT CLASS ===================== */}
      {isClassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">
                {editingItem ? '✏️ Cập nhật Lớp học' : '➕ Tạo Lớp học Thể thao mới'}
              </h3>
              <button onClick={() => setIsClassModalOpen(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveClass} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Tên lớp học *</label>
                <input
                  type="text"
                  required
                  value={classForm.name}
                  onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
                  placeholder="Ví dụ: Yoga Bình Minh Khóa 01"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Bộ môn *</label>
                  <select
                    required
                    value={classForm.categoryId}
                    onChange={(e) => setClassForm({ ...classForm, categoryId: e.target.value })}
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
                    value={classForm.coachId}
                    onChange={(e) => setClassForm({ ...classForm, coachId: e.target.value })}
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
                    value={classForm.level}
                    onChange={(e) => setClassForm({ ...classForm, level: e.target.value })}
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
                    value={classForm.maxCapacity}
                    onChange={(e) => setClassForm({ ...classForm, maxCapacity: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Hạng gói (Tier) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={classForm.requiredTierLevel}
                    onChange={(e) => setClassForm({ ...classForm, requiredTierLevel: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Mô tả chi tiết lớp</label>
                <textarea
                  rows="3"
                  value={classForm.description}
                  onChange={(e) => setClassForm({ ...classForm, description: e.target.value })}
                  placeholder="Mô tả nội dung chương trình giảng dạy..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsClassModalOpen(false)}
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
      )}

      {/* ===================== MODAL: CREATE/EDIT CLASS SCHEDULE ===================== */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">
                {editingItem ? '✏️ Cập nhật Ca học' : '➕ Xếp Lịch / Ca học mới'}
              </h3>
              <button onClick={() => setIsScheduleModalOpen(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSchedule} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Chọn Lớp học *</label>
                <select
                  required
                  value={scheduleForm.classId}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, classId: e.target.value })}
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
                  value={scheduleForm.roomId}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, roomId: e.target.value })}
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
                  value={scheduleForm.dayOfWeek}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, dayOfWeek: e.target.value })}
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
                    value={scheduleForm.startTime}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, startTime: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Giờ kết thúc *</label>
                  <input
                    type="time"
                    required
                    value={scheduleForm.endTime}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, endTime: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
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
      )}

      {/* ===================== MODAL: RECEPTIONIST REGISTER MEMBER ===================== */}
      {isReceptionistRegModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">Đăng ký lớp học cho Hội viên</h3>
              <button onClick={() => setIsReceptionistRegModalOpen(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleReceptionistRegister} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Chọn Hội viên *</label>
                <select
                  required
                  value={receptionistRegForm.memberId}
                  onChange={(e) => setReceptionistRegForm({ ...receptionistRegForm, memberId: e.target.value })}
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
                  value={receptionistRegForm.classId}
                  onChange={(e) => setReceptionistRegForm({ ...receptionistRegForm, classId: e.target.value })}
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
                  checked={receptionistRegForm.joinWaitlist}
                  onChange={(e) =>
                    setReceptionistRegForm({ ...receptionistRegForm, joinWaitlist: e.target.checked })
                  }
                  className="rounded bg-slate-900 border-slate-700 text-emerald-500"
                />
                <label htmlFor="waitlistCheck" className="text-slate-300 cursor-pointer">
                  Chấp nhận vào Danh sách chờ (Waitlist) nếu lớp đầy
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsReceptionistRegModalOpen(false)}
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
      )}

      {/* ===================== MODAL: CREATE/EDIT CATEGORY ===================== */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">
                {editingItem ? '✏️ Cập nhật Bộ môn' : '➕ Thêm Bộ môn mới'}
              </h3>
              <button onClick={() => setIsCategoryModalOpen(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveCategory} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Tên bộ môn *</label>
                <input
                  type="text"
                  required
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  placeholder="Ví dụ: Yoga, Boxing, Futsal"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1">Mô tả</label>
                <textarea
                  rows="2"
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                ></textarea>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
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
      )}

      {/* ===================== MODAL: CREATE/EDIT ROOM ===================== */}
      {isRoomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">
                {editingItem ? '✏️ Cập nhật Phòng tập' : '➕ Thêm Phòng tập mới'}
              </h3>
              <button onClick={() => setIsRoomModalOpen(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveRoom} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Tên phòng *</label>
                <input
                  type="text"
                  required
                  value={roomForm.roomName}
                  onChange={(e) => setRoomForm({ ...roomForm, roomName: e.target.value })}
                  placeholder="Ví dụ: Phòng Yoga A1"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Tầng</label>
                  <input
                    type="text"
                    value={roomForm.floor}
                    onChange={(e) => setRoomForm({ ...roomForm, floor: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Sức chứa</label>
                  <input
                    type="number"
                    min="1"
                    value={roomForm.capacity}
                    onChange={(e) => setRoomForm({ ...roomForm, capacity: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsRoomModalOpen(false)}
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
      )}

      {/* Countdown Confirm Modal */}
      <CountdownConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.action}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        type={confirmModal.type}
      />
    </div>
  );
}
