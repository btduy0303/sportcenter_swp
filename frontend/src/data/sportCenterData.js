import { 
  Users, Calendar, CreditCard, Dumbbell,
  ShieldCheck, Clock, UserCheck, Layers
} from 'lucide-react';

export const navigationData = {
  products: [
    { name: 'Quản lý Hội viên', desc: 'Hồ sơ, đăng ký gói tập, thẻ thành viên', icon: Users, href: '#features' },
    { name: 'Lớp học & Lịch tập', desc: 'Phân ca, huấn luyện viên, lịch tập theo tuần', icon: Calendar, href: '#features' },
    { name: 'Thu phí & Thanh toán', desc: 'Hóa đơn, thu tiền tại quầy và cổng trực tuyến', icon: CreditCard, href: '#features' },
    { name: 'Điểm danh Check-in', desc: 'Kiểm soát ra vào cơ sở, chống điểm danh trùng', icon: UserCheck, href: '#features' },
  ],
  solutions: [
    { title: 'Quản lý tập trung', desc: 'Phân quyền rõ ràng giữa Quản lý, Lễ tân và HLV', href: '#features' },
    { title: 'Tự phục vụ hội viên', desc: 'Hội viên chủ động theo dõi gói tập và đăng ký lớp', href: '#features' },
    { title: 'Minh bạch thu chi', desc: 'Lưu vết lịch sử giao dịch và xuất hóa đơn chi tiết', href: '#features' },
  ]
};

export const statsData = [
  {
    number: '4',
    label: 'Vai trò trong hệ thống',
    desc: 'Quản lý, Lễ tân, Huấn luyện viên và Hội viên với phân quyền nghiệp vụ riêng biệt',
    icon: Users,
  },
  {
    number: '100%',
    label: 'Quy trình khép kín',
    desc: 'Từ đăng ký gói, xếp lớp, điểm danh ra vào đến thu tiền và xuất hóa đơn',
    icon: ShieldCheck,
  },
  {
    number: 'Realtime',
    label: 'Cập nhật trạng thái tức thì',
    desc: 'Theo dõi thành viên đang có mặt tại cơ sở và kiểm tra sức chứa lớp học theo thời gian thực',
    icon: Clock,
  },
  {
    number: 'Đa bộ môn',
    label: 'Gym, Bơi lội, Yoga & Boxing',
    desc: 'Linh hoạt cấu hình phòng tập, cấp độ lớp học và hạn mức số buổi theo từng gói tập',
    icon: Layers,
  },
];

export const featuresData = [
  {
    id: 'members',
    category: 'members',
    title: 'Quản lý Hội viên & Thẻ tập',
    icon: Users,
    desc: 'Quản lý thông tin tài khoản, hồ sơ thể chất, đăng ký gói tập và theo dõi thời hạn kích hoạt thẻ.',
    tags: ['Hồ sơ hội viên', 'Gói tập theo cấp độ', 'Trạng thái hoạt động'],
    previewType: 'table',
    mockupData: {
      title: 'Danh sách thành viên gần đây',
      rows: [
        { name: 'Nguyễn Văn B', pack: 'Gói Cơ Bản 1 Tháng', exp: 'Còn 25 ngày', status: 'Hoạt động', alert: false },
        { name: 'Lương Bá Hùng', pack: 'Gói Standard 3 Tháng', exp: 'Còn 80 ngày', status: 'Hoạt động', alert: false },
        { name: 'Trần Văn Test', pack: 'Gói VIP Premium', exp: 'Còn 5 ngày', status: 'Sắp hết hạn', alert: true },
      ]
    }
  },
  {
    id: 'schedule',
    category: 'schedule',
    title: 'Lịch học & Xếp ca tập',
    icon: Calendar,
    desc: 'Lên lịch mở lớp theo thứ, phân công HLV phụ trách, phòng tập và giới hạn sĩ số để đảm bảo chất lượng giảng dạy.',
    tags: ['Xếp ca theo thứ trong tuần', 'Phân công HLV', 'Giới hạn sĩ số & phòng'],
    previewType: 'calendar',
    mockupData: {
      title: 'Thời khóa biểu trong tuần',
      slots: [
        { time: '06:30 - 08:00', title: 'Yoga Bình Minh Thư Thái', coach: 'HLV Nguyễn Văn Coach', booked: '18/20 Học viên' },
        { time: '18:00 - 19:30', title: 'Boxing Căn Bản & Tự Vệ', coach: 'HLV Nguyễn Văn Coach1', booked: '15/18 Học viên' },
        { time: '09:00 - 10:30', title: 'Kỹ Thuật Bơi Sải Cơ Bản', coach: 'HLV Nguyễn Văn Coach1', booked: '12/15 Học viên' },
      ]
    }
  },
  {
    id: 'attendance',
    category: 'members',
    title: 'Điểm danh & Kiểm soát ra vào',
    icon: UserCheck,
    desc: 'Lễ tân check-in và check-out tại quầy, ngăn chặn check-in trùng và kiểm tra điều kiện gói tập trước khi vào phòng.',
    tags: ['Check-in / Check-out', 'Chống vào trùng', 'Yêu cầu gói kích hoạt'],
    previewType: 'attendance',
    mockupData: {
      title: 'Trạng thái tại cơ sở',
      presentCount: '12 thành viên',
      status: 'Đang có mặt',
      recent: 'Nguyễn Văn B vừa check-in lúc 08:15'
    }
  },
  {
    id: 'finance',
    category: 'finance',
    title: 'Thu phí & Quản lý Hóa đơn',
    icon: CreditCard,
    desc: 'Thu phí tại quầy với tiền mặt hoặc chuyển khoản VietQR, xuất phiếu thu hóa đơn có mã tra cứu minh bạch.',
    tags: ['Tiền mặt tại quầy', 'Chuyển khoản VietQR', 'Xuất phiếu thu hóa đơn'],
    previewType: 'payment',
    mockupData: {
      title: 'Giao dịch thanh toán gần nhất',
      amount: '550.000 ₫',
      methods: ['Tiền mặt', 'VietQR'],
      recent: 'Hóa đơn #HD-1042 - Đã hoàn tất'
    }
  },
];
