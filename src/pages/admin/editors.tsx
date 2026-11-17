import { useState, type FormEvent } from 'react';
import { IconDown, IconEdit, IconPlus, IconTrash, IconUp } from '../../components/Icons';
import type { Profile } from '../../types';

// ---------- Field definitions ----------
export type FieldType = 'text' | 'textarea' | 'select' | 'level' | 'tags' | 'lines' | 'checkbox' | 'url';

export interface FieldDef<T> {
  key: keyof T & string;
  label: string;
  type: FieldType;
  placeholder?: string;
  options?: string[];
  hint?: string;
  required?: boolean;
}

type Draft = Record<string, string | boolean>;

function toDraft<T>(item: T, fields: FieldDef<T>[]): Draft {
  const d: Draft = {};
  for (const f of fields) {
    const v = item[f.key] as unknown;
    if (f.type === 'checkbox') d[f.key] = Boolean(v);
    else if (f.type === 'tags') d[f.key] = Array.isArray(v) ? v.join(', ') : '';
    else if (f.type === 'lines') d[f.key] = Array.isArray(v) ? v.join('\n') : '';
    else d[f.key] = v == null ? '' : String(v);
  }
  return d;
}

function fromDraft<T>(base: T, d: Draft, fields: FieldDef<T>[], trim = true): T {
  const out = { ...base } as Record<string, unknown>;
  for (const f of fields) {
    const v = d[f.key];
    if (f.type === 'checkbox') out[f.key] = Boolean(v);
    else if (f.type === 'level') out[f.key] = Math.min(5, Math.max(1, Number(v) || 3));
    else if (f.type === 'tags') out[f.key] = String(v).split(',').map((s) => s.trim()).filter(Boolean);
    else if (f.type === 'lines') out[f.key] = String(v).split('\n').map((s) => s.trim()).filter(Boolean);
    else out[f.key] = trim ? String(v).trim() : String(v);
  }
  return out as T;
}

function FieldInput({ id, def, value, onChange }: {
  id: string;
  def: FieldDef<unknown>;
  value: string | boolean;
  onChange: (v: string | boolean) => void;
}) {
  if (def.type === 'checkbox') {
    return (
      <label className="check">
        <input type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} />
        {def.label}
      </label>
    );
  }
  const common = { id, className: 'input', value: String(value), placeholder: def.placeholder };
  let control;
  if (def.type === 'textarea' || def.type === 'lines') {
    control = <textarea {...common} rows={def.type === 'lines' ? 4 : 3} onChange={(e) => onChange(e.target.value)} />;
  } else if (def.type === 'select') {
    control = (
      <>
        <input {...common} list={`${id}-list`} onChange={(e) => onChange(e.target.value)} />
        <datalist id={`${id}-list`}>{def.options?.map((o) => <option key={o} value={o} />)}</datalist>
      </>
    );
  } else if (def.type === 'level') {
    control = (
      <select {...common} onChange={(e) => onChange(e.target.value)}>
        <option value="5">5 · Thành thạo</option>
        <option value="4">4 · Tốt</option>
        <option value="3">3 · Khá</option>
        <option value="2">2 · Cơ bản</option>
        <option value="1">1 · Mới học</option>
      </select>
    );
  } else {
    control = <input {...common} type={def.type === 'url' ? 'url' : 'text'} required={def.required} onChange={(e) => onChange(e.target.value)} />;
  }
  return (
    <div className="field">
      <label htmlFor={id}>{def.label}{def.required && ' *'}</label>
      {control}
      {def.hint && <span className="hint">{def.hint}</span>}
    </div>
  );
}

