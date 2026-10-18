import React, { useState, useEffect } from 'react';
import PaymentTable from '../../components/dashboard/payments/PaymentTable';
import InvoiceModal from '../../components/dashboard/payments/InvoiceModal';

import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function PaymentsPage() {
  const { user, isMember, isReceptionist, isManager } = useAuth();
  const [payments, setPayments] = useState([]);
  const [members, setMembers] = useState([]);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    initData();
  }, [selectedMemberId]);

  const initData = async () => {
    setLoading(true);
    setError('');
    try {
      if (isMember) {
        const data = await api.getMyPayments();
        setPayments(Array.isArray(data) ? data : []);
      } else {
        // Receptionist / Manager: search members to pick
        let memberList = [];
        if (members.length === 0) {
          memberList = isManager ? await api.getAllAccounts() : await api.searchReceptionistMembers('');
          const onlyMembers = Array.isArray(memberList) ? memberList.filter((m) => m.role === 'MEMBER') : [];
          setMembers(onlyMembers);
          if (onlyMembers.length > 0 && !selectedMemberId) {
            setSelectedMemberId(onlyMembers[0].id);
          }
        }

        const targetId = selectedMemberId || members[0]?.id;
        if (targetId) {
          const data = await api.getMemberPaymentsReceptionist(targetId);
          setPayments(Array.isArray(data) ? data : []);
        } else {
          setPayments([]);
        }
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Không thể tải dữ liệu thanh toán');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectInvoice = async (payment) => {
    try {
      const invoiceData = isMember
        ? await api.getMyInvoice(payment.id)
        : await api.getInvoiceReceptionist(payment.id);
      setSelectedInvoice(invoiceData);
    } catch (err) {
      alert(err.message || 'Không thể tải chi tiết hóa đơn');
    }
  };

  const filteredPayments = payments.filter((p) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      p.invoiceNumber?.toLowerCase().includes(term) ||
      p.transactionCode?.toLowerCase().includes(term) ||
      p.payerName?.toLowerCase().includes(term)
    );
  });

  const totalCollected = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white">Lịch Sử Thu Phí & Hóa Đơn Điện Tử</h2>
          <p className="text-xs text-slate-400">Tra cứu các giao dịch thanh toán gói tập và xuất hóa đơn dịch vụ</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-2 text-right">
          <div className="text-[11px] text-slate-400 font-semibold">Tổng doanh thu đã thu:</div>
          <div className="text-lg font-black text-emerald-400">
            {totalCollected.toLocaleString('vi-VN')} ₫
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl text-xs bg-rose-950/50 border border-rose-800 text-rose-300">
          {error}
        </div>
      )}

      <div className="bg-[#0f172a] rounded-2xl p-4 border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo mã hóa đơn, mã GD..."
            className="w-full sm:w-72 bg-slate-900 border border-slate-700/80 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-emerald-500"
          />

          {!isMember && members.length > 0 && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-slate-400 whitespace-nowrap">Hội viên:</span>
              <select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                className="w-full sm:w-64 bg-slate-900 border border-slate-700/80 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.fullName} ({m.phone}) - #{m.id}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <span className="text-xs text-slate-400 self-end sm:self-auto">
          {filteredPayments.length} giao dịch
        </span>
      </div>

      <PaymentTable
        payments={filteredPayments}
        onSelectInvoice={handleSelectInvoice}
      />

      <InvoiceModal
        invoice={selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
      />
    </div>
  );
}
