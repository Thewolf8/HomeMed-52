import { createContext, useContext, useCallback, type ReactNode } from 'react';
import type { Medicine, FilterState } from '@/types';
import { DEFAULT_FILTERS } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { generateId } from '@/utils/helpers';

interface MedicineContextType {
  medicines: Medicine[];
  filters: FilterState;
  addMedicine: (medicine: Omit<Medicine, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateMedicine: (id: string, updates: Partial<Medicine>) => void;
  deleteMedicine: (id: string) => void;
  setFilters: (filters: Partial<FilterState>) => void;
  resetFilters: () => void;
  getMedicineById: (id: string) => Medicine | undefined;
  recentlyDeleted: Medicine | null;
  undoDelete: () => void;
  clearUndo: () => void;
}

const MedicineContext = createContext<MedicineContextType | null>(null);

export function MedicineProvider({ children }: { children: ReactNode }) {
  const [medicines, setMedicines] = useLocalStorage<Medicine[]>('homemed_medicines', []);
  const [filters, setFiltersState] = useLocalStorage<FilterState>('homemed_filters', DEFAULT_FILTERS);
  const [recentlyDeleted, setRecentlyDeleted] = useLocalStorage<Medicine | null>('homemed_deleted', null);

  const addMedicine = useCallback((medicine: Omit<Medicine, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newMedicine: Medicine = {
      ...medicine,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    setMedicines((prev) => [...prev, newMedicine]);
  }, [setMedicines]);

  const updateMedicine = useCallback((id: string, updates: Partial<Medicine>) => {
    setMedicines((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, ...updates, updatedAt: new Date().toISOString() } : m
      )
    );
  }, [setMedicines]);

  const deleteMedicine = useCallback((id: string) => {
    setMedicines((prev) => {
      const medicine = prev.find((m) => m.id === id);
      if (medicine) {
        setRecentlyDeleted(medicine);
        setTimeout(() => {
          setRecentlyDeleted(null);
        }, 30000);
      }
      return prev.filter((m) => m.id !== id);
    });
  }, [setMedicines, setRecentlyDeleted]);

  const undoDelete = useCallback(() => {
    if (recentlyDeleted) {
      setMedicines((prev) => [...prev, recentlyDeleted]);
      setRecentlyDeleted(null);
    }
  }, [recentlyDeleted, setMedicines, setRecentlyDeleted]);

  const clearUndo = useCallback(() => {
    setRecentlyDeleted(null);
  }, [setRecentlyDeleted]);

  const setFilters = useCallback((newFilters: Partial<FilterState>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
  }, [setFiltersState]);

  const resetFilters = useCallback(() => {
    setFiltersState(DEFAULT_FILTERS);
  }, [setFiltersState]);

  const getMedicineById = useCallback((id: string) => {
    return medicines.find((m) => m.id === id);
  }, [medicines]);

  return (
    <MedicineContext.Provider
      value={{
        medicines,
        filters,
        addMedicine,
        updateMedicine,
        deleteMedicine,
        setFilters,
        resetFilters,
        getMedicineById,
        recentlyDeleted,
        undoDelete,
        clearUndo,
      }}
    >
      {children}
    </MedicineContext.Provider>
  );
}

export function useMedicineContext() {
  const ctx = useContext(MedicineContext);
  if (!ctx) throw new Error('useMedicineContext must be used within MedicineProvider');
  return ctx;
}
