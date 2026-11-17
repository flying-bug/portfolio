// Khi build trên GitHub Actions, VITE_GITHUB_REPO = "owner/repo" được điền tự động.
// Khi chạy local, đặt trong file .env.local (xem .env.example).
export const GITHUB_REPO = import.meta.env.VITE_GITHUB_REPO || 'flying-bug/portfolio.github.io';

const [owner] = GITHUB_REPO.split('/');

/** Chỉ tài khoản GitHub này mới được vào trang admin. */
export const ADMIN_LOGIN = (import.meta.env.VITE_ADMIN_LOGIN || owner).trim();

/** Đường dẫn file dữ liệu CV trong repo. */
export const CV_PATH = 'public/cv.json';

/** Endpoint chatbot AI. Để trống → chatbot trả lời bằng bộ máy cục bộ (FAQ + dữ liệu CV). */
export const CHAT_API_URL = (import.meta.env.VITE_CHAT_API_URL || '').replace(/\/$/, '');
