import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ChevronDown,
  LayoutGrid,
  List,
  Pencil,
  Trash2,
  Package,
} from 'lucide-react';
import { GlassCard } from '@/components/GlassCard';
import { CategoryBadge } from '@/components/CategoryBadge';
import { StatusBadge } from '@/components/StatusBadge';
import { EmptyState } from '@/components/EmptyState';
import { ConfirmationDialog } from '@/components/ConfirmationDialog';
import { useMedicineContext } from '@/context/MedicineContext';
import { useToastContext } from '@/context/ToastContext';
import {
  getExpirationStatus,
  getDaysUntilExpiration,
  formatDate,
  filterMedicines,
  sortMedicines,
  getFormTypeLabel,
  isLowStock,
} from '@/utils/helpers';
import type { Medicine, ViewTab } from '@/types';
import type { FilterState } from '@/types';

interface MedicineListProps {
  onNavigate: (tab: ViewTab) => void;
  onEdit: (id: string) => void;
}

const filterOptions = [
  { key: 'all', label: 'All' },
  { key: 'adult', label: 'Adult' },
  { key: 'children', label: 'Children' },
  { key: 'emergency', label: 'Emergency' },
  { key: 'expired', label: 'Expired' },
  { key: 'expiring', label: 'Expiring' },
  { key: 'low_stock', label: 'Low Stock' },
] as const;

const sortOptions = [
  { key: 'name' as const, label: 'Name' },
  { key: 'expiration' as const, label: 'Expiration Date' },
  { key: 'quantity' as const, label: 'Quantity' },
  { key: 'category' as const, label: 'Category' },
] as const;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
};

