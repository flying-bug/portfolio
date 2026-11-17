/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** "owner/repo" – GitHub Actions tự điền từ github.repository */
  readonly VITE_GITHUB_REPO?: string;
  /** Tài khoản GitHub được vào trang admin (mặc định = owner của repo) */
  readonly VITE_ADMIN_LOGIN?: string;
  /** URL của Cloudflare Worker chatbot, ví dụ https://cv-chat.xxx.workers.dev */
  readonly VITE_CHAT_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
