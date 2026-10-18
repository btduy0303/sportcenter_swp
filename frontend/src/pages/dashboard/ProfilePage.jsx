import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import ActiveMembershipCard from '../../components/dashboard/profile/ActiveMembershipCard';
import ProfileForm from '../../components/dashboard/profile/ProfileForm';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [activeSubs, setActiveSubs] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    gender: 'MALE',
    dateOfBirth: '',
    avatarUrl: '',
    heightCm: '',
    weightKg: '',
    fitnessGoal: '',
    yearsExperience: '',
    certifications: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const userProfile = await api.getMyProfile();
      setProfile(userProfile);

      if (userProfile.role === 'MEMBER') {
        try {
          const sub = await api.getMyActiveSubscription();
          setActiveSubs(sub ? [sub] : []);
        } catch {
          setActiveSubs([]);
        }
      } else {
        setActiveSubs([]);
      }

      setFormData({
        fullName: userProfile.fullName || '',
        phone: userProfile.phone || '',
        gender: userProfile.gender || 'MALE',
        dateOfBirth: userProfile.dateOfBirth || '',
        avatarUrl: userProfile.avatarUrl || '',
        heightCm: userProfile.memberProfile?.heightCm || '',
        weightKg: userProfile.memberProfile?.weightKg || '',
        fitnessGoal: userProfile.memberProfile?.fitnessGoal || '',
        yearsExperience: userProfile.coachProfile?.yearsExperience || '',
        certifications: userProfile.coachProfile?.certifications || '',
      });
    } catch (e) {
      console.error(e);
      setMessage({ type: 'error', text: e.message || 'Không thể tải hồ sơ cá nhân' });
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // 1. Update basic profile info
      await api.updateMyProfile({
        fullName: formData.fullName,
        phone: formData.phone,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
      });

      // 2. If member, update member profile
      if (profile?.role === 'MEMBER' && (formData.heightCm || formData.weightKg || formData.fitnessGoal)) {
        await api.updateMemberProfile({
          heightCm: formData.heightCm ? Number(formData.heightCm) : null,
          weightKg: formData.weightKg ? Number(formData.weightKg) : null,
          fitnessGoal: formData.fitnessGoal,
        });
      }

      // 3. If coach, update coach profile
      if (profile?.role === 'COACH' && (formData.yearsExperience || formData.certifications)) {
        await api.updateCoachProfile({
          yearsExperience: formData.yearsExperience ? Number(formData.yearsExperience) : 0,
          certifications: formData.certifications,
        });
      }

      setMessage({ type: 'success', text: 'Cập nhật hồ sơ cá nhân thành công!' });
      loadProfile();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Lỗi khi cập nhật hồ sơ' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="pb-2 border-b border-slate-800">
        <h2 className="text-xl sm:text-2xl font-black text-white">Hồ Sơ Cá Nhân & Thẻ Thành Viên</h2>
        <p className="text-xs text-slate-400">Quản lý thông tin cá nhân, chỉ số thể chất và gói tập của bạn</p>
      </div>

      {message.text && (
        <div
          className={`p-3 rounded-xl text-xs flex items-center justify-between ${
            message.type === 'success'
              ? 'bg-emerald-950/50 border border-emerald-800 text-emerald-300'
              : 'bg-rose-950/50 border border-rose-800 text-rose-300'
          }`}
        >
          <span>{message.text}</span>
          <button type="button" onClick={() => setMessage({ type: '', text: '' })}>✕</button>
        </div>
      )}

      <ActiveMembershipCard activeSubs={activeSubs} />

      <ProfileForm
        profile={profile}
        formData={formData}
        onChange={setFormData}
        onSubmit={handleSave}
        saving={saving}
      />
    </div>
  );
}
