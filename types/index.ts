export type UserRole = 'employer' | 'worker' | null;

export type JobCategory =
  | 'Dasturchi'
  | 'Designer'
  | 'Video Editor'
  | 'Mobile Developer'
  | 'Marketing'
  | 'Writer'
  | 'Other';

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  age: number;
  role: UserRole;
  avatar?: string;
  createdAt: string;
  isAdmin?: boolean;
  // Employer fields
  companyName?: string;
  companyPhone?: string;
  companyCategories?: JobCategory[];
  // Worker fields
  workField?: JobCategory;
  portfolioImages?: string[];
  hasPortfolio?: boolean;
  totalRating?: number;
  ratingCount?: number;
  likedJobs?: string[];
  // Payment fields (ishchi pul olish uchun karta raqami)
  cardNumber?: string;
  cardHolderName?: string;
}

export interface JobPost {
  id: string;
  employerId: string;
  employerName: string;
  companyName: string;
  title: string;
  description: string;
  category: JobCategory;
  budget?: number;
  currency?: string;
  deadline: string;
  createdAt: string;
  expiresAt: string;
  isActive: boolean;
  likes: number;
  likedBy: string[];
  averageRating: number;
  ratingCount: number;
  // Komissiya: agar budget bo'lsa, e'lon chop etilishidan oldin 1% komissiya to'lanishi kerak
  commissionAmount?: number;
  commissionPaid?: boolean;
  commissionPaidAt?: string;
}

export interface Rating {
  id: string;
  jobId: string;
  workerId: string;
  employerId: string;
  stars: number;
  createdAt: string;
}

export interface SavedJob {
  jobId: string;
  savedAt: string;
}

// Platforma sozlamalari — admin karta raqami va komissiya foizi
export interface PlatformSettings {
  adminCardNumber: string;
  adminCardHolder: string;
  commissionRate: number; // 0.01 = 1%
}
