import { motion } from 'framer-motion';
import { Pill, Clock, AlertTriangle, Download, Search, ChevronRight, CheckCircle } from 'lucide-react';
import { GlassCard } from '@/components/GlassCard';
import { EmptyState } from '@/components/EmptyState';
import { useMedicineContext } from '@/context/MedicineContext';
import { getExpirationStatus, getDaysUntilExpiration, formatDate, calculateEmergencyReadiness } from '@/utils/helpers';
import type { ViewTab } from '@/types';
import type { Medicine } from '@/types';

interface DashboardProps {
  onNavigate: (tab: ViewTab) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="text-3xl font-bold text-slate-100"
    >
      {value}{suffix}
    </motion.span>
  );
}

function StatCard({ icon: Icon, iconBg, label, value, onClick }: {
  icon: typeof Pill;
  iconBg: string;
  label: string;
  value: number;
  onClick?: () => void;
}) {
  return (
    <motion.div variants={itemVariants}>
      <GlassCard hoverable onClick={onClick}>
        <div className="flex items-start justify-between">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg}`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
        <div className="mt-4">
          <AnimatedNumber value={value} />
        </div>
        <p className="mt-1 text-xs text-slate-400">{label}</p>
      </GlassCard>
    </motion.div>
  );
}

function ExpiringSoonCard({ medicines, onNavigate }: { medicines: Medicine[]; onNavigate: (t: ViewTab) => void }) {
  const expiring = medicines
    .filter((m) => {
      const status = getExpirationStatus(m.expirationDate);
      return status === 'expiring' || status === 'expired';
    })
    .slice(0, 5);

  return (
    <motion.div variants={itemVariants}>
      <GlassCard>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-100">Expiring Soon</h3>
          <button
            onClick={() => onNavigate('medicines')}
            className="flex items-center gap-1 text-xs font-medium text-teal-400 hover:text-teal-300"
          >
            View All <ChevronRight className="h-3 w-3" />
          </button>
        </div>

        {expiring.length === 0 ? (
          <div className="flex items-center gap-2 py-4 text-sm text-slate-500">
            <CheckCircle className="h-4 w-4 text-emerald-500" />
            No medicines expiring soon
          </div>
        ) : (
          <div className="space-y-0">
            {expiring.map((medicine, i) => {
              const days = getDaysUntilExpiration(medicine.expirationDate);
              const status = getExpirationStatus(medicine.expirationDate);

              return (
                <motion.div
                  key={medicine.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.3 }}
                  className="flex items-center justify-between border-b border-slate-700/30 py-3 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-200">{medicine.name}</p>
                    <p className="text-xs text-slate-500">{formatDate(medicine.expirationDate)}</p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      status === 'expired'
                        ? 'bg-red-500/10 text-red-400'
                        : days <= 7
                        ? 'bg-red-500/10 text-red-400'
                        : 'bg-amber-500/10 text-amber-400'
                    }`}
                  >
                    {status === 'expired' ? 'Expired' : `${days} days`}
                  </span>
                </motion.div>
              );
            })}
          </div>
        )}
      </GlassCard>
    </motion.div>
  );
}

