import { differenceInDays, parseISO, format, isValid } from 'date-fns';
import type { Medicine, ExpirationStatus } from '@/types';

export function getExpirationStatus(expirationDate: string): ExpirationStatus {
  try {
    const date = parseISO(expirationDate);
    if (!isValid(date)) return 'good';
    const days = differenceInDays(date, new Date());
    if (days < 0) return 'expired';
    if (days <= 30) return 'expiring';
    return 'good';
  } catch {
    return 'good';
  }
}

export function getDaysUntilExpiration(expirationDate: string): number {
  try {
    const date = parseISO(expirationDate);
    if (!isValid(date)) return 999;
    return differenceInDays(date, new Date());
  } catch {
    return 999;
  }
}

export function formatDate(dateString: string): string {
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return 'Invalid date';
    return format(date, 'MMM d, yyyy');
  } catch {
    return 'Invalid date';
  }
}

export function formatDateShort(dateString: string): string {
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return '—';
    return format(date, 'MM/dd/yy');
  } catch {
    return '—';
  }
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    adult: 'Adult',
    children: 'Children',
    emergency: 'Emergency',
    chronic_illness: 'Chronic Illness',
    other: 'Other',
  };
  return labels[category] || category;
}

export function getFormTypeLabel(formType: string): string {
  const labels: Record<string, string> = {
    tablets: 'Tablets',
    syrup: 'Syrup',
    injection: 'Injection',
    cream: 'Cream',
    drops: 'Drops',
    other: 'Other',
  };
  return labels[formType] || formType;
}

export function getStatusLabel(status: ExpirationStatus): string {
  const labels: Record<string, string> = {
    expired: 'Expired',
    expiring: 'Expiring Soon',
    good: 'Good',
  };
  return labels[status] || status;
}

export function isLowStock(quantity: number): boolean {
  return quantity <= 5;
}

export function getMedicineStatus(medicine: Medicine): {
  expirationStatus: ExpirationStatus;
  isLowStock: boolean;
  daysUntilExpiry: number;
} {
  const expirationStatus = getExpirationStatus(medicine.expirationDate);
  const daysUntilExpiry = getDaysUntilExpiration(medicine.expirationDate);
  return {
    expirationStatus,
    isLowStock: medicine.quantity <= 5,
    daysUntilExpiry,
  };
}

export function filterMedicines(
  medicines: Medicine[],
  searchQuery: string,
  categoryFilter: string | null,
  statusFilter: string | null
): Medicine[] {
  return medicines.filter((medicine) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchesName = medicine.name.toLowerCase().includes(q);
      const matchesIngredient = medicine.activeIngredient.toLowerCase().includes(q);
      if (!matchesName && !matchesIngredient) return false;
    }

    if (categoryFilter && medicine.category !== categoryFilter) return false;

    if (statusFilter) {
      const status = getExpirationStatus(medicine.expirationDate);
      if (statusFilter === 'expired' && status !== 'expired') return false;
      if (statusFilter === 'expiring' && status !== 'expiring') return false;
      if (statusFilter === 'emergency' && medicine.category !== 'emergency') return false;
      if (statusFilter === 'low_stock' && medicine.quantity > 5) return false;
    }

    return true;
  });
}

export function sortMedicines(
  medicines: Medicine[],
  sortBy: string
): Medicine[] {
  const sorted = [...medicines];
  switch (sortBy) {
    case 'name':
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'expiration':
      sorted.sort((a, b) => new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime());
      break;
    case 'quantity':
      sorted.sort((a, b) => a.quantity - b.quantity);
      break;
    case 'category':
      sorted.sort((a, b) => a.category.localeCompare(b.category));
      break;
    default:
      break;
  }
  return sorted;
}

export function calculateEmergencyReadiness(medicines: Medicine[]) {
  const emergencyChecks = [
    { key: 'paracetamol', label: 'Paracetamol' },
    { key: 'bandages', label: 'Bandages' },
    { key: 'antiseptic', label: 'Antiseptic' },
    { key: 'allergy', label: 'Allergy Medicine' },
    { key: 'thermometer', label: 'Thermometer' },
    { key: 'gloves', label: 'Gloves' },
  ];

  const found: string[] = [];
  const missing: string[] = [];

  for (const item of emergencyChecks) {
    const hasItem = medicines.some((m) =>
      m.name.toLowerCase().includes(item.key) ||
      m.activeIngredient.toLowerCase().includes(item.key)
    );
    if (hasItem) {
      found.push(item.label);
    } else {
      missing.push(item.label);
    }
  }

  const score = Math.round((found.length / emergencyChecks.length) * 100);

  let status: 'Weak' | 'Moderate' | 'Excellent';
  if (score >= 80) status = 'Excellent';
  else if (score >= 50) status = 'Moderate';
  else status = 'Weak';

  return { score, found, missing, status, checks: emergencyChecks };
}

export function getReadinessStatus(score: number): 'Weak' | 'Moderate' | 'Excellent' {
  if (score >= 80) return 'Excellent';
  if (score >= 50) return 'Moderate';
  return 'Weak';
}
