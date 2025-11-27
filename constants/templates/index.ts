import { PUBLIC_AVATARS, type PublicAvatar } from "@/constants/avatar/publicAvatars";

// Re-export PublicAvatar for use in components
export type { PublicAvatar };
export { PUBLIC_AVATARS };

// ============================================================================
// FILTER TYPES
// ============================================================================

export type AvatarTypeFilter = 
  | "all" 
  | "professional" 
  | "lifelike" 
  | "flagship" 
  | "ai_generated" 
  | "ugc" 
  | "sora";

export type GenderFilter = "all" | "male" | "female";

export type OrientationFilter = "all" | "portrait" | "landscape";

export type QualityFilter = "all" | "high" | "medium" | "low";

// ============================================================================
// FILTER OPTIONS
// ============================================================================

export const AVATAR_TYPE_OPTIONS: { id: AvatarTypeFilter; label: string }[] = [
  { id: "all", label: "All Types" },
  { id: "professional", label: "Professional" },
  { id: "lifelike", label: "Lifelike" },
  { id: "flagship", label: "Flagship" },
  { id: "ai_generated", label: "AI Generated" },
  { id: "ugc", label: "UGC" },
  { id: "sora", label: "Sora AI" },
];

export const GENDER_OPTIONS: { id: GenderFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "female", label: "Female" },
  { id: "male", label: "Male" },
];

export const ORIENTATION_OPTIONS: { id: OrientationFilter; label: string }[] = [
  { id: "all", label: "All Ratios" },
  { id: "portrait", label: "Portrait (9:16)" },
  { id: "landscape", label: "Landscape (16:9)" },
];

export const QUALITY_OPTIONS: { id: QualityFilter; label: string }[] = [
  { id: "all", label: "All Quality" },
  { id: "high", label: "High Quality" },
  { id: "medium", label: "Medium" },
  { id: "low", label: "Low" },
];

// ============================================================================
// FILTER FUNCTIONS
// ============================================================================

export interface AvatarFilters {
  type?: AvatarTypeFilter;
  gender?: GenderFilter;
  orientation?: OrientationFilter;
  quality?: QualityFilter;
  search?: string;
  isPremium?: boolean | null;
}

/**
 * Map avatar type string to filter type
 */
function mapAvatarType(avatarType: string): AvatarTypeFilter {
  const typeMap: Record<string, AvatarTypeFilter> = {
    'PROFESSIONAL': 'professional',
    'LIFELIKE': 'lifelike',
    'FLAGSHIP': 'flagship',
    'AI_GENERATED_BATCH_2': 'ai_generated',
    'UGC': 'ugc',
    'UGC_PHOTO': 'ugc',
    'SORA_AI_GENERATED': 'sora',
  };
  return typeMap[avatarType] || 'professional';
}

/**
 * Filter avatars based on multiple criteria
 */
export function filterAvatars(filters: AvatarFilters = {}): PublicAvatar[] {
  const { type, gender, orientation, quality, search, isPremium } = filters;

  return PUBLIC_AVATARS.filter((avatar) => {
    // Type filter
    if (type && type !== "all") {
      const mappedType = mapAvatarType(avatar.avatarType);
      if (mappedType !== type) return false;
    }

    // Gender filter
    if (gender && gender !== "all" && avatar.gender !== gender) {
      return false;
    }

    // Orientation filter
    if (orientation && orientation !== "all" && avatar.orientation !== orientation) {
      return false;
    }

    // Quality filter
    if (quality && quality !== "all" && avatar.quality !== quality) {
      return false;
    }

    // Premium filter
    if (isPremium !== null && isPremium !== undefined && avatar.isPremium !== isPremium) {
      return false;
    }

    // Search filter
    if (search && search.trim()) {
      const searchLower = search.toLowerCase();
      const nameMatch = avatar.name.toLowerCase().includes(searchLower);
      const tagMatch = avatar.tags.some(tag => tag.toLowerCase().includes(searchLower));
      if (!nameMatch && !tagMatch) return false;
    }

    return true;
  });
}

/**
 * Get avatar type display label
 */
export function getAvatarTypeLabel(avatarType: string): string {
  const labelMap: Record<string, string> = {
    'PROFESSIONAL': 'Professional',
    'LIFELIKE': 'Lifelike',
    'FLAGSHIP': 'Flagship',
    'AI_GENERATED_BATCH_2': 'AI Generated',
    'UGC': 'UGC',
    'UGC_PHOTO': 'UGC Photo',
    'SORA_AI_GENERATED': 'Sora AI',
  };
  return labelMap[avatarType] || avatarType;
}

/**
 * Get avatar count by type
 */
export function getAvatarCountByType(): Record<AvatarTypeFilter, number> {
  const counts: Record<AvatarTypeFilter, number> = {
    all: PUBLIC_AVATARS.length,
    professional: 0,
    lifelike: 0,
    flagship: 0,
    ai_generated: 0,
    ugc: 0,
    sora: 0,
  };

  PUBLIC_AVATARS.forEach((avatar) => {
    const type = mapAvatarType(avatar.avatarType);
    counts[type]++;
  });

  return counts;
}

/**
 * Get avatar count by gender
 */
export function getAvatarCountByGender(): Record<GenderFilter, number> {
  const counts: Record<GenderFilter, number> = {
    all: PUBLIC_AVATARS.length,
    male: 0,
    female: 0,
  };

  PUBLIC_AVATARS.forEach((avatar) => {
    if (avatar.gender === 'male') counts.male++;
    else if (avatar.gender === 'female') counts.female++;
  });

  return counts;
}

/**
 * Search avatars by name or tags
 */
export function searchAvatars(query: string): PublicAvatar[] {
  if (!query.trim()) return PUBLIC_AVATARS;
  
  const lowerQuery = query.toLowerCase();
  return PUBLIC_AVATARS.filter(
    (avatar) =>
      avatar.name.toLowerCase().includes(lowerQuery) ||
      avatar.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Get a single avatar by ID
 */
export function getAvatarById(id: string): PublicAvatar | undefined {
  return PUBLIC_AVATARS.find((avatar) => avatar.id === id);
}

/**
 * Sort avatars by different criteria
 */
export type SortBy = 'name' | 'score' | 'createdAt' | 'looks';

export function sortAvatars(avatars: PublicAvatar[], sortBy: SortBy, ascending = true): PublicAvatar[] {
  return [...avatars].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'score':
        comparison = a.debugScore - b.debugScore;
        break;
      case 'createdAt':
        comparison = a.createdAt - b.createdAt;
        break;
      case 'looks':
        comparison = a.numLooks - b.numLooks;
        break;
    }
    
    return ascending ? comparison : -comparison;
  });
}