function QuickExportCard({ onNavigate }: { onNavigate: (t: ViewTab) => void }) {
  return (
    <motion.div variants={itemVariants}>
      <GlassCard
        hoverable
        className="border-teal-500/20"
        onClick={() => onNavigate('export')}
      >
        <div className="flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/10">
            <Download className="h-6 w-6 text-teal-400" />
          </div>
          <h3 className="text-base font-semibold text-slate-100">Export Inventory</h3>
          <p className="mt-1 text-xs text-slate-400">Generate a structured report for AI analysis</p>
          <div className="mt-4 flex gap-2">
            {['PDF', 'TXT', 'JSON'].map((fmt) => (
              <span
                key={fmt}
                className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-400"
              >
                {fmt}
              </span>
            ))}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}

function EmergencyCard({ medicines }: { medicines: Medicine[] }) {
  const readiness = calculateEmergencyReadiness(medicines);

  return (
    <motion.div variants={itemVariants}>
      <GlassCard className="border-t-2 border-t-red-500/50">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-red-400">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="1.5" fill="none" />
            </svg>
            <h3 className="text-base font-semibold text-slate-100">Emergency Readiness</h3>
          </div>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              readiness.status === 'Excellent'
                ? 'bg-emerald-500/10 text-emerald-400'
                : readiness.status === 'Moderate'
                ? 'bg-amber-500/10 text-amber-400'
                : 'bg-red-500/10 text-red-400'
            }`}
          >
            {readiness.status}
          </span>
        </div>

        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs text-slate-400">Readiness Score</span>
            <span className="text-sm font-bold text-slate-100">{readiness.score}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-700/50">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: 'linear-gradient(90deg, #EF4444 0%, #F59E0B 50%, #10B981 100%)',
              }}
              initial={{ width: 0 }}
              animate={{ width: `${readiness.score}%` }}
              transition={{ duration: 0.8, ease: [0, 0, 0.2, 1] }}
            />
          </div>
        </div>

        <div className="space-y-2">
          {readiness.checks.map((item, i) => {
            const isFound = readiness.found.includes(item.label);
            return (
              <motion.div
                key={item.key}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                className="flex items-center gap-2"
              >
                {isFound ? (
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                ) : (
                  <div className="h-4 w-4 rounded-full border-2 border-slate-600" />
                )}
                <span
                  className={`text-sm ${
                    isFound ? 'text-slate-200' : 'text-slate-500 line-through'
                  }`}
                >
                  {item.label}
                </span>
              </motion.div>
            );
          })}
        </div>

        <p className="mt-4 text-[11px] leading-relaxed text-slate-600">
          This is not medical advice. This checklist is for informational purposes only.
        </p>
      </GlassCard>
    </motion.div>
  );
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { medicines } = useMedicineContext();

  const expiringCount = medicines.filter((m) => {
    const status = getExpirationStatus(m.expirationDate);
    return status === 'expiring' || status === 'expired';
  }).length;

  const lowStockCount = medicines.filter((m) => m.quantity <= 5).length;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Search Bar */}
      <motion.div variants={itemVariants}>
        <div
          className="flex cursor-pointer items-center gap-3 rounded-2xl border border-[rgba(94,234,212,0.12)] bg-[rgba(21,29,46,0.6)] px-4 py-3 backdrop-blur-[10px] transition-all hover:border-[rgba(94,234,212,0.25)]"
          onClick={() => onNavigate('medicines')}
        >
          <Search className="h-[18px] w-[18px] text-slate-500" />
          <span className="text-sm text-slate-500">Search medicines by name or ingredient...</span>
        </div>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          icon={Pill}
          iconBg="bg-teal-500"
          label="Total Medicines"
          value={medicines.length}
          onClick={() => onNavigate('medicines')}
        />
        <StatCard
          icon={Clock}
          iconBg="bg-amber-500"
          label="Expiring Soon"
          value={expiringCount}
          onClick={() => onNavigate('medicines')}
        />
        <StatCard
          icon={AlertTriangle}
          iconBg="bg-red-500"
          label="Low Stock"
          value={lowStockCount}
          onClick={() => onNavigate('medicines')}
        />
      </div>

      {/* Emergency Readiness */}
      <EmergencyCard medicines={medicines} />

      {/* Expiring Soon + Quick Export */}
      <div className="grid gap-4 md:grid-cols-2">
        <ExpiringSoonCard medicines={medicines} onNavigate={onNavigate} />
        <QuickExportCard onNavigate={onNavigate} />
      </div>

      {/* Low Stock Section */}
      {lowStockCount > 0 && (
        <motion.div variants={itemVariants}>
          <div className="mb-3 flex items-center gap-2">
            <h3 className="text-base font-semibold text-slate-100">Low Stock</h3>
            <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-400">
              {lowStockCount}
            </span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {medicines
              .filter((m) => m.quantity <= 5)
              .map((medicine, i) => (
                <motion.div
                  key={medicine.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="min-w-[160px] flex-shrink-0"
                >
                  <GlassCard className="p-4">
                    <p className="truncate text-sm font-medium text-slate-200">{medicine.name}</p>
                    <p className={`mt-1 text-2xl font-bold ${
                      medicine.quantity === 0 ? 'text-red-400' : 'text-amber-400'
                    }`}>
                      {medicine.quantity}
                    </p>
                    <p className="text-xs text-slate-500">remaining</p>
                  </GlassCard>
                </motion.div>
              ))}
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {medicines.length === 0 && (
        <motion.div variants={itemVariants}>
          <GlassCard>
            <EmptyState
              icon={<Pill className="h-16 w-16 text-slate-600" />}
              title="Your cabinet is empty"
              description="Start building your medicine inventory by adding your first medicine."
              action={
                <button
                  onClick={() => onNavigate('add')}
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-teal-500 px-5 text-sm font-semibold text-white transition-all hover:bg-teal-600 hover:shadow-[0_0_24px_rgba(20,184,166,0.2)]"
                >
                  Add Your First Medicine
                </button>
              }
            />
          </GlassCard>
        </motion.div>
      )}
    </motion.div>
  );
}
