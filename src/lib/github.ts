import { ADMIN_LOGIN, CV_PATH, GITHUB_REPO } from '../config';
import type { CV } from '../types';

const API = 'https://api.github.com';

export class GitHubError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
  }
}

async function gh<T>(path: string, token: string, init: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API}${path}`, {
      ...init,
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28',
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      },
    });
  } catch {
    throw new GitHubError('Không kết nối được tới GitHub. Kiểm tra mạng rồi thử lại.');
  }
  if (!res.ok) {
    let detail = '';
    try {
      detail = ((await res.json()) as { message?: string }).message ?? '';
    } catch {
      /* ignore */
    }
    throw new GitHubError(detail || `GitHub trả về lỗi ${res.status}`, res.status);
  }
  return (await res.json()) as T;
}

// ---- base64 <-> UTF-8 (GitHub contents API dùng base64) ----
function toBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) {
    bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(bin);
}

function fromBase64(b64: string): string {
  const bin = atob(b64.replace(/\s/g, ''));
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
}

export interface Session {
  token: string;
  login: string;
  avatarUrl: string;
  branch: string;
}

/**
 * Xác thực chính chủ:
 * 1. Token phải hợp lệ (GET /user).
 * 2. Tài khoản đăng nhập phải trùng ADMIN_LOGIN (mặc định là owner của repo).
 * 3. Tài khoản phải có quyền push vào repo.
 * Dù giao diện có bị vượt qua, GitHub vẫn từ chối commit nếu token không có quyền ghi.
 */
export async function verifyOwner(token: string): Promise<Session> {
  let user: { login: string; avatar_url: string };
  try {
    user = await gh('/user', token);
  } catch (e) {
    if (e instanceof GitHubError && e.status === 401) {
      throw new GitHubError('Token không hợp lệ hoặc đã hết hạn.', 401);
    }
    throw e;
  }

  if (user.login.toLowerCase() !== ADMIN_LOGIN.toLowerCase()) {
    throw new GitHubError(
      `Tài khoản @${user.login} không phải chủ sở hữu CV này. Chỉ @${ADMIN_LOGIN} mới được chỉnh sửa.`,
      403,
    );
  }

  let repo: { default_branch: string; permissions?: { push?: boolean } };
  try {
    repo = await gh(`/repos/${GITHUB_REPO}`, token);
  } catch (e) {
    if (e instanceof GitHubError && e.status === 404) {
      throw new GitHubError(`Token không truy cập được repo ${GITHUB_REPO}. Hãy cấp quyền cho đúng repo này.`, 404);
    }
    throw e;
  }
  if (repo.permissions && repo.permissions.push === false) {
    throw new GitHubError(`Tài khoản @${user.login} không có quyền ghi vào ${GITHUB_REPO}.`, 403);
  }

  return { token, login: user.login, avatarUrl: user.avatar_url, branch: repo.default_branch };
}

export interface RemoteCv {
  cv: CV;
  sha: string;
}

export async function loadCvFromRepo(s: Session): Promise<RemoteCv> {
  const file = await gh<{ content: string; sha: string }>(
    `/repos/${GITHUB_REPO}/contents/${CV_PATH}?ref=${encodeURIComponent(s.branch)}`,
    s.token,
  );
  return { cv: JSON.parse(fromBase64(file.content)) as CV, sha: file.sha };
}

export async function saveCvToRepo(s: Session, cv: CV, sha: string, message: string): Promise<string> {
  try {
    const res = await gh<{ content: { sha: string } }>(`/repos/${GITHUB_REPO}/contents/${CV_PATH}`, s.token, {
      method: 'PUT',
      body: JSON.stringify({
        message,
        content: toBase64(JSON.stringify(cv, null, 2) + '\n'),
        sha,
        branch: s.branch,
      }),
    });
    return res.content.sha;
  } catch (e) {
    if (e instanceof GitHubError && (e.status === 409 || e.status === 422)) {
      throw new GitHubError('cv.json trên GitHub đã thay đổi từ lúc bạn mở trang. Hãy tải lại dữ liệu rồi sửa lại.', 409);
    }
    if (e instanceof GitHubError && e.status === 403) {
      throw new GitHubError('Token chưa có quyền ghi (Contents: Read and write) vào repo.', 403);
    }
    throw e;
  }
}

// ---- Lưu token trong trình duyệt ----
const KEY = 'cv-admin-token';

export function getStoredToken(): string | null {
  try {
    return sessionStorage.getItem(KEY) ?? localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function storeToken(token: string, remember: boolean) {
  try {
    sessionStorage.setItem(KEY, token);
    if (remember) localStorage.setItem(KEY, token);
  } catch {
    /* trình duyệt chặn storage: chỉ giữ trong bộ nhớ */
  }
}

export function clearToken() {
  try {
    sessionStorage.removeItem(KEY);
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
