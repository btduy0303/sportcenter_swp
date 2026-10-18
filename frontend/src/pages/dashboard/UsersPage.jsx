import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import UserFilterBar from '../../components/dashboard/users/UserFilterBar';
import UserTable from '../../components/dashboard/users/UserTable';
import UserCreateModal from '../../components/dashboard/users/UserCreateModal';
import UserEditModal from '../../components/dashboard/users/UserEditModal';
import CountdownConfirmModal from '../../components/common/CountdownConfirmModal';

export default function UsersPage() {
  const { isManager, isReceptionist } = useAuth();
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // 5-second countdown confirmation state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Xác nhận',
    type: 'danger',
    action: null,
  });

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    roleCode: 'MEMBER',
    gender: 'MALE',
    dateOfBirth: '',
  });

  useEffect(() => {
    loadUsers();
  }, [search, roleFilter]);

  const loadUsers = async () => {
    try {
      let data = [];
      if (isManager) {
        if (search) {
          data = await api.searchAccounts(search);
        } else {
          data = await api.getAllAccounts();
        }
      } else {
        data = await api.searchReceptionistMembers(search);
      }
      
      if (Array.isArray(data) && roleFilter) {
        data = data.filter((u) => u.role === roleFilter);
      }
      // Normalize isActive / active: Spring Boot Jackson serializes boolean isActive as either 'active' or 'isActive'
      const normalizedUsers = (Array.isArray(data) ? data : []).map((u) => {
        const isActiveStatus = u.isActive !== undefined ? Boolean(u.isActive) : Boolean(u.active);
        return {
          ...u,
          isActive: isActiveStatus,
          active: isActiveStatus,
        };
      });
      setUsers(normalizedUsers);
    } catch (e) {
      toast.error(e.message || 'Không thể tải danh sách người dùng');
    }
  };

  const handleRequestToggleStatus = (user) => {
    const nextStatus = !user.isActive;
    setConfirmModal({
      isOpen: true,
      title: nextStatus ? 'Xác nhận kích hoạt tài khoản' : 'Xác nhận khóa tài khoản',
      message: `Bạn đang yêu cầu ${nextStatus ? 'kích hoạt' : 'khóa'} tài khoản "${user.fullName}".`,
      confirmText: nextStatus ? 'Kích hoạt ngay' : 'Khóa tài khoản',
      type: nextStatus ? 'primary' : 'danger',
      action: async () => {
        try {
          if (nextStatus) {
            await api.activateAccount(user.id);
          } else {
            await api.deactivateAccount(user.id);
          }
          toast.success(`Đã ${nextStatus ? 'kích hoạt' : 'khóa'} tài khoản ${user.fullName} thành công!`);
          loadUsers();
        } catch (err) {
          toast.error(err.message || 'Lỗi khi cập nhật trạng thái');
        }
      },
    });
  };

  const handleRequestDeleteUser = (user) => {
    setConfirmModal({
      isOpen: true,
      title: 'Xác nhận vô hiệu hóa tài khoản',
      message: `Hành động này sẽ vô hiệu hóa tài khoản "${user.fullName}" (ID: #${user.id}). Người dùng sẽ không thể đăng nhập vào hệ thống.`,
      confirmText: 'Vô hiệu hóa tài khoản',
      type: 'danger',
      action: async () => {
        try {
          await api.deactivateAccount(user.id);
          toast.success(`Đã vô hiệu hóa tài khoản ${user.fullName} thành công!`);
          loadUsers();
        } catch (err) {
          toast.error(err.message || 'Lỗi khi vô hiệu hóa người dùng');
        }
      },
    });
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      if (isManager && formData.roleCode !== 'MEMBER') {
        await api.createEmployee({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          roleCode: formData.roleCode,
        });
      } else {
        await api.createMemberAtCounter({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        });
      }
      toast.success('Tạo tài khoản mới thành công!');
      setIsCreateOpen(false);
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        roleCode: 'MEMBER',
        gender: 'MALE',
        dateOfBirth: '',
      });
      loadUsers();
    } catch (err) {
      toast.error(err.message || 'Tạo tài khoản thất bại');
    }
  };

  const handleRequestUpdateUser = (e) => {
    e.preventDefault();
    setConfirmModal({
      isOpen: true,
      title: 'Xác nhận lưu thay đổi thông tin',
      message: `Cập nhật thông tin cho "${selectedUser.fullName}". Vui lòng xác nhận lưu vào hệ thống.`,
      confirmText: 'Lưu thay đổi',
      type: 'primary',
      action: async () => {
        try {
          await api.updateAccountByManager(selectedUser.id, {
            fullName: selectedUser.fullName,
            phone: selectedUser.phone,
            gender: selectedUser.gender,
            dateOfBirth: selectedUser.dateOfBirth,
          });
          toast.success('Cập nhật thông tin thành công!');
          setIsEditOpen(false);
          loadUsers();
        } catch (err) {
          toast.error(err.message || 'Cập nhật thất bại');
        }
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white">Quản lý Người dùng & Hội viên</h2>
          <p className="text-xs text-slate-400">Danh sách nhân sự, huấn luyện viên và hồ sơ hội viên</p>
        </div>

        {(isManager || isReceptionist) && (
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs shadow-lg shadow-emerald-500/20"
          >
            {isManager ? 'Thêm người dùng mới' : 'Đăng ký Hội viên tại quầy'}
          </button>
        )}
      </div>



      <UserFilterBar
        search={search}
        onSearchChange={setSearch}
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
      />

      <UserTable
        users={users}
        isManager={isManager}
        onEdit={(u) => {
          setSelectedUser({ ...u });
          setIsEditOpen(true);
        }}
        onToggleStatus={handleRequestToggleStatus}
        onDelete={handleRequestDeleteUser}
      />

      <UserCreateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        isManager={isManager}
        formData={formData}
        onChange={setFormData}
        onSubmit={handleCreateUser}
      />

      <UserEditModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        user={selectedUser}
        isManager={isManager}
        onChange={setSelectedUser}
        onSubmit={handleRequestUpdateUser}
      />

      <CountdownConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        type={confirmModal.type}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={() => {
          setConfirmModal({ ...confirmModal, isOpen: false });
          if (confirmModal.action) confirmModal.action();
        }}
      />
    </div>
  );
}
