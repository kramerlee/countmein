export default {
  app: {
    name: 'Count Me In',
    tagline: 'Hệ thống xếp hàng bài hát cho karaoke, open mic và jam session'
  },
  common: {
    or: 'hoặc',
    loading: 'Đang tải...',
    error: 'Lỗi',
    success: 'Thành công',
    cancel: 'Hủy',
    confirm: 'Xác nhận',
    copy: 'Sao chép',
    copied: 'Đã sao chép!',
    share: 'Chia sẻ',
    close: 'Đóng',
    room: 'Phòng',
    roomCode: 'Mã phòng'
  },
  home: {
    hostTitle: 'Tạo Phòng',
    hostDesc: 'Tạo phòng và chia sẻ mã QR cho khách',
    createRoom: 'Tạo Phòng',
    joinTitle: 'Tham Gia Phòng',
    joinDesc: 'Nhập mã phòng để gửi yêu cầu bài hát',
    enterRoomCode: 'Nhập mã phòng',
    join: 'Tham Gia',
    roomNotFound: 'Không tìm thấy phòng. Vui lòng kiểm tra lại mã.',
    enterCode: 'Vui lòng nhập mã phòng',
    failedCreate: 'Không thể tạo phòng. Vui lòng thử lại.',
    failedCheck: 'Không thể kiểm tra phòng. Vui lòng thử lại.'
  },
  host: {
    scanToJoin: 'Quét để tham gia',
    copyLink: 'Sao chép liên kết',
    linkCopied: 'Đã sao chép liên kết vào clipboard',
    codeCopied: 'Đã sao chép mã phòng vào clipboard',
    inQueue: 'Đang chờ',
    completed: 'Đã hoàn thành',
    queue: 'Hàng chờ',
    noRequests: 'Chưa có yêu cầu',
    shareQrCode: 'Chia sẻ mã QR để khách thêm bài hát',
    noCompleted: 'Chưa có bài hát hoàn thành',
    completedHere: 'Bài hát đã hoàn thành sẽ hiển thị ở đây',
    connecting: 'Đang kết nối phòng...',
    roomNotFound: 'Không tìm thấy phòng',
    roomNotExist: 'Phòng này không tồn tại',
    newRequest: 'Yêu cầu mới!',
    wantsToSing: 'muốn hát'
  },
  guest: {
    addSong: 'Thêm Bài Hát',
    fillDetails: 'Điền thông tin bên dưới để tham gia hàng chờ',
    yourName: 'Tên của bạn',
    enterName: 'Nhập tên của bạn',
    songName: 'Tên bài hát',
    whatSong: 'Bạn muốn hát bài gì?',
    youtubeLink: 'Liên kết YouTube',
    optional: '(không bắt buộc)',
    youtubePlaceholder: 'https://youtube.com/watch?v=...',
    youtubeHelper: 'Thêm liên kết YouTube để giúp host tìm bài hát của bạn',
    submit: 'Gửi Yêu Cầu',
    required: '*',
    nameRequired: 'Vui lòng nhập tên của bạn',
    songRequired: 'Vui lòng nhập tên bài hát',
    invalidYoutube: 'Vui lòng nhập URL YouTube hợp lệ',
    submitFailed: 'Không thể gửi yêu cầu. Vui lòng thử lại.',
    checkingRoom: 'Đang kiểm tra phòng...',
    roomClosed: 'Phòng này không tồn tại hoặc đã đóng'
  },
  submitted: {
    inQueue: 'Bạn đã trong hàng chờ!',
    requestSent: 'Yêu cầu bài hát của bạn đã được gửi. Host sẽ thấy ngay.',
    addAnother: 'Thêm Bài Khác',
    done: 'Xong',
    tips: 'Mẹo',
    tip1: 'Đứng gần để nghe khi đến lượt bạn',
    tip2: 'Báo host nếu bạn cần rời đi',
    tip3: 'Chúc vui vẻ!'
  },
  queue: {
    pending: 'Đang chờ',
    next: 'Kế tiếp',
    ongoing: 'Đang hát',
    completed: 'Hoàn thành',
    upNext: 'Sắp đến',
    nowSinging: 'Đang Hát',
    start: 'Bắt đầu',
    startSinging: 'Bắt Đầu Hát',
    complete: 'Hoàn thành'
  },
  config: {
    notConfigured: 'Firebase Chưa Cấu Hình',
    setupMessage: 'Thiết lập biến môi trường Firebase để kích hoạt tạo phòng và đồng bộ thời gian thực.'
  }
}

