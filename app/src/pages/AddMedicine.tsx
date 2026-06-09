import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Camera, X, Check, Loader2 } from 'lucide-react';
import { GlassCard } from '@/components/GlassCard';
import { useMedicineContext } from '@/context/MedicineContext';
import { useToastContext } from '@/context/ToastContext';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { Medicine, ViewTab } from '@/types';
import type { FormType, Category } from '@/types';

interface AddMedicineProps {
  onNavigate: (tab: ViewTab) => void;
  editId?: string | null;
}

const FORM_TYPES: { value: FormType; label: string }[] = [
  { value: 'tablets', label: 'Tablets' },
  { value: 'syrup', label: 'Syrup' },
  { value: 'injection', label: 'Injection' },
  { value: 'cream', label: 'Cream' },
  { value: 'drops', label: 'Drops' },
  { value: 'other', label: 'Other' },
];

const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'adult', label: 'Adult' },
  { value: 'children', label: 'Children' },
  { value: 'emergency', label: 'Emergency' },
  { value: 'chronic_illness', label: 'Chronic Illness' },
  { value: 'other', label: 'Other' },
];

const initialForm: Omit<Medicine, 'id' | 'createdAt' | 'updatedAt'> = {
  name: '',
  activeIngredient: '',
  dosage: '',
  formType: 'tablets',
  quantity: 1,
  expirationDate: '',
  usageInstructions: '',
  category: 'adult',
  prescriptionRequired: false,
  notes: '',
  image: null,
};

const containerVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export function AddMedicine({ onNavigate, editId }: AddMedicineProps) {
  const { addMedicine, updateMedicine, getMedicineById } = useMedicineContext();
  const { addToast } = useToastContext();
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useLocalStorage<Partial<typeof initialForm>>('homemed_draft', {});

  const isEditing = !!editId;
  const medicine = editId ? getMedicineById(editId) : null;

  // Load edit data or draft
  useEffect(() => {
    if (isEditing && medicine) {
      setForm({
        name: medicine.name,
        activeIngredient: medicine.activeIngredient,
        dosage: medicine.dosage,
        formType: medicine.formType,
        quantity: medicine.quantity,
        expirationDate: medicine.expirationDate,
        usageInstructions: medicine.usageInstructions,
        category: medicine.category,
        prescriptionRequired: medicine.prescriptionRequired,
        notes: medicine.notes,
        image: medicine.image,
      });
    } else if (!isEditing && Object.keys(draft).length > 0) {
      setForm((prev) => ({ ...prev, ...draft }));
    }
  }, [isEditing, medicine]);

  // Auto-save draft
  useEffect(() => {
    if (isEditing) return;
    const interval = setInterval(() => {
      if (form.name || form.activeIngredient) {
        setDraft({ ...form });
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [form, isEditing, setDraft]);

  const handleChange = useCallback((field: string, value: string | number | boolean | null) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      handleChange('image', reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    handleChange('image', null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      addToast('Medicine name is required', 'error');
      return;
    }
    if (!form.expirationDate) {
      addToast('Expiration date is required', 'error');
      return;
    }

    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));

    if (isEditing && editId) {
      updateMedicine(editId, { ...form });
      addToast('Medicine updated successfully', 'success');
    } else {
      addMedicine({ ...form });
      addToast('Medicine added successfully', 'success');
      setDraft({});
    }

    setSaving(false);
    setSaved(true);
    setTimeout(() => {
      onNavigate('medicines');
    }, 600);
  };

  const inputClass = 'h-11 w-full rounded-xl border border-transparent bg-[#1E293B] px-4 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all focus:border-teal-500 focus:shadow-[0_0_0_3px_rgba(20,184,166,0.2)]';
  const selectClass = 'h-11 w-full rounded-xl border border-transparent bg-[#1E293B] px-4 pr-8 text-sm text-slate-100 outline-none transition-all focus:border-teal-500 focus:shadow-[0_0_0_3px_rgba(20,184,166,0.2)] appearance-none';
  const labelClass = 'mb-1.5 block text-sm font-medium text-slate-400';

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="mx-auto max-w-2xl"
    >
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => onNavigate('medicines')}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 text-slate-400 transition-colors hover:bg-slate-700 hover:text-slate-200"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h2 className="text-xl font-semibold text-slate-100">
          {isEditing ? 'Edit Medicine' : 'Add Medicine'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <GlassCard className="p-6">
          {/* Image Upload */}
          <div className="mb-6">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            {form.image ? (
              <div className="relative h-44 overflow-hidden rounded-xl">
                <img src={form.image} alt="Medicine" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
                >
                  <X className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-2 right-2 rounded-lg bg-black/50 px-3 py-1.5 text-xs text-white backdrop-blur-sm transition-colors hover:bg-black/70"
                >
                  Change
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-44 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-700 transition-all hover:border-teal-500/50 hover:bg-[rgba(20,184,166,0.05)]"
              >
                <Camera className="mb-2 h-10 w-10 text-slate-600" />
                <span className="text-sm text-slate-400">Tap to upload medicine photo</span>
                <span className="text-xs text-slate-600">(optional)</span>
              </button>
            )}
          </div>

          <div className="space-y-4">
            {/* Medicine Name */}
            <div>
              <label className={labelClass}>Medicine Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g. Paracetamol"
                className={inputClass}
                required
              />
            </div>

            {/* Active Ingredient */}
            <div>
              <label className={labelClass}>Active Ingredient</label>
              <input
                type="text"
                value={form.activeIngredient}
                onChange={(e) => handleChange('activeIngredient', e.target.value)}
                placeholder="e.g. Acetaminophen"
                className={inputClass}
              />
            </div>

            {/* Dosage */}
            <div>
              <label className={labelClass}>Dosage</label>
              <input
                type="text"
                value={form.dosage}
                onChange={(e) => handleChange('dosage', e.target.value)}
                placeholder="e.g. 500mg"
                className={inputClass}
              />
            </div>

            {/* Form Type + Category Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Form Type *</label>
                <div className="relative">
                  <select
                    value={form.formType}
                    onChange={(e) => handleChange('formType', e.target.value)}
                    className={selectClass}
                  >
                    {FORM_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>
              </div>
              <div>
                <label className={labelClass}>Category *</label>
                <div className="relative">
                  <select
                    value={form.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                    className={selectClass}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Quantity + Expiration Date Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Quantity *</label>
                <input
                  type="number"
                  min="0"
                  value={form.quantity}
                  onChange={(e) => handleChange('quantity', parseInt(e.target.value) || 0)}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Expiration Date *</label>
                <input
                  type="date"
                  value={form.expirationDate}
                  onChange={(e) => handleChange('expirationDate', e.target.value)}
                  className={`${inputClass} [color-scheme:dark]`}
                  required
                />
              </div>
            </div>

            {/* Prescription Required */}
            <div>
              <label className={labelClass}>Prescription Required?</label>
              <div className="flex gap-4">
                <label className="flex cursor-pointer items-center gap-2">
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all ${
                      form.prescriptionRequired ? 'border-teal-500 bg-teal-500' : 'border-slate-600'
                    }`}
                    onClick={() => handleChange('prescriptionRequired', true)}
                  >
                    {form.prescriptionRequired && <div className="h-2 w-2 rounded-full bg-white" />}
                  </div>
                  <span className="text-sm text-slate-300">Yes</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all ${
                      !form.prescriptionRequired ? 'border-teal-500 bg-teal-500' : 'border-slate-600'
                    }`}
                    onClick={() => handleChange('prescriptionRequired', false)}
                  >
                    {!form.prescriptionRequired && <div className="h-2 w-2 rounded-full bg-white" />}
                  </div>
                  <span className="text-sm text-slate-300">No</span>
                </label>
              </div>
            </div>

            {/* Usage Instructions */}
            <div>
              <label className={labelClass}>Usage Instructions</label>
              <textarea
                value={form.usageInstructions}
                onChange={(e) => handleChange('usageInstructions', e.target.value)}
                placeholder="How to take this medicine..."
                rows={3}
                className={`${inputClass} min-h-[100px] resize-y py-3`}
              />
            </div>

            {/* Notes */}
            <div>
              <label className={labelClass}>Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Additional information..."
                rows={2}
                className={`${inputClass} min-h-[80px] resize-y py-3`}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={saving}
            className={`mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white transition-all active:scale-[0.98] ${
              saved
                ? 'bg-emerald-500'
                : 'bg-teal-500 hover:bg-teal-600 hover:shadow-[0_0_24px_rgba(20,184,166,0.2)]'
            } disabled:opacity-60`}
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : saved ? (
              <>
                <Check className="h-4 w-4" />
                Saved!
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                {isEditing ? 'Update Medicine' : 'Save Medicine'}
              </>
            )}
          </button>

          {/* Delete button in edit mode */}
          {isEditing && (
            <button
              type="button"
              onClick={() => {
                if (editId) {
                  onNavigate('medicines');
                }
              }}
              className="mt-3 flex h-10 w-full items-center justify-center rounded-xl border border-red-500/30 text-sm font-medium text-red-400 transition-all hover:bg-red-500/10"
            >
              Cancel
            </button>
          )}
        </GlassCard>
      </form>
    </motion.div>
  );
}
