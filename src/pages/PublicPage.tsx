import { useMemo, useState } from 'react';
import { ChatWidget } from '../components/ChatWidget';
import {
  IconArrow, IconBranch, IconChat, IconCode, IconDownload, IconExternal, IconLinkedin, IconLock, IconMail, IconUser, Waves,
} from '../components/Icons';
import type { CV } from '../types';
import { LEVEL_LABELS } from '../types';

const CTA_QUESTIONS = ['Điểm mạnh lớn nhất của bạn là gì?', 'Bạn có thể bắt đầu làm việc khi nào?', 'Kể về dự án khó nhất'];

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('vi-VN');
  } catch {
    return iso;
  }
}

export function PublicPage({ cv }: { cv: CV }) {
  const { profile } = cv;
  const [filter, setFilter] = useState('all');
  const [chatOpen, setChatOpen] = useState(false);
  const [pendingQ, setPendingQ] = useState<string | null>(null);

  const groups = useMemo(() => [...new Set(cv.skills.map((s) => s.group))], [cv.skills]);
  const shownGroups = filter === 'all' ? groups : groups.filter((g) => g === filter);
  const projects = [...cv.projects].sort((a, b) => Number(b.featured) - Number(a.featured));
  const githubLabel = profile.github.replace(/^https?:\/\/(www\.)?/, '');

  function ask(q?: string) {
    if (q) setPendingQ(q);
    setChatOpen(true);
  }

  return (
    <>
      <header className="nav">
        <nav className="container nav-inner" aria-label="Điều hướng chính">
          <a href="#top" className="brand">
            <span className="brand-mark">&lt;/&gt;</span>
            <span>{profile.name}<span style={{ color: 'var(--ocean)' }}>.dev</span></span>
          </a>
          <div className="nav-links">
            <a href="#skills">Kỹ năng</a>
            <a href="#experience">Kinh nghiệm</a>
            <a href="#projects">Dự án</a>
            <a href="#contact">Liên hệ</a>
            <a href="#/admin" className="admin-link"><IconLock size={16} />Admin</a>
          </div>
        </nav>
      </header>

      <main>
        <section id="top" className="container hero">
          <div className="hero-text">
            {profile.openToWork && (
              <span className="status"><span className="status-dot" />Đang tìm cơ hội mới</span>
            )}
            <span className="eyebrow" style={{ fontSize: 16 }}>// Xin chào, tôi là</span>
            <h1>{profile.name}</h1>
            <p className="role">{profile.title}</p>
            <p className="bio">{profile.bio}</p>
            <div className="hero-actions">
              <button className="btn btn-primary btn-lg" onClick={() => ask()}>
                <IconChat size={20} />Hỏi AI về tôi
              </button>
              {profile.cvPdfUrl && (
                <a className="btn btn-outline btn-lg" href={profile.cvPdfUrl} target="_blank" rel="noreferrer">
                  <IconDownload size={20} />Tải CV (PDF)
                </a>
              )}
            </div>
            <div className="socials">
              {profile.github && <a href={profile.github} target="_blank" rel="noreferrer"><IconBranch />{githubLabel}</a>}
              {profile.linkedin && <a href={profile.linkedin} target="_blank" rel="noreferrer"><IconLinkedin />LinkedIn</a>}
              {profile.email && <a href={`mailto:${profile.email}`}><IconMail />{profile.email}</a>}
            </div>
          </div>

          <div className="avatar-wrap">
            <div className="avatar">
              <div className="avatar-ring" />
              <div className="avatar-disc">
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt={`Ảnh của ${profile.name}`} />
                ) : (
                  <>
                    <Waves className="waves" />
                    <IconUser size={84} strokeWidth={1.5} style={{ position: 'relative', marginBottom: 40 }} />
                  </>
                )}
              </div>
              {profile.yearsOfExperience && (
                <div className="float-card years"><strong>{profile.yearsOfExperience}</strong><span>năm kinh nghiệm</span></div>
              )}
              {profile.location && (
                <div className="float-card loc"><span className="mono">~/</span>{profile.location}</div>
              )}
            </div>
          </div>
        </section>

        <svg className="wave-divider" aria-hidden="true" viewBox="0 0 1440 60" preserveAspectRatio="none">
          <path d="M0 30 C 240 0, 480 60, 720 30 S 1200 0, 1440 30 V 60 H 0 Z" fill="#FFFFFF" />
        </svg>

        <section id="skills" className="section-white">
          <div className="container" style={{ paddingBlock: '48px 88px' }}>
            <div className="section-head">
              <div>
                <span className="eyebrow">01 / skills</span>
                <h2 className="h2">Kỹ năng</h2>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }} role="group" aria-label="Lọc kỹ năng">
                {['all', ...groups].map((g) => (
                  <button key={g} className="pill-btn" aria-pressed={filter === g} onClick={() => setFilter(g)}>
                    {g === 'all' ? 'Tất cả' : g}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid-cards">
              {shownGroups.map((g) => {
                const skills = cv.skills.filter((s) => s.group === g);
                return (
                  <div className="skill-card" key={g}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <h3>{g}</h3>
                      <span className="chip">{skills.length} kỹ năng</span>
                    </div>
                    {skills.map((s) => (
                      <div className="skill-row" key={s.id}>
                        <span className="name">{s.name}</span>
                        <span className="skill-meta">
                          {LEVEL_LABELS[s.level]}
                          <span className="dots" aria-label={`${s.level} trên 5`}>
                            {[1, 2, 3, 4, 5].map((i) => <span key={i} className={i <= s.level ? 'dot on' : 'dot'} />)}
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="experience" className="container section exp">
          <div className="exp-intro">
            <span className="eyebrow">02 / experience</span>
            <h2 className="h2">Kinh nghiệm làm việc</h2>
            <p className="muted" style={{ margin: 0, lineHeight: 1.6 }}>Những nơi tôi đã làm việc và đóng góp.</p>
          </div>
          <div className="timeline">
            {cv.experience.map((j) => (
              <div className="tl-item" key={j.id}>
                <div className="tl-rail"><span className="tl-dot" /><span className="tl-line" /></div>
                <div className="tl-body">
                  <div className="tl-head">
                    <h3>{j.role}</h3>
                    <span className="chip" style={{ fontSize: 14 }}>{j.start} – {j.current ? 'Hiện tại' : j.end}</span>
                  </div>
                  <div className="tl-company">{j.company}</div>
                  {j.highlights.length > 0 && <ul>{j.highlights.map((h, i) => <li key={i}>{h}</li>)}</ul>}
                  {j.tech.length > 0 && <div className="tags">{j.tech.map((t) => <span key={t} className="chip-outline">{t}</span>)}</div>}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="projects" className="section-white">
          <div className="container section">
            <div className="section-head">
              <div>
                <span className="eyebrow">03 / projects</span>
                <h2 className="h2">Dự án nổi bật</h2>
              </div>
              {profile.github && (
                <a href={profile.github} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', gap: 6, alignItems: 'center', fontWeight: 600, textDecoration: 'none', minHeight: 44 }}>
                  Xem tất cả trên GitHub <IconArrow />
                </a>
              )}
            </div>
            <div className="grid-cards" style={{ gap: 24 }}>
              {projects.map((p) => (
                <article className="project" key={p.id}>
                  <div className="project-thumb">
                    {p.featured && <span className="badge-featured">Nổi bật</span>}
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={`Ảnh dự án ${p.name}`} />
                    ) : (
                      <>
                        <svg aria-hidden="true" viewBox="0 0 400 180" preserveAspectRatio="none">
                          <path d="M0 120 C 70 95, 130 145, 200 120 S 330 95, 400 120 V 180 H 0 Z" fill="#0E6BA8" opacity="0.7" />
                          <path d="M0 145 C 80 125, 140 165, 210 145 S 340 130, 400 145 V 180 H 0 Z" fill="#13A0DC" opacity="0.45" />
                        </svg>
                        <span className="label">&lt;{p.name.slice(0, 18)} /&gt;</span>
                      </>
                    )}
                  </div>
                  <div className="project-body">
                    <h3>{p.name}</h3>
                    <p>{p.description}</p>
                    <div className="tags">{p.tech.map((t) => <span key={t} className="chip" style={{ fontSize: 12 }}>{t}</span>)}</div>
                    {(p.repoUrl || p.demoUrl) && (
                      <div className="project-links">
                        {p.repoUrl && <a className="btn btn-outline" href={p.repoUrl} target="_blank" rel="noreferrer"><IconCode size={16} />Source code</a>}
                        {p.demoUrl && <a className="btn btn-primary" href={p.demoUrl} target="_blank" rel="noreferrer"><IconExternal size={16} />Live demo</a>}
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="container section">
          <div className="cta">
            <svg aria-hidden="true" viewBox="0 0 1200 200" preserveAspectRatio="none">
              <path d="M0 120 C 200 80, 400 160, 600 120 S 1000 80, 1200 120 V 200 H 0 Z" fill="#0E6BA8" opacity="0.35" />
            </svg>
            <div className="cta-text">
              <span className="eyebrow">04 / ask-me-anything</span>
              <h2>Nhà tuyển dụng muốn biết thêm? Hỏi trợ lý AI của tôi.</h2>
              <p>Chatbot trả lời dựa trên CV, dự án và câu hỏi thường gặp — 24/7, bằng tiếng Việt hoặc tiếng Anh.</p>
              <div className="cta-chips">
                {CTA_QUESTIONS.map((q) => <button key={q} onClick={() => ask(q)}>{q}</button>)}
              </div>
            </div>
            <div className="cta-preview">
              <div className="bubble user">Bạn đã làm việc với những công nghệ nào?</div>
              <div className="bubble bot" style={{ maxWidth: '90%' }}>
                {profile.name} làm việc chủ yếu với {cv.skills.slice(0, 3).map((s) => s.name).join(', ')}…
              </div>
              <button className="btn btn-aqua btn-lg" style={{ alignSelf: 'flex-start', marginTop: 8 }} onClick={() => ask()}>
                Bắt đầu trò chuyện <IconArrow />
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer id="contact" className="footer">
        <div className="container footer-inner">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: 24, fontWeight: 800 }}>Cùng làm điều gì đó tuyệt vời nhé!</span>
            {profile.email && <a href={`mailto:${profile.email}`} style={{ fontSize: 18, fontWeight: 600, textDecoration: 'none' }}>{profile.email}</a>}
          </div>
          <div className="footer-meta">
            <span>Hosted on GitHub Pages</span>
            <span>Cập nhật lần cuối: {formatDate(cv.updatedAt)}</span>
          </div>
        </div>
      </footer>

      <ChatWidget
        cv={cv}
        open={chatOpen}
        onOpenChange={setChatOpen}
        pendingQuestion={pendingQ}
        onQuestionConsumed={() => setPendingQ(null)}
      />
    </>
  );
}