// ---------- Generic list editor ----------
export function ListEditor<T extends { id: string }>({ title, formTitle, items, fields, empty, summary, onChange }: {
  title: string;
  formTitle: string;
  items: T[];
  fields: FieldDef<T>[];
  empty: () => T;
  summary: (item: T) => { title: string; sub: string; meta?: string };
  onChange: (items: T[]) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(() => toDraft(empty(), fields));

  function startEdit(item: T) {
    setEditingId(item.id);
    setDraft(toDraft(item, fields));
  }

  function reset() {
    setEditingId(null);
    setDraft(toDraft(empty(), fields));
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    const missing = fields.find((f) => f.required && !String(draft[f.key] ?? '').trim());
    if (missing) return;
    if (editingId) {
      onChange(items.map((it) => (it.id === editingId ? fromDraft(it, draft, fields) : it)));
    } else {
      onChange([...items, fromDraft(empty(), draft, fields)]);
    }
    reset();
  }

  function remove(item: T) {
    const s = summary(item);
    if (!window.confirm(`Xoá "${s.title}"? (Chỉ áp dụng khi bạn bấm Lưu & đẩy lên GitHub)`)) return;
    onChange(items.filter((it) => it.id !== item.id));
    if (editingId === item.id) reset();
  }

  function move(index: number, dir: -1 | 1) {
    const j = index + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[index], next[j]] = [next[j], next[index]];
    onChange(next);
  }

  return (
    <div className="admin-grid">
      <section className="panel list-panel" aria-label={title}>
        <div className="panel-head">
          <span>{title}</span>
          <span className="chip">{items.length}</span>
        </div>
        {items.length === 0 && <div className="empty">Chưa có mục nào — thêm mục đầu tiên ở khung bên cạnh.</div>}
        {items.map((it, i) => {
          const s = summary(it);
          return (
            <div key={it.id} className={`row-item${editingId === it.id ? ' editing' : ''}`}>
              <div className="row-main">
                <strong>{s.title || '(chưa đặt tên)'}</strong>
                <span>{s.sub}</span>
              </div>
              {s.meta && <span className="chip" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>{s.meta}</span>}
              <div className="row-tools">
                <button className="btn btn-outline btn-icon" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Đưa lên"><IconUp size={16} /></button>
                <button className="btn btn-outline btn-icon" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label="Đưa xuống"><IconDown size={16} /></button>
                <button className="btn btn-outline btn-icon" onClick={() => startEdit(it)} aria-label={`Sửa ${s.title}`}><IconEdit size={16} /></button>
                <button className="btn btn-danger btn-icon" onClick={() => remove(it)} aria-label={`Xoá ${s.title}`}><IconTrash size={16} /></button>
              </div>
            </div>
          );
        })}
      </section>

      <form className="panel form-panel" onSubmit={submit}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="chip" style={{ width: 36, height: 36, justifyContent: 'center', padding: 0, borderRadius: 10 }}>
            {editingId ? <IconEdit size={16} /> : <IconPlus size={18} />}
          </span>
          <h2>{editingId ? 'Sửa mục' : formTitle}</h2>
        </div>
        {fields.map((f) => (
          <FieldInput
            key={f.key}
            id={`f-${f.key}`}
            def={f as FieldDef<unknown>}
            value={draft[f.key] ?? ''}
            onChange={(v) => setDraft((d) => ({ ...d, [f.key]: v }))}
          />
        ))}
        <div className="form-actions">
          <button type="button" className="btn btn-outline" onClick={reset}>Huỷ</button>
          <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>{editingId ? 'Cập nhật' : 'Thêm vào CV'}</button>
        </div>
        <span className="hint" style={{ fontSize: 12, color: 'var(--muted-2)', lineHeight: 1.5 }}>
          Thay đổi được lưu nháp. Bấm “Lưu &amp; đẩy lên GitHub” để cập nhật trang CV và chatbot.
        </span>
      </form>
    </div>
  );
}

// ---------- Profile editor ----------
const PROFILE_FIELDS: FieldDef<Profile>[] = [
  { key: 'name', label: 'Họ tên', type: 'text', required: true },
  { key: 'title', label: 'Chức danh', type: 'text', placeholder: 'Full-stack Developer' },
  { key: 'location', label: 'Nơi ở', type: 'text', placeholder: 'Hà Nội, Việt Nam' },
  { key: 'yearsOfExperience', label: 'Số năm kinh nghiệm', type: 'text', placeholder: '3+' },
  { key: 'email', label: 'Email', type: 'text' },
  { key: 'github', label: 'GitHub URL', type: 'url' },
  { key: 'linkedin', label: 'LinkedIn URL', type: 'url' },
  { key: 'avatarUrl', label: 'Ảnh đại diện (URL)', type: 'text', hint: 'Có thể đặt ảnh vào thư mục public/ rồi ghi tên file, ví dụ avatar.jpg' },
  { key: 'cvPdfUrl', label: 'File CV PDF (URL)', type: 'text', hint: 'Ví dụ: cv.pdf (đặt trong public/)' },
  { key: 'bio', label: 'Giới thiệu ngắn', type: 'textarea' },
  { key: 'openToWork', label: 'Hiển thị “Đang tìm cơ hội mới”', type: 'checkbox' },
];

export function ProfileEditor({ profile, onChange }: { profile: Profile; onChange: (p: Profile) => void }) {
  const draft = toDraft(profile, PROFILE_FIELDS);
  return (
    <section className="panel" aria-label="Hồ sơ">
      <div className="panel-head">Thông tin cá nhân</div>
      <div className="profile-form">
        {PROFILE_FIELDS.map((f) => (
          <div key={f.key} className={f.type === 'textarea' || f.type === 'checkbox' ? 'wide' : undefined}>
            <FieldInput
              id={`p-${f.key}`}
              def={f as FieldDef<unknown>}
              value={draft[f.key]}
              onChange={(v) => onChange(fromDraft(profile, { ...draft, [f.key]: v }, PROFILE_FIELDS, false))}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
