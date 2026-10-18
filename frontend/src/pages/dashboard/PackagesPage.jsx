import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import PackageCard from '../../components/dashboard/packages/PackageCard';
import PackageFormModal from '../../components/dashboard/packages/PackageFormModal';
import CountdownConfirmModal from '../../components/common/CountdownConfirmModal';

export default function PackagesPage() {
  const { isManager, isMember, isReceptionist } = useAuth();
  const navigate = useNavigate();

  const [packages, setPackages] = useState([]);
  const toast = useToast();
  const setMessage = ({ type, text }) => {
    if (!text) return;
    if (type === 'error') toast.error(text);
    else toast.success(text);
  };
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Xác nhận',
    type: 'danger',
    onConfirm: null,
  });

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    durationMonths: 1,
    price: 500000,
    maxClassesPerWeek: 3,
    isActive: true,
  });

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      const data = isManager
        ? await api.getAllPackagesManager()
        : await api.getActivePackages();
      setPackages(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setMessage({ type: 'error', text: e.message || 'Lỗi khi tải danh sách gói tập' });
    }
  };

  const handleOpenCreate = () => {
    setEditingPackage(null);
    setFormData({
      code: `PKG-${Date.now().toString().slice(-4)}`,
      name: '',
      description: '',
      durationMonths: 1,
      price: 500000,
      tierLevel: 1,
      maxClassesPerWeek: 3,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (pkg) => {
    setEditingPackage(pkg);
    setFormData({
      code: pkg.code,
      name: pkg.name,
      description: pkg.description || '',
      durationMonths: pkg.durationMonths || 1,
      price: pkg.price || 0,
      tierLevel: pkg.tierLevel || 1,
      maxClassesPerWeek: pkg.maxClassesPerWeek || 3,
      isActive: pkg.isActive ?? true,
    });
    setIsModalOpen(true);
  };

  const handleDeletePackage = (pkg) => {
    const nextStatus = !pkg.isActive;
    setConfirmModal({
      isOpen: true,
      title: nextStatus ? 'Xác nhận kích hoạt gói tập' : 'Xác nhận ẩn gói tập',
      message: `Bạn có chắc chắn muốn ${nextStatus ? 'kích hoạt' : 'ẩn'} gói tập "${pkg.name}"? ${
        nextStatus ? 'Hội viên sẽ có thể nhìn thấy và đăng ký gói này.' : 'Gói này sẽ bị ẩn khỏi danh sách đăng ký của hội viên.'
      }`,
      confirmText: nextStatus ? 'Kích hoạt ngay' : 'Ẩn gói tập',
      type: nextStatus ? 'primary' : 'danger',
      onConfirm: async () => {
        try {
          await api.updatePackageStatus(pkg.id, { isActive: nextStatus });
          setMessage({ type: 'success', text: `Đã ${nextStatus ? 'kích hoạt' : 'ẩn'} gói tập "${pkg.name}" thành công!` });
          loadPackages();
        } catch (err) {
          setMessage({ type: 'error', text: err.message || 'Lỗi khi cập nhật trạng thái gói' });
        } finally {
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPackage) {
        // Cập nhật thông tin gói (không gửi isActive vì backend bắt buộc đổi status qua API riêng)
        await api.updatePackage(editingPackage.id, {
          name: formData.name,
          description: formData.description,
          durationMonths: Number(formData.durationMonths),
          price: Number(formData.price),
          tierLevel: Number(formData.tierLevel || 1),
          maxClassesPerWeek: Number(formData.maxClassesPerWeek),
        });

        // Nếu trạng thái isActive thay đổi so với ban đầu thì gọi api updatePackageStatus riêng
        if (formData.isActive !== editingPackage.isActive) {
          await api.updatePackageStatus(editingPackage.id, {
            isActive: Boolean(formData.isActive),
          });
        }

        setMessage({ type: 'success', text: 'Cập nhật gói tập thành công!' });
      } else {
        await api.createPackage({
          code: formData.code,
          name: formData.name,
          description: formData.description,
          durationMonths: Number(formData.durationMonths),
          price: Number(formData.price),
          tierLevel: Number(formData.tierLevel || 1),
          maxClassesPerWeek: Number(formData.maxClassesPerWeek),
        });
        setMessage({ type: 'success', text: 'Tạo gói tập mới thành công!' });
      }
      setIsModalOpen(false);
      loadPackages();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Thao tác thất bại' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white">Quản lý Gói Tập & Thẻ Thành Viên</h2>
          <p className="text-xs text-slate-400">Danh mục các gói tập Gym, Bể bơi, Sân thể thao và quyền lợi</p>
        </div>

        {isManager && (
          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs shadow-lg shadow-emerald-500/20"
          >
            Thêm gói tập mới
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {packages.map((pkg) => (
          <PackageCard
            key={pkg.id}
            pkg={pkg}
            isManager={isManager}
            isMember={isMember}
            isReceptionist={isReceptionist}
            onSelect={(p) => navigate(`/app/subscriptions?packageId=${p.id}`)}
            onEdit={handleOpenEdit}
            onDelete={handleDeletePackage}
          />
        ))}
      </div>

      <PackageFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isEditing={Boolean(editingPackage)}
        formData={formData}
        onChange={setFormData}
        onSubmit={handleSubmit}
      />

      <CountdownConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        type={confirmModal.type}
        onConfirm={confirmModal.onConfirm}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
