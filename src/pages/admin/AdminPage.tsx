import { useEffect, useMemo, useState } from 'react';
import { GITHUB_REPO } from '../../config';
import { clearToken, GitHubError, loadCvFromRepo, saveCvToRepo, type Session } from '../../lib/github';
import type { CV, Faq, Job, Project, Skill } from '../../types';
import { LEVEL_LABELS } from '../../types';
import { IconBranch, IconUp } from '../../components/Icons';
import { LoginGate } from './LoginGate';
import { ListEditor, ProfileEditor, type FieldDef } from './editors';

type Tab = 'profile' | 'skills' | 'experience' | 'projects' | 'faq';

const TABS: { id: Tab; label: string; title: string }[] = [
  { id: 'profile', label: 'Hồ sơ', title: 'Thông tin cá nhân' },
  { id: 'skills', label: 'Kỹ năng', title: 'Quản lý kỹ năng' },
  { id: 'experience', label: 'Kinh nghiệm', title: 'Nơi làm việc' },
  { id: 'projects', label: 'Dự án', title: 'Quản lý dự án' },
  { id: 'faq', label: 'Chatbot FAQ', title: 'Kiến thức cho chatbot' },
];

const uid = () => Math.random().toString(36).slice(2, 10);

const SKILL_FIELDS: FieldDef<Skill>[] = [
  { key: 'name', label: 'Tên kỹ năng', type: 'text', placeholder: 'VD: GraphQL', required: true },
  { key: 'group', label: 'Nhóm', type: 'select', options: ['Frontend', 'Backend', 'DevOps & Tools', 'Mobile', 'Database', 'Kỹ năng mềm'], hint: 'Chọn hoặc gõ nhóm mới' },
  { key: 'level', label: 'Mức độ', type: 'level' },
];
const JOB_FIELDS: FieldDef<Job>[] = [
  { key: 'company', label: 'Công ty', type: 'text', required: true },
  { key: 'role', label: 'Chức danh', type: 'text', placeholder: 'VD: Backend Developer' },
  { key: 'start', label: 'Bắt đầu', type: 'text', placeholder: '01/2024' },
  { key: 'end', label: 'Kết thúc', type: 'text', placeholder: '12/2025' },
  { key: 'current', label: 'Đang làm ở đây', type: 'checkbox' },
  { key: 'highlights', label: 'Thành tựu chính', type: 'lines', hint: 'Mỗi dòng một ý' },
  { key: 'tech', label: 'Công nghệ', type: 'tags', placeholder: 'React, NestJS', hint: 'Cách nhau bằng dấu phẩy' },
];
const PROJECT_FIELDS: FieldDef<Project>[] = [
  { key: 'name', label: 'Tên dự án', type: 'text', required: true },
  { key: 'description', label: 'Mô tả', type: 'textarea', placeholder: 'Vấn đề, vai trò của bạn, kết quả…' },
  { key: 'tech', label: 'Công nghệ', type: 'tags', placeholder: 'React, Firebase', hint: 'Cách nhau bằng dấu phẩy' },
  { key: 'repoUrl', label: 'Link GitHub', type: 'url', placeholder: 'https://github.com/…' },
  { key: 'demoUrl', label: 'Link demo', type: 'url' },
  { key: 'imageUrl', label: 'Ảnh (URL)', type: 'text' },
  { key: 'featured', label: 'Đánh dấu nổi bật', type: 'checkbox' },
];
const FAQ_FIELDS: FieldDef<Faq>[] = [
  { key: 'question', label: 'Câu hỏi', type: 'text', placeholder: 'VD: Bạn có làm remote không?', required: true },
  { key: 'answer', label: 'Câu trả lời', type: 'textarea', placeholder: 'Câu trả lời chatbot nên dùng' },
];

