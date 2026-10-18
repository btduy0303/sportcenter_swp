import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import CountdownConfirmModal from '../../components/common/CountdownConfirmModal';

import ScheduleGrid from '../../components/dashboard/classes/ScheduleGrid';
import SportClassTable from '../../components/dashboard/classes/SportClassTable';
import CategoryManager from '../../components/dashboard/classes/CategoryManager';
import RoomManager from '../../components/dashboard/classes/RoomManager';
import RegistrationHistoryTable from '../../components/dashboard/classes/RegistrationHistoryTable';

import ClassFormModal from '../../components/dashboard/classes/ClassFormModal';
import ScheduleFormModal from '../../components/dashboard/classes/ScheduleFormModal';
import CategoryFormModal from '../../components/dashboard/classes/CategoryFormModal';
import RoomFormModal from '../../components/dashboard/classes/RoomFormModal';
import ReceptionistRegisterModal from '../../components/dashboard/classes/ReceptionistRegisterModal';

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
      const [catsRes, roomsRes] = await Promise.all([
        api.getSportCategories().catch(() => []),
        api.getRooms().catch(() => []),
      ]);
      setCategories(Array.isArray(catsRes) ? catsRes : []);
      setRooms(Array.isArray(roomsRes) ? roomsRes : []);

      if (isManager) {
        const [clsRes, accsRes] = await Promise.all([
          api.getSportClasses().catch(() => []),
          api.getAllAccounts().catch(() => []),
        ]);
        setClasses(Array.isArray(clsRes) ? clsRes : []);
        const coachList = Array.isArray(accsRes) ? accsRes.filter((a) => a.role === 'COACH') : [];
        setCoaches(coachList);
      }

      if (isCoach) {
        const myScheds = await api.getCoachMySchedules().catch(() => []);
        setSchedules(Array.isArray(myScheds) ? myScheds : []);
      } else {
        const allScheds = await api.getAllClassSchedules().catch(() => []);
        setSchedules(Array.isArray(allScheds) ? allScheds : []);
      }

      if (isMember) {
        const myRegs = await api.getMyClassRegistrations().catch(() => []);
        setMyRegistrations(Array.isArray(myRegs) ? myRegs : []);
      }

      if (user?.role === 'RECEPTIONIST') {
        const mems = await api.searchReceptionistMembers('').catch(() => []);
        setMembers(Array.isArray(mems) ? mems : []);
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
      if ((err.message && err.message.toLowerCase().includes('đầy')) || err.message?.toLowerCase().includes('capacity')) {
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
      await api.registerMemberClassByReceptionist(
        {
          userId: Number(receptionistRegForm.memberId),
          classId: Number(receptionistRegForm.classId),
        },
        receptionistRegForm.joinWaitlist
      );
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
            await api.registerMemberClassByReceptionist(
              {
                userId: Number(receptionistRegForm.memberId),
                classId: Number(receptionistRegForm.classId),
              },
              true
            );
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
        await api.updateSportClass(editingItem.id, { ...payload, status: editingItem.status || 'ACTIVE' });
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
            Lớp học & Thời khóa biểu
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
                type="button"
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
                Tạo lớp học
              </button>

              <button
                type="button"
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
                Xếp ca học
              </button>
            </>
          )}

          {isReceptionist && (
            <button
              type="button"
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
          type="button"
          onClick={() => setActiveTab('schedules')}
          className={`px-4 py-2.5 rounded-lg transition whitespace-nowrap ${
            activeTab === 'schedules'
              ? 'bg-slate-800 text-white font-bold border-b-2 border-emerald-500'
              : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
          }`}
        >
          Thời khóa biểu & Ca học ({schedules.length})
        </button>

        {isManager && (
          <>
            <button
              type="button"
              onClick={() => setActiveTab('classes')}
              className={`px-4 py-2.5 rounded-lg transition whitespace-nowrap ${
                activeTab === 'classes'
                  ? 'bg-slate-800 text-white font-bold border-b-2 border-emerald-500'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
              }`}
            >
              Lớp thể thao ({classes.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('categories')}
              className={`px-4 py-2.5 rounded-lg transition whitespace-nowrap ${
                activeTab === 'categories'
                  ? 'bg-slate-800 text-white font-bold border-b-2 border-emerald-500'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
              }`}
            >
              Bộ môn ({categories.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('rooms')}
              className={`px-4 py-2.5 rounded-lg transition whitespace-nowrap ${
                activeTab === 'rooms'
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
            type="button"
            onClick={() => setActiveTab('registrations')}
            className={`px-4 py-2.5 rounded-lg transition whitespace-nowrap ${
              activeTab === 'registrations'
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

            {(selectedDay || selectedCategoryFilter) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedDay('');
                  setSelectedCategoryFilter('');
                }}
                className="text-emerald-400 hover:underline font-semibold ml-auto"
              >
                Đặt lại bộ lọc
              </button>
            )}
          </div>

          <ScheduleGrid
            schedules={filteredSchedules}
            isManager={isManager}
            isMember={isMember}
            myRegistrations={myRegistrations}
            onRegisterMyself={handleRegisterMyself}
            onEditSchedule={(s) => {
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
            onDeleteSchedule={handleDeleteSchedule}
          />
        </div>
      )}

      {/* ===================== TAB 2: SPORT CLASSES (MANAGER) ===================== */}
      {activeTab === 'classes' && isManager && (
        <SportClassTable
          classes={classes}
          onEditClass={(cls) => {
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
        />
      )}

      {/* ===================== TAB 3: CATEGORIES (MANAGER) ===================== */}
      {activeTab === 'categories' && isManager && (
        <CategoryManager
          categories={categories}
          onOpenCreate={() => {
            setEditingItem(null);
            setCategoryForm({ name: '', description: '' });
            setIsCategoryModalOpen(true);
          }}
          onEditCategory={(cat) => {
            setEditingItem(cat);
            setCategoryForm({ name: cat.name, description: cat.description || '' });
            setIsCategoryModalOpen(true);
          }}
          onDeleteCategory={handleDeleteCategory}
        />
      )}

      {/* ===================== TAB 4: ROOMS (MANAGER) ===================== */}
      {activeTab === 'rooms' && isManager && (
        <RoomManager
          rooms={rooms}
          onOpenCreate={() => {
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
          onEditRoom={(room) => {
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
          onDeleteRoom={handleDeleteRoom}
        />
      )}

      {/* ===================== TAB 5: REGISTRATIONS (MEMBER & RECEPTIONIST) ===================== */}
      {activeTab === 'registrations' && (isMember || isReceptionist) && (
        <RegistrationHistoryTable
          registrations={myRegistrations}
          isReceptionist={isReceptionist}
          isMember={isMember}
          members={members}
          selectedMemberId={receptionistSelectedMember}
          onMemberSelect={handleLoadMemberRegistrations}
          onCancelRegistration={(reg) => {
            if (isMember) {
              handleCancelMyRegistration(reg.id, reg.className);
            } else if (isReceptionist) {
              handleReceptionistCancelReg(reg.id);
            }
          }}
        />
      )}

      {/* Modals */}
      <ClassFormModal
        isOpen={isClassModalOpen}
        isEditing={Boolean(editingItem)}
        form={classForm}
        categories={categories}
        coaches={coaches}
        onChange={setClassForm}
        onClose={() => setIsClassModalOpen(false)}
        onSubmit={handleSaveClass}
      />

      <ScheduleFormModal
        isOpen={isScheduleModalOpen}
        isEditing={Boolean(editingItem)}
        form={scheduleForm}
        classes={classes}
        rooms={rooms}
        dayNames={dayNames}
        onChange={setScheduleForm}
        onClose={() => setIsScheduleModalOpen(false)}
        onSubmit={handleSaveSchedule}
      />

      <CategoryFormModal
        isOpen={isCategoryModalOpen}
        isEditing={Boolean(editingItem)}
        form={categoryForm}
        onChange={setCategoryForm}
        onClose={() => setIsCategoryModalOpen(false)}
        onSubmit={handleSaveCategory}
      />

      <RoomFormModal
        isOpen={isRoomModalOpen}
        isEditing={Boolean(editingItem)}
        form={roomForm}
        onChange={setRoomForm}
        onClose={() => setIsRoomModalOpen(false)}
        onSubmit={handleSaveRoom}
      />

      <ReceptionistRegisterModal
        isOpen={isReceptionistRegModalOpen}
        form={receptionistRegForm}
        members={members}
        classes={classes}
        onChange={setReceptionistRegForm}
        onClose={() => setIsReceptionistRegModalOpen(false)}
        onSubmit={handleReceptionistRegister}
      />

      {/* Countdown Confirm Modal */}
      <CountdownConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={() => {
          setConfirmModal({ ...confirmModal, isOpen: false });
          if (confirmModal.action) confirmModal.action();
        }}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        type={confirmModal.type}
      />
    </div>
  );
}
