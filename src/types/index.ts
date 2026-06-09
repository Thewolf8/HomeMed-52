export interface Medicine {
  id: string;
  name: string;
  activeIngredient: string;
  dosage: string;
  formType: 'tablets' | 'syrup' | 'injection' | 'cream' | 'drops' | 'other';
  quantity: number;
  expirationDate: string;
  usageInstructions: string;
  category: 'adult' | 'children' | 'emergency' | 'chronic_illness' | 'other';
  prescriptionRequired: boolean;
  notes: string;
  image: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AppSettings {
  theme: 'dark' | 'light';
  defaultExportFormat: 'pdf' | 'txt' | 'json';
  includeNotes: boolean;
  includeImages: boolean;
}

export interface FilterState {
  searchQuery: string;
  categoryFilter: string | null;
  statusFilter: 'all' | 'expired' | 'expiring' | 'emergency' | 'low_stock' | null;
  sortBy: 'name' | 'expiration' | 'quantity' | 'category';
  viewMode: 'grid' | 'list';
}

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  undo?: () => void;
}

export type ExpirationStatus = 'expired' | 'expiring' | 'good';

export type ViewTab = 'dashboard' | 'medicines' | 'add' | 'export' | 'settings';

export type FormType = 'tablets' | 'syrup' | 'injection' | 'cream' | 'drops' | 'other';
export type Category = 'adult' | 'children' | 'emergency' | 'chronic_illness' | 'other';

export const FORM_TYPES = ['tablets', 'syrup', 'injection', 'cream', 'drops', 'other'] as const;
export const CATEGORIES = ['adult', 'children', 'emergency', 'chronic_illness', 'other'] as const;

export const EMERGENCY_ITEMS = [
  { key: 'paracetamol', label: 'Paracetamol' },
  { key: 'bandages', label: 'Bandages' },
  { key: 'antiseptic', label: 'Antiseptic' },
  { key: 'allergy', label: 'Allergy Medicine' },
  { key: 'thermometer', label: 'Thermometer' },
  { key: 'gloves', label: 'Gloves' },
] as const;

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  defaultExportFormat: 'pdf',
  includeNotes: true,
  includeImages: false,
};

export const DEFAULT_FILTERS: FilterState = {
  searchQuery: '',
  categoryFilter: null,
  statusFilter: null,
  sortBy: 'name',
  viewMode: 'grid',
};
