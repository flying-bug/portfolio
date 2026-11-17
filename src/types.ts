export interface Profile {
  name: string;
  title: string;
  bio: string;
  location: string;
  yearsOfExperience: string;
  openToWork: boolean;
  email: string;
  github: string;
  linkedin: string;
  avatarUrl: string;
  cvPdfUrl: string;
}

export interface Skill {
  id: string;
  name: string;
  group: string;
  /** 1 (mới học) → 5 (thành thạo) */
  level: number;
}

export interface Job {
  id: string;
  company: string;
  role: string;
  start: string;
  end: string;
  current: boolean;
  highlights: string[];
  tech: string[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  tech: string[];
  repoUrl: string;
  demoUrl: string;
  imageUrl: string;
  featured: boolean;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
}

export interface CV {
  profile: Profile;
  skills: Skill[];
  experience: Job[];
  projects: Project[];
  faq: Faq[];
  updatedAt: string;
}

export const LEVEL_LABELS = ['', 'Mới học', 'Cơ bản', 'Khá', 'Tốt', 'Thành thạo'];
