const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const getHeaders = () => {
    const token = localStorage.getItem('sportcenter_token');
    return {
        'Content-Type': 'application/json',
        ...(token ? {Authorization: `Bearer ${token}`} : {}),
    };
};

async function request(endpoint, options = {}) {
    let res;
    try {
        res = await fetch(`${BASE_URL}${endpoint}`, {
            ...options,
            headers: {...getHeaders(), ...(options.headers || {})},
        });
    } catch (networkErr) {
        throw new Error(
            `Không thể kết nối đến máy chủ Backend (${BASE_URL}). Vui lòng kiểm tra dịch vụ Backend và Database.`
        );
    }

    let data;
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        data = await res.json();
    } else {
        data = await res.text();
    }

    if (!res.ok) {
        const errorMsg =
            (typeof data === 'object' && (data.message || data.error || (data.errors && Object.values(data.errors).join(', ')))) ||
            (typeof data === 'string' && data) ||
            `Yêu cầu thất bại với mã lỗi HTTP ${res.status}`;
        throw new Error(errorMsg);
    }

    return data;
}

export const api = {
    // ===================== AUTH =====================
    login: async (email, password) => {
        return request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({email, password}),
        });
    },

    register: async (data) => {
        return request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    // ===================== USERS & PROFILE =====================
    getMyProfile: async () => {
        return request('/users/me', {method: 'GET'});
    },

    updateMyProfile: async (data) => {
        return request('/users/me', {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    },

    updateMemberProfile: async (data) => {
        return request('/users/me/member-profile', {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    },

    updateCoachProfile: async (data) => {
        return request('/users/me/coach-profile', {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    },

    // ===================== MANAGER - ACCOUNT MANAGEMENT =====================
    getAllAccounts: async () => {
        return request('/manager/accounts', {method: 'GET'});
    },

    searchAccounts: async (userName = '') => {
        const q = new URLSearchParams();
        if (userName) q.append('userName', userName);
        const queryString = q.toString() ? `?${q.toString()}` : '';
        return request(`/manager/accounts/search${queryString}`, {method: 'GET'});
    },

    getAccountById: async (id) => {
        return request(`/manager/accounts/${id}`, {method: 'GET'});
    },

    createEmployee: async (data) => {
        return request('/manager/accounts', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    updateAccountByManager: async (id, data) => {
        return request(`/manager/accounts/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    },

    activateAccount: async (id) => {
        return request(`/manager/accounts/${id}/active`, {
            method: 'PATCH',
        });
    },

    deactivateAccount: async (id) => {
        return request(`/manager/accounts/${id}/deactivate`, {
            method: 'PATCH',
        });
    },

    updateStaffProfile: async (id, data) => {
        return request(`/manager/accounts/${id}/staff-profile`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    },

    getAllPermissions: async () => {
        return request('/manager/permissions', {method: 'GET'});
    },

    searchReceptionistMembers: async (name = '') => {

        const q = new URLSearchParams();

        q.append('name', name ?? '');

        return request(
            `/receptionist/members?${q.toString()}`,
            {method: 'GET'}
        );
    },

    getReceptionistMemberById: async (id) => {
        return request(`/receptionist/members/${id}`, {method: 'GET'});
    },

    createMemberAtCounter: async (data) => {
        return request('/receptionist/members', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    // ===================== PACKAGES =====================
    // Public / Member / Receptionist
    getActivePackages: async () => {
        return request('/packages', {method: 'GET'});
    },

    getPackageById: async (id) => {
        return request(`/packages/${id}`, {method: 'GET'});
    },

    // Manager Package CRUD
    getAllPackagesManager: async () => {
        return request('/manager/packages', {method: 'GET'});
    },

    createPackage: async (data) => {
        return request('/manager/packages', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    updatePackage: async (id, data) => {

        const {
            name,
            description,
            durationMonths,
            price,
            maxClassesPerWeek,
            tierLevel
        } = data;

        return request(`/manager/packages/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({
                name,
                description,
                durationMonths,
                price,
                maxClassesPerWeek,
                tierLevel
            }),
        });
    },

    updatePackageStatus: async (id, data) => {
        return request(`/manager/packages/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    },

    // ===================== SUBSCRIPTIONS =====================
    // Member subscriptions
    getMySubscriptions: async () => {
        return request('/member/subscriptions/me', {method: 'GET'});
    },

    getMyActiveSubscription: async () => {
        return request('/member/subscriptions/me/status', {method: 'GET'});
    },

    subscribeMember: async (packageId) => {
        return request('/member/subscriptions', {
            method: 'POST',
            body: JSON.stringify({packageId}),
        });
    },

    renewMySubscription: async (packageId) => {
        return request('/member/subscriptions/renew', {
            method: 'POST',
            body: JSON.stringify({packageId}),
        });
    },

    upgradeMySubscription: async (packageId) => {
        return request('/member/subscriptions/upgrade', {
            method: 'POST',
            body: JSON.stringify({packageId}),
        });
    },

    cancelMyPendingSubscription: async (id) => {
        return request(`/member/subscriptions/${id}/cancel`, {
            method: 'PATCH',
        });
    },

    startOnlinePayment: async (id) => {
        return request(`/member/subscriptions/${id}/online-payment`, {
            method: 'POST',
        });
    },

    checkOnlinePayment: async (id) => {
        return request(`/member/subscriptions/${id}/online-payment/check`, {
            method: 'POST',
        });
    },

    // Receptionist subscriptions for member
    getMemberSubscriptionsReceptionist: async (memberId) => {
        return request(`/receptionist/members/${memberId}/subscriptions`, {method: 'GET'});
    },

    createSubscriptionForMember: async (memberId, packageId) => {
        return request(`/receptionist/members/${memberId}/subscriptions`, {
            method: 'POST',
            body: JSON.stringify({packageId}),
        });
    },

    renewSubscriptionForMember: async (memberId, packageId) => {
        return request(`/receptionist/members/${memberId}/subscriptions/renew`, {
            method: 'POST',
            body: JSON.stringify({packageId}),
        });
    },

    upgradeSubscriptionForMember: async (memberId, packageId) => {
        return request(`/receptionist/members/${memberId}/subscriptions/upgrade`, {
            method: 'POST',
            body: JSON.stringify({packageId}),
        });
    },

    cancelSubscriptionForMember: async (memberId, id) => {
        return request(`/receptionist/members/${memberId}/subscriptions/${id}/cancel`, {
            method: 'PATCH',
        });
    },

    // ===================== PAYMENTS & INVOICES =====================
    // Member Payments
    getMyPayments: async () => {
        return request('/member/payments/me', {method: 'GET'});
    },

    getMyInvoice: async (id) => {
        return request(`/member/payments/${id}/invoice`, {method: 'GET'});
    },

    // Receptionist Payments
    payCashAtCounter: async (subscriptionId) => {
        return request('/receptionist/payments/cash', {
            method: 'POST',
            body: JSON.stringify({subscriptionId}),
        });
    },

    getMemberPaymentsReceptionist: async (memberId) => {
        return request(`/receptionist/payments?memberId=${memberId}`, {method: 'GET'});
    },

    getInvoiceReceptionist: async (id) => {
        return request(`/receptionist/payments/${id}/invoice`, {method: 'GET'});
    },

    // ===================== REPORTS (MANAGER) =====================
    getRevenueReport: async (from, to, groupBy = 'DAY') => {
        return request(`/manager/reports/revenue?from=${from}&to=${to}&groupBy=${groupBy}`, {method: 'GET'});
    },

    getMemberStatsReport: async (expiringWithinDays = 7) => {
        return request(`/manager/reports/members?expiringWithinDays=${expiringWithinDays}`, {method: 'GET'});
    },

    // Backward compatibility alias methods to prevent sudden breaks in untouched components
    getAllPackages: async () => {
        return request('/packages', {method: 'GET'});
    },

    searchUsers: async (search = '') => {
        return request(`/manager/accounts/search?userName=${encodeURIComponent(search)}`, {method: 'GET'});
    },

    createUser: async (data) => {
        return request('/manager/accounts', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    createMember: async (data) => {
        return request('/receptionist/members', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    getUserById: async (id) => {
        return request(`/manager/accounts/${id}`, {method: 'GET'});
    },

    updateUser: async (id, data) => {
        return request(`/manager/accounts/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    },

    updateUserStatus: async (id, isActive) => {
        return request(`/manager/accounts/${id}/${isActive ? 'active' : 'deactivate'}`, {
            method: 'PATCH',
        });
    },

    deleteUser: async (id) => {
        return request(`/manager/accounts/${id}/deactivate`, {
            method: 'PATCH',
        });
    },

    getAllSubscriptions: async () => {
        return request('/member/subscriptions/me', {method: 'GET'});
    },

    getMyActiveSubscriptions: async () => {
        return request('/member/subscriptions/me/status', {method: 'GET'});
    },

    createSubscription: async (data) => {
        if (data.memberId) {
            return request(`/receptionist/members/${data.memberId}/subscriptions`, {
                method: 'POST',
                body: JSON.stringify({packageId: data.packageId}),
            });
        }
        return request('/member/subscriptions', {
            method: 'POST',
            body: JSON.stringify({packageId: data.packageId}),
        });
    },

    subscribeMe: async (packageId) => {
        return request('/member/subscriptions', {
            method: 'POST',
            body: JSON.stringify({packageId}),
        });
    },

    getAllPayments: async () => {
        return request('/member/payments/me', {method: 'GET'});
    },

    processPayment: async (data) => {
        return request('/receptionist/payments/cash', {
            method: 'POST',
            body: JSON.stringify({subscriptionId: data.subscriptionId}),
        });
    },

    getRecentAttendances: async () => {
        try {
            const stored = localStorage.getItem('sportcenter_attendances');
            if (stored) {
                return JSON.parse(stored);
            }
        } catch {
            // fallback
        }
        const defaultData = [
            {
                id: 1,
                userFullName: 'Luong Ba Hung',
                userEmail: 'member001@example.com',
                checkInTime: new Date(Date.now() - 3600000).toISOString(),
                notes: 'Cổng FaceID số 1 - Hợp lệ',
                recordedBy: 'Nguyen Thi Receptionist'
            },
        ];
        try {
            localStorage.setItem('sportcenter_attendances', JSON.stringify(defaultData));
        } catch {
            // ignore
        }
        return defaultData;
    },

    checkIn: async (data) => {
        const stored = localStorage.getItem('sportcenter_attendances');
        let list = stored ? JSON.parse(stored) : [];
        const newEntry = {
            id: Date.now(),
            userId: data.userId,
            userFullName: data.userFullName || 'Hội viên',
            notes: data.notes || 'Cổng FaceID số 1',
            checkInTime: new Date().toISOString(),
            checkOutTime: null,
            recordedBy: data.recordedBy || 'Lễ tân tại quầy',
        };
        list = [newEntry, ...list];
        localStorage.setItem('sportcenter_attendances', JSON.stringify(list));
        return newEntry;
    },

    checkOut: async (attId) => {
        const stored = localStorage.getItem('sportcenter_attendances');
        let list = stored ? JSON.parse(stored) : [];
        list = list.map((item) => {
            if (item.id === attId) {
                return {...item, checkOutTime: new Date().toISOString()};
            }
            return item;
        });
        localStorage.setItem('sportcenter_attendances', JSON.stringify(list));
        return {success: true};
    },

    // ===================== FLOW 2: SPORT CATEGORIES =====================
    getSportCategories: async () => {
        return request('/sport-categories', {method: 'GET'});
    },

    getSportCategoryById: async (id) => {
        return request(`/sport-categories/${id}`, {method: 'GET'});
    },

    createSportCategory: async (data) => {
        return request('/sport-categories', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    updateSportCategory: async (id, data) => {
        return request(`/sport-categories/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    deleteSportCategory: async (id) => {
        return request(`/sport-categories/${id}`, {method: 'DELETE'});
    },

    // ===================== FLOW 2: FACILITY ROOMS =====================
    getRooms: async () => {
        return request('/rooms', {method: 'GET'});
    },

    getRoomById: async (id) => {
        return request(`/rooms/${id}`, {method: 'GET'});
    },

    createRoom: async (data) => {
        return request('/rooms', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    updateRoom: async (id, data) => {
        return request(`/rooms/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    deleteRoom: async (id) => {
        return request(`/rooms/${id}`, {method: 'DELETE'});
    },

    // ===================== FLOW 2: SPORT CLASSES =====================
    getSportClasses: async () => {
        return request('/sport-classes', {method: 'GET'});
    },

    getSportClassById: async (id) => {
        return request(`/sport-classes/${id}`, {method: 'GET'});
    },

    createSportClass: async (data) => {
        return request('/sport-classes', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    updateSportClass: async (id, data) => {
        return request(`/sport-classes/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    // ===================== FLOW 2: CLASS SCHEDULES =====================
    getAllClassSchedules: async () => {
        return request('/class-schedules', {method: 'GET'});
    },

    getClassScheduleById: async (id) => {
        return request(`/class-schedules/${id}`, {method: 'GET'});
    },

    getSchedulesByClassId: async (classId) => {
        return request(`/class-schedules/class/${classId}`, {method: 'GET'});
    },

    getSchedulesByDayOfWeek: async (dayOfWeek) => {
        return request(`/class-schedules/day/${dayOfWeek}`, {method: 'GET'});
    },

    getCoachMySchedules: async () => {
        return request('/class-schedules/coach/me', {method: 'GET'});
    },

    createClassSchedule: async (data) => {
        return request('/class-schedules', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    updateClassSchedule: async (id, data) => {
        return request(`/class-schedules/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    deleteClassSchedule: async (id) => {
        return request(`/class-schedules/${id}`, {method: 'DELETE'});
    },

    // ===================== FLOW 2: CLASS REGISTRATIONS =====================
    // Member
    registerMyClass: async (classId, joinWaitlist = false) => {
        return request(`/member/class-registrations/${classId}?joinWaitlist=${joinWaitlist}`, {
            method: 'POST',
        });
    },

    cancelMyClassRegistration: async (registrationId) => {
        return request(`/member/class-registrations/${registrationId}/cancel`, {
            method: 'PATCH',
        });
    },

    getMyClassRegistrations: async () => {
        return request('/member/class-registrations/me', {method: 'GET'});
    },

    // Receptionist
    registerMemberClassByReceptionist: async (data, joinWaitlist = false) => {
        return request(`/receptionist/class-registrations?joinWaitlist=${joinWaitlist}`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    cancelMemberClassRegistrationByReceptionist: async (registrationId) => {
        return request(`/receptionist/class-registrations/${registrationId}/cancel`, {
            method: 'PATCH',
        });
    },

    getMemberClassRegistrationsByReceptionist: async (memberId) => {
        return request(`/receptionist/members/${memberId}/class-registrations`, {
            method: 'GET',
        });
    },
};