export default function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [remote, setRemote] = useState<{ cv: CV; sha: string } | null>(null);
  const [draft, setDraft] = useState<CV | null>(null);
  const [tab, setTab] = useState<Tab>('profile');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  async function load(s: Session) {
    setLoadError(null);
    try {
      const r = await loadCvFromRepo(s);
      setRemote(r);
      setDraft(r.cv);
    } catch (e) {
      setLoadError(e instanceof GitHubError ? e.message : 'Không tải được cv.json từ GitHub.');
    }
  }

  useEffect(() => {
    if (session) void load(session);
  }, [session]);

  const dirty = useMemo(
    () => !!remote && !!draft && JSON.stringify(remote.cv) !== JSON.stringify(draft),
    [remote, draft],
  );

  // Cảnh báo khi rời trang còn thay đổi chưa lưu
  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [dirty]);

  if (!session) return <LoginGate onSession={setSession} />;

  function logout() {
    if (dirty && !window.confirm('Còn thay đổi chưa đẩy lên GitHub. Vẫn đăng xuất?')) return;
    clearToken();
    setSession(null);
    setRemote(null);
    setDraft(null);
  }

  async function publish() {
    if (!session || !remote || !draft) return;
    setSaving(true);
    setNotice(null);
    const next: CV = { ...draft, updatedAt: new Date().toISOString() };
    try {
      const sha = await saveCvToRepo(session, next, remote.sha, `chore(cv): cập nhật CV qua trang admin`);
      setRemote({ cv: next, sha });
      setDraft(next);
      setNotice({ kind: 'ok', text: 'Đã commit cv.json lên GitHub. GitHub Actions sẽ deploy lại trang trong khoảng 1–2 phút.' });
    } catch (e) {
      setNotice({ kind: 'err', text: e instanceof GitHubError ? e.message : 'Lưu thất bại, thử lại sau.' });
    } finally {
      setSaving(false);
    }
  }

  function update<K extends keyof CV>(key: K, value: CV[K]) {
    setDraft((d) => (d ? { ...d, [key]: value } : d));
    setNotice(null);
  }

  const current = TABS.find((t) => t.id === tab)!;
  const counts: Record<Tab, string> = {
    profile: '',
    skills: String(draft?.skills.length ?? 0),
    experience: String(draft?.experience.length ?? 0),
    projects: String(draft?.projects.length ?? 0),
    faq: String(draft?.faq.length ?? 0),
  };

  return (
    <div className="admin">
      <aside className="admin-side">
        <a href="#top" className="brand">
          <span className="brand-mark">&lt;/&gt;</span>
          <span>CV Admin<small>Xem trang công khai</small></span>
        </a>
        <nav className="side-nav" aria-label="Mục quản lý">
          <span className="side-label">NỘI DUNG CV</span>
          {TABS.map((t) => (
            <button key={t.id} aria-current={tab === t.id ? 'page' : undefined} onClick={() => setTab(t.id)}>
              <span>{t.label}</span>
              {counts[t.id] && <span className="count">{counts[t.id]}</span>}
            </button>
          ))}
        </nav>
        <div className="side-user">
          <div className="who">
            <img src={session.avatarUrl} alt="" />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <strong style={{ color: '#fff' }}>@{session.login}</strong>
              <span>Chủ sở hữu · đã xác thực</span>
            </div>
          </div>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><IconBranch size={14} />{GITHUB_REPO} · {session.branch}</span>
          <button onClick={logout}>Đăng xuất</button>
        </div>
      </aside>

      <main className="admin-main">
        <div className="admin-top">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span className="eyebrow" style={{ fontSize: 13 }}>admin / {tab}</span>
            <h1>{current.title}</h1>
          </div>
          <div className="admin-actions">
            {draft && (
              <span className={`sync${dirty ? ' pending' : ''}`}>
                <i />{dirty ? 'Có thay đổi chưa xuất bản' : 'Đã đồng bộ với GitHub'}
              </span>
            )}
            <button className="btn btn-primary" onClick={publish} disabled={!dirty || saving}>
              <IconUp size={18} />{saving ? 'Đang đẩy lên…' : 'Lưu & đẩy lên GitHub'}
            </button>
          </div>
        </div>

        {notice && <div className={`notice ${notice.kind}`} role="status">{notice.text}</div>}
        {loadError && (
          <div className="notice err" role="alert">
            {loadError}{' '}
            <button className="btn btn-outline" style={{ minHeight: 36, marginLeft: 8 }} onClick={() => load(session)}>Thử lại</button>
          </div>
        )}
        {!draft && !loadError && <div className="center-msg">Đang tải cv.json từ GitHub…</div>}

        {draft && tab === 'profile' && <ProfileEditor profile={draft.profile} onChange={(p) => update('profile', p)} />}
        {draft && tab === 'skills' && (
          <ListEditor<Skill>
            key="skills"
            title="Danh sách kỹ năng"
            formTitle="Thêm kỹ năng"
            items={draft.skills}
            fields={SKILL_FIELDS}
            empty={() => ({ id: uid(), name: '', group: 'Frontend', level: 4 })}
            summary={(s) => ({ title: s.name, sub: s.group, meta: LEVEL_LABELS[s.level] })}
            onChange={(v) => update('skills', v)}
          />
        )}
        {draft && tab === 'experience' && (
          <ListEditor<Job>
            key="experience"
            title="Lịch sử làm việc"
            formTitle="Thêm nơi làm việc"
            items={draft.experience}
            fields={JOB_FIELDS}
            empty={() => ({ id: uid(), company: '', role: '', start: '', end: '', current: false, highlights: [], tech: [] })}
            summary={(j) => ({ title: j.company, sub: j.role, meta: `${j.start} – ${j.current ? 'nay' : j.end}` })}
            onChange={(v) => update('experience', v)}
          />
        )}
        {draft && tab === 'projects' && (
          <ListEditor<Project>
            key="projects"
            title="Danh sách dự án"
            formTitle="Thêm dự án"
            items={draft.projects}
            fields={PROJECT_FIELDS}
            empty={() => ({ id: uid(), name: '', description: '', tech: [], repoUrl: '', demoUrl: '', imageUrl: '', featured: false })}
            summary={(p) => ({ title: p.name, sub: p.tech.join(' · ') || p.description, meta: p.featured ? 'Nổi bật' : undefined })}
            onChange={(v) => update('projects', v)}
          />
        )}
        {draft && tab === 'faq' && (
          <ListEditor<Faq>
            key="faq"
            title="Câu hỏi & câu trả lời mẫu"
            formTitle="Thêm câu hỏi"
            items={draft.faq}
            fields={FAQ_FIELDS}
            empty={() => ({ id: uid(), question: '', answer: '' })}
            summary={(f) => ({ title: f.question, sub: f.answer, meta: 'Chatbot' })}
            onChange={(v) => update('faq', v)}
          />
        )}
      </main>
    </div>
  );
}