function MedicineDetail({ medicine, isExpanded }: { medicine: Medicine; isExpanded: boolean }) {
  return (
    <AnimatePresence>
      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="overflow-hidden"
        >
          <div className="mt-3 space-y-2 border-t border-slate-700/30 pt-3 text-sm">
            {medicine.activeIngredient && (
              <div>
                <span className="text-xs text-slate-500">Active Ingredient</span>
                <p className="text-slate-300">{medicine.activeIngredient}</p>
              </div>
            )}
            <div>
              <span className="text-xs text-slate-500">Form Type</span>
              <p className="text-slate-300">{getFormTypeLabel(medicine.formType)}</p>
            </div>
            {medicine.prescriptionRequired && (
              <div>
                <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-400">
                  Prescription Required
                </span>
              </div>
            )}
            {medicine.usageInstructions && (
              <div>
                <span className="text-xs text-slate-500">Usage Instructions</span>
                <p className="text-slate-300">{medicine.usageInstructions}</p>
              </div>
            )}
            {medicine.notes && (
              <div>
                <span className="text-xs text-slate-500">Notes</span>
                <p className="text-slate-300">{medicine.notes}</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function GridCard({ medicine, onEdit, onDelete, expandedId, onToggleExpand }: {
  medicine: Medicine;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  expandedId: string | null;
  onToggleExpand: (id: string) => void;
}) {
  const status = getExpirationStatus(medicine.expirationDate);
  const days = getDaysUntilExpiration(medicine.expirationDate);
  const isExpired = status === 'expired';
  const isExpanded = expandedId === medicine.id;

  return (
    <motion.div variants={cardVariants} layout exit={cardVariants.exit}>
      <GlassCard
        className={`${isExpired ? 'border-l-[3px] border-l-red-500 bg-red-500/[0.03]' : ''}`}
      >
        <div
          className="cursor-pointer"
          onClick={() => onToggleExpand(medicine.id)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className={`text-sm font-semibold ${isExpired ? 'text-red-400 line-through' : 'text-slate-100'}`}>
                {medicine.name}
              </p>
              <p className="mt-0.5 text-xs text-slate-400">{medicine.dosage}</p>
            </div>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown className="h-4 w-4 text-slate-500" />
            </motion.div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <CategoryBadge category={medicine.category} />
            <StatusBadge status={status} />
            {isLowStock(medicine.quantity) && (
              <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-400">
                Low Stock
              </span>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span>Qty: {medicine.quantity}</span>
            <span className={isExpired ? 'text-red-400' : days <= 30 ? 'text-amber-400' : 'text-slate-500'}>
              {formatDate(medicine.expirationDate)}
            </span>
          </div>
        </div>

        <MedicineDetail medicine={medicine} isExpanded={isExpanded} />

        <div className="mt-3 flex items-center gap-2 border-t border-slate-700/30 pt-3">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(medicine.id); }}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(medicine.id); }}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </GlassCard>
    </motion.div>
  );
}

function ListRow({ medicine, onEdit, onDelete, expandedId, onToggleExpand }: {
  medicine: Medicine;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  expandedId: string | null;
  onToggleExpand: (id: string) => void;
}) {
  const status = getExpirationStatus(medicine.expirationDate);
  const days = getDaysUntilExpiration(medicine.expirationDate);
  const isExpired = status === 'expired';
  const isExpanded = expandedId === medicine.id;

  return (
    <motion.div
      variants={cardVariants}
      layout
      exit={cardVariants.exit}
      className={`rounded-2xl border border-[rgba(94,234,212,0.12)] bg-gradient-to-br from-[rgba(21,29,46,0.7)] to-[rgba(15,23,42,0.5)] backdrop-blur-[10px] ${
        isExpired ? 'border-l-[3px] border-l-red-500 bg-red-500/[0.03]' : ''
      }`}
    >
      <div
        className="flex cursor-pointer items-center gap-4 p-4"
        onClick={() => onToggleExpand(medicine.id)}
      >
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-teal-500/20">
          <Package className="h-4 w-4 text-teal-400" />
        </div>

        <div className="flex-1 min-w-0">
          <p className={`truncate text-sm font-semibold ${isExpired ? 'text-red-400 line-through' : 'text-slate-100'}`}>
            {medicine.name}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400">{medicine.dosage}</span>
            <CategoryBadge category={medicine.category} />
            {isLowStock(medicine.quantity) && (
              <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-400">
                Qty: {medicine.quantity}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-shrink-0 items-center gap-3">
          <span className={`text-xs ${isExpired ? 'text-red-400' : days <= 30 ? 'text-amber-400' : 'text-slate-500'}`}>
            {formatDate(medicine.expirationDate)}
          </span>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronDown className="h-4 w-4 text-slate-500" />
          </motion.div>
        </div>
      </div>

      <div className="px-4 pb-4">
        <MedicineDetail medicine={medicine} isExpanded={isExpanded} />
        {isExpanded && (
          <div className="mt-3 flex items-center gap-2 border-t border-slate-700/30 pt-3">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(medicine.id); }}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(medicine.id); }}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function MedicineList({ onNavigate, onEdit }: MedicineListProps) {
  const { medicines, filters, setFilters, deleteMedicine, undoDelete } = useMedicineContext();
  const { addToast } = useToastContext();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState(filters.searchQuery);

  const filtered = filterMedicines(
    medicines,
    filters.searchQuery,
    filters.categoryFilter,
    filters.statusFilter
  );
  const sorted = sortMedicines(filtered, filters.sortBy);

  const handleSearch = (value: string) => {
    setSearchInput(value);
    setFilters({ searchQuery: value });
  };

  const handleFilterChip = (key: string) => {
    if (key === 'all') {
      setFilters({ categoryFilter: null, statusFilter: null });
    } else if (['adult', 'children', 'emergency'].includes(key)) {
      setFilters({
        categoryFilter: filters.categoryFilter === key ? null : key,
        statusFilter: null,
      });
    } else {
      setFilters({
        statusFilter: filters.statusFilter === key ? null : (key as FilterState['statusFilter']),
        categoryFilter: null,
      });
    }
  };

  const handleDelete = (id: string) => {
    deleteMedicine(id);
    addToast('Medicine deleted', 'success', undoDelete);
    setDeleteId(null);
  };

  const isChipActive = (key: string) => {
    if (key === 'all') return !filters.categoryFilter && !filters.statusFilter;
    if (['adult', 'children', 'emergency'].includes(key)) return filters.categoryFilter === key;
    return filters.statusFilter === key;
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {/* Search Bar */}
      <motion.div variants={cardVariants}>
        <div className="flex items-center gap-2 rounded-2xl border border-[rgba(94,234,212,0.12)] bg-[rgba(21,29,46,0.6)] px-4 py-2.5 backdrop-blur-[10px]">
          <Search className="h-[18px] w-[18px] flex-shrink-0 text-slate-500" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search medicines by name or ingredient..."
            className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 outline-none"
          />
        </div>
      </motion.div>

      {/* Filter Chips */}
      <motion.div variants={cardVariants} className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {filterOptions.map((opt) => (
          <button
            key={opt.key}
            onClick={() => handleFilterChip(opt.key)}
            className={`flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
              isChipActive(opt.key)
                ? 'bg-teal-500 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-300'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </motion.div>

      {/* Sort + View Toggle */}
      <motion.div variants={cardVariants} className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Sort by</span>
          <select
            value={filters.sortBy}
            onChange={(e) => setFilters({ sortBy: e.target.value as FilterState['sortBy'] })}
            className="rounded-lg border-none bg-slate-800 py-1.5 pl-3 pr-8 text-xs text-slate-300 outline-none focus:ring-1 focus:ring-teal-500/50"
          >
            {sortOptions.map((opt) => (
              <option key={opt.key} value={opt.key}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-1 rounded-lg bg-slate-800 p-1">
          <button
            onClick={() => setFilters({ viewMode: 'grid' })}
            className={`rounded-md p-1.5 transition-colors ${
              filters.viewMode === 'grid' ? 'bg-teal-500 text-white' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setFilters({ viewMode: 'list' })}
            className={`rounded-md p-1.5 transition-colors ${
              filters.viewMode === 'list' ? 'bg-teal-500 text-white' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </motion.div>

      {/* Results Count */}
      <div className="text-xs text-slate-500">
        {sorted.length} medicine{sorted.length !== 1 ? 's' : ''}
      </div>

      {/* Medicine Grid/List */}
      {sorted.length === 0 ? (
        <motion.div variants={cardVariants}>
          <GlassCard>
            <EmptyState
              icon={<Search className="h-16 w-16 text-slate-600" />}
              title="No medicines found"
              description={medicines.length === 0 ? "Start by adding your first medicine." : "Try adjusting your search or filters."}
              action={
                medicines.length === 0 ? (
                  <button
                    onClick={() => onNavigate('add')}
                    className="inline-flex h-10 items-center gap-2 rounded-xl bg-teal-500 px-5 text-sm font-semibold text-white hover:bg-teal-600"
                  >
                    Add Medicine
                  </button>
                ) : null
              }
            />
          </GlassCard>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={filters.viewMode === 'grid'
            ? 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'
            : 'space-y-3'
          }
        >
          <AnimatePresence mode="popLayout">
            {sorted.map((medicine) =>
              filters.viewMode === 'grid' ? (
                <GridCard
                  key={medicine.id}
                  medicine={medicine}
                  onEdit={onEdit}
                  onDelete={setDeleteId}
                  expandedId={expandedId}
                  onToggleExpand={(id) => setExpandedId(expandedId === id ? null : id)}
                />
              ) : (
                <ListRow
                  key={medicine.id}
                  medicine={medicine}
                  onEdit={onEdit}
                  onDelete={setDeleteId}
                  expandedId={expandedId}
                  onToggleExpand={(id) => setExpandedId(expandedId === id ? null : id)}
                />
              )
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <ConfirmationDialog
          title="Delete Medicine"
          message="This action cannot be undone. Are you sure you want to delete this medicine?"
          onConfirm={() => handleDelete(deleteId)}
          onCancel={() => setDeleteId(null)}
          confirmText="Delete"
          variant="danger"
        />
      )}
    </motion.div>
  );
}
