import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import CheckInPanel from '../../components/dashboard/attendance/CheckInPanel';
import AttendanceHistoryTable from '../../components/dashboard/attendance/AttendanceHistoryTable';

export default function AttendancePage() {
  const [attendances, setAttendances] = useState([]);
  const [members, setMembers] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const toast = useToast();
  const setMessage = ({ type, text }) => {
    if (!text) return;
    if (type === 'error') toast.error(text);
    else if (type === 'warning') toast.warning(text);
    else toast.success(text);
  };

  const [selectedUserId, setSelectedUserId] = useState('');
  const [checkInNotes, setCheckInNotes] = useState('Cổng FaceID số 1 - Khu Thể Thao');
  const [selectedUserObj, setSelectedUserObj] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      let usersData = [];
      try {
        usersData = await api.searchReceptionistMembers('');
      } catch (e) {
        console.error('Failed to load members for attendance', e);
      }
      
      const atts = await api.getRecentAttendances();
      setAttendances(Array.isArray(atts) ? atts : []);
      
      const memberList = Array.isArray(usersData) ? usersData : [];
      setMembers(memberList);

      if (memberList.length > 0) {
        const currentSelectedId = selectedUserId || memberList[0].id;
        const currentMember = memberList.find((m) => m.id === Number(currentSelectedId)) || memberList[0];
        setSelectedUserId(currentMember.id);
        setSelectedUserObj(currentMember);
        loadMemberSubscriptions(currentMember.id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadMemberSubscriptions = async (memberId) => {
    try {
      const subs = await api.getMemberSubscriptionsReceptionist(memberId);
      setSubscriptions(Array.isArray(subs) ? subs : []);
    } catch {
      setSubscriptions([]);
    }
  };

  const handleUserSelect = (userId) => {
    setSelectedUserId(userId);
    const found = members.find((m) => m.id === Number(userId));
    setSelectedUserObj(found || null);
    if (found) {
      loadMemberSubscriptions(found.id);
    }
  };

  const memberActiveSubs = subscriptions.filter((s) => s.status === 'ACTIVE');
  const activeInFacility = attendances.filter((a) => !a.checkOutTime);
  const isAlreadyInFacility = activeInFacility.some((a) => a.userId === Number(selectedUserId));

  const handleCheckIn = async (e) => {
    e.preventDefault();
    if (!selectedUserId) return;

    if (isAlreadyInFacility) {
      setMessage({
        type: 'warning',
        text: `Hội viên "${selectedUserObj?.fullName || 'này'}" hiện ĐANG CÓ MẶT trong cơ sở! Cần Check-out trước khi có thể Check-in lại.`,
      });
      return;
    }

    if (memberActiveSubs.length === 0) {
      setMessage({
        type: 'error',
        text: `Hội viên "${selectedUserObj?.fullName || 'này'}" chưa có gói tập hợp lệ (ACTIVE). Không thể mở cổng check-in!`,
      });
      return;
    }
    try {
      const memberName = selectedUserObj?.fullName || 'Hội viên';
      await api.checkIn({
        userId: Number(selectedUserId),
        userFullName: memberName,
        notes: checkInNotes,
        recordedBy: 'Lễ tân tại quầy',
      });

      setMessage({
        type: 'success',
        text: `Check-in thành công cho ${memberName}! Đã mở cổng kiểm soát.`,
      });
      loadData();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Lỗi khi check-in' });
    }
  };

  const handleCheckOut = async (attId, memberName) => {
    try {
      await api.checkOut(attId);
      setMessage({
        type: 'success',
        text: `Đã check-out thành công cho ${memberName}!`,
      });
      loadData();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Lỗi khi check-out' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white">Điểm Danh & Kiểm Soát Ra Vào</h2>
          <p className="text-xs text-slate-400">Ghi nhận lượt check-in/check-out và kiểm tra hạn thẻ hội viên</p>
        </div>

        <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl px-4 py-2">
          <div className="text-[11px] text-emerald-300 font-semibold">Đang trong cơ sở:</div>
          <div className="text-lg font-black text-white">{activeInFacility.length} hội viên</div>
        </div>
      </div>

      <CheckInPanel
        members={members}
        selectedUserId={selectedUserId}
        onUserSelect={handleUserSelect}
        selectedUserObj={selectedUserObj}
        memberActiveSubs={memberActiveSubs}
        isAlreadyInFacility={isAlreadyInFacility}
        checkInNotes={checkInNotes}
        onNotesChange={setCheckInNotes}
        onCheckIn={handleCheckIn}
        activeInFacility={activeInFacility}
        onCheckOut={handleCheckOut}
      />

      <AttendanceHistoryTable attendances={attendances} />
    </div>
  );
}
