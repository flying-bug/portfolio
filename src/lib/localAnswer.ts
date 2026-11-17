import type { CV } from '../types';
import { LEVEL_LABELS } from '../types';

/** Bỏ dấu tiếng Việt + chữ thường, để so khớp từ khoá. */
function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd');
}

function words(s: string): string[] {
  return norm(s)
    .split(/[^a-z0-9.+#/]+/)
    .filter((w) => w.length > 1);
}

const has = (q: string, keys: string[]) => keys.some((k) => q.includes(k));

/**
 * Trả lời khi chưa cấu hình chatbot AI: so khớp FAQ, rồi dùng dữ liệu CV.
 */
export function localAnswer(cv: CV, question: string): string {
  const q = norm(question);
  const qWords = new Set(words(question));
  const name = cv.profile.name;

  // 1) FAQ: chọn câu có nhiều từ trùng nhất
  let best: { score: number; answer: string } | null = null;
  for (const f of cv.faq) {
    const fw = words(f.question);
    const score = fw.filter((w) => qWords.has(w)).length / Math.max(fw.length, 1);
    if (!best || score > best.score) best = { score, answer: f.answer };
  }
  if (best && best.score >= 0.5) return best.answer;

  // 2) Hỏi về một kỹ năng cụ thể
  const skill = cv.skills.find((s) => words(s.name).some((w) => w.length > 2 && qWords.has(w)));
  if (skill) {
    const jobs = cv.experience.filter((j) => j.tech.some((t) => norm(t).includes(norm(skill.name.split(/[ /]/)[0]))));
    const where = jobs.length ? ` Đã dùng tại: ${jobs.map((j) => j.company).join(', ')}.` : '';
    return `${name} có kỹ năng ${skill.name} ở mức "${LEVEL_LABELS[skill.level]}" (${skill.level}/5).${where}`;
  }

  if (has(q, ['ky nang', 'skill', 'cong nghe', 'tech', 'stack'])) {
    const groups = [...new Set(cv.skills.map((s) => s.group))];
    return groups
      .map((g) => `${g}: ${cv.skills.filter((s) => s.group === g).map((s) => s.name).join(', ')}`)
      .join('\n');
  }

  if (has(q, ['kinh nghiem', 'lam viec', 'cong ty', 'experience', 'work'])) {
    return (
      `${name} có ${cv.profile.yearsOfExperience} năm kinh nghiệm:\n` +
      cv.experience
        .map((j) => `• ${j.role} tại ${j.company} (${j.start} – ${j.current ? 'nay' : j.end})`)
        .join('\n')
    );
  }

  if (has(q, ['du an', 'project', 'san pham'])) {
    return cv.projects.map((p) => `• ${p.name}: ${p.description}`).join('\n');
  }

  if (has(q, ['lien he', 'email', 'contact', 'so dien thoai'])) {
    return `Bạn có thể liên hệ ${name} qua email ${cv.profile.email}.`;
  }

  if (has(q, ['gioi thieu', 'ban la ai', 'about', 'who'])) {
    return `${name} — ${cv.profile.title}. ${cv.profile.bio}`;
  }

  return `Mình chưa có thông tin cho câu hỏi này. Bạn có thể hỏi về kỹ năng, kinh nghiệm, dự án, hoặc liên hệ trực tiếp ${name} qua ${cv.profile.email}.`;
}
