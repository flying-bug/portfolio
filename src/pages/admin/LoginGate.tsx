import { useEffect, useState, type FormEvent } from 'react';
import { ADMIN_LOGIN, GITHUB_REPO } from '../../config';
import { clearToken, getStoredToken, GitHubError, storeToken, verifyOwner, type Session } from '../../lib/github';
import { IconBranch, IconLock } from '../../components/Icons';

export function LoginGate({ onSession }: { onSession: (s: Session) => void }) {
  const [token, setToken] = useState('');
  const [remember, setRemember] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function tryLogin(t: string, rememberIt: boolean, silent = false) {
    setBusy(true);
    setError(null);
    try {
      const s = await verifyOwner(t.trim());
      storeToken(s.token, rememberIt);
      onSession(s);
    } catch (e) {
      clearToken();
      if (!silent) setError(e instanceof GitHubError ? e.message : 'Đã có lỗi xảy ra, thử lại sau.');
    } finally {
      setBusy(false);
    }
  }

  // Tự đăng nhập lại nếu đã lưu token
  useEffect(() => {
    const saved = getStoredToken();
    if (saved) void tryLogin(saved, false, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (token.trim()) void tryLogin(token, remember);
  }

  return (
    <div className="login">
      <svg aria-hidden="true" viewBox="0 0 1440 200" preserveAspectRatio="none">
        <path d="M0 100 C 240 60, 480 140, 720 100 S 1200 60, 1440 100 V 200 H 0 Z" fill="#0E6BA8" opacity="0.4" />
        <path d="M0 140 C 260 110, 520 180, 760 140 S 1220 110, 1440 140 V 200 H 0 Z" fill="#13A0DC" opacity="0.25" />
      </svg>
      <form className="login-card" onSubmit={onSubmit}>
        <span className="brand-mark" style={{ width: 48, height: 48 }}><IconLock size={22} /></span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <h1>Xác thực chủ sở hữu</h1>
          <p className="muted" style={{ margin: 0, lineHeight: 1.5 }}>
            Chỉ tài khoản GitHub <strong>@{ADMIN_LOGIN}</strong> có quyền ghi vào{' '}
            <span className="mono" style={{ fontSize: 13 }}>{GITHUB_REPO}</span> mới vào được trang này.
          </p>
        </div>

        <ol>
          <li>
            Mở{' '}
            <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noreferrer">
              GitHub → Fine-grained token
            </a>
          </li>
          <li>Repository access: chỉ chọn repo <span className="mono" style={{ fontSize: 13 }}>{GITHUB_REPO.split('/')[1]}</span></li>
          <li>Permissions → Contents: <strong>Read and write</strong></li>
          <li>Dán token vào ô bên dưới</li>
        </ol>

        <div className="field">
          <label htmlFor="token">GitHub token</label>
          <input
            id="token"
            className="input"
            type="password"
            autoComplete="off"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="github_pat_…"
          />
        </div>
        <label className="check">
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
          Ghi nhớ trên trình duyệt này
        </label>

        {error && <div className="notice err" role="alert">{error}</div>}

        <button className="btn btn-primary btn-lg" type="submit" disabled={busy || !token.trim()}>
          <IconBranch size={20} />
          {busy ? 'Đang kiểm tra…' : 'Xác thực với GitHub'}
        </button>
        <a href="#top" style={{ textAlign: 'center', fontSize: 14 }}>← Về trang CV</a>
      </form>
    </div>
  );
}
