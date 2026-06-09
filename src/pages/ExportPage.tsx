import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, FileCode, FileJson, Download, Check, Copy, Sparkles, Loader2 } from 'lucide-react';
import { GlassCard } from '@/components/GlassCard';
import { useMedicineContext } from '@/context/MedicineContext';
import { useSettingsContext } from '@/context/SettingsContext';
import { useToastContext } from '@/context/ToastContext';
import { generatePDF, generateTXT, generateJSON, downloadFile } from '@/utils/export';
import { formatDate } from '@/utils/helpers';

interface ExportPageProps {
  onNavigate?: (tab: 'dashboard' | 'medicines' | 'add' | 'export' | 'settings') => void;
}

type ExportFormat = 'pdf' | 'txt' | 'json';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const AI_PROMPT = `Analyze this medicine inventory and determine:
- Which prescribed medicines are already available
- Possible alternatives based on active ingredients
- Medicines nearing expiration
- Potential duplicates
- Missing emergency essentials
- Possible medicine interactions

This report is not medical advice.`;

export function ExportPage({ onNavigate: _onNavigate }: ExportPageProps) {
  const { medicines } = useMedicineContext();
  const { settings } = useSettingsContext();
  const { addToast } = useToastContext();
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>(settings.defaultExportFormat);
  const [generating, setGenerating] = useState(false);

  const handleExport = async () => {
    if (medicines.length === 0) {
      addToast('No medicines to export', 'warning');
      return;
    }

    setGenerating(true);
    await new Promise((r) => setTimeout(r, 600));

    try {
      const timestamp = new Date().toISOString().split('T')[0];

      if (selectedFormat === 'pdf') {
        const doc = generatePDF(medicines, settings);
        doc.save(`homemed-inventory-${timestamp}.pdf`);
      } else if (selectedFormat === 'txt') {
        const content = generateTXT(medicines, settings);
        downloadFile(content, `homemed-inventory-${timestamp}.txt`, 'text/plain');
      } else {
        const content = generateJSON(medicines, settings);
        downloadFile(content, `homemed-inventory-${timestamp}.json`, 'application/json');
      }

      addToast(`${selectedFormat.toUpperCase()} exported successfully`, 'success');
    } catch (error) {
      addToast('Export failed. Please try again.', 'error');
    }

    setGenerating(false);
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(AI_PROMPT);
    addToast('AI prompt copied to clipboard', 'success');
  };

  const formatCards: { key: ExportFormat; icon: typeof FileText; title: string; desc: string; color: string; bg: string }[] = [
    { key: 'pdf', icon: FileText, title: 'PDF Report', desc: 'Professional formatted document with cover', color: 'text-red-400', bg: 'bg-red-500/10' },
    { key: 'txt', icon: FileCode, title: 'Text File', desc: 'AI-friendly structured text format', color: 'text-teal-400', bg: 'bg-teal-500/10' },
    { key: 'json', icon: FileJson, title: 'JSON Export', desc: 'Machine-readable data format', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="mx-auto max-w-2xl space-y-6"
    >
      <motion.div variants={itemVariants}>
        <h2 className="text-xl font-semibold text-slate-100">Export Inventory</h2>
        <p className="mt-1 text-sm text-slate-400">Generate a structured report for AI analysis</p>
      </motion.div>

      {/* Format Selection */}
      <motion.div variants={itemVariants} className="grid grid-cols-3 gap-3">
        {formatCards.map((fmt) => {
          const Icon = fmt.icon;
          const isSelected = selectedFormat === fmt.key;

          return (
            <motion.button
              key={fmt.key}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelectedFormat(fmt.key)}
              className={`flex flex-col items-center gap-2 rounded-2xl border p-5 text-center transition-all ${
                isSelected
                  ? 'border-teal-500/50 bg-[rgba(20,184,166,0.05)] shadow-[0_0_24px_rgba(20,184,166,0.1)]'
                  : 'border-[rgba(94,234,212,0.12)] bg-gradient-to-br from-[rgba(21,29,46,0.7)] to-[rgba(15,23,42,0.5)] backdrop-blur-[10px] hover:border-[rgba(94,234,212,0.25)]'
              }`}
            >
              {isSelected && (
                <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-teal-500">
                  <Check className="h-3 w-3 text-white" />
                </div>
              )}
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${fmt.bg}`}>
                <Icon className={`h-5 w-5 ${fmt.color}`} />
              </div>
              <span className="text-sm font-semibold text-slate-100">{fmt.title}</span>
              <span className="text-[11px] text-slate-500">{fmt.desc}</span>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Preview */}
      <motion.div variants={itemVariants}>
        <GlassCard>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-100">Preview</h3>
            <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-slate-400">
              {medicines.length} medicines
            </span>
          </div>

          <div className="max-h-[400px] overflow-auto rounded-xl bg-[#0B1120] p-4">
            <AnimatePresence mode="wait">
              {selectedFormat === 'pdf' && (
                <motion.div
                  key="pdf-preview"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div className="text-center">
                    <p className="text-lg font-bold text-teal-400">HomeMed Cabinet</p>
                    <p className="text-sm text-slate-300">Medicine Inventory Report</p>
                    <p className="text-xs text-slate-500">{formatDate(new Date().toISOString())}</p>
                  </div>
                  <div className="border-t border-slate-700/50 pt-3">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-left text-slate-400">
                          <th className="pb-2">Name</th>
                          <th className="pb-2">Dosage</th>
                          <th className="pb-2">Qty</th>
                          <th className="pb-2">Expires</th>
                          <th className="pb-2">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {medicines.slice(0, 5).map((m) => (
                          <tr key={m.id} className="border-t border-slate-800 text-slate-300">
                            <td className="py-2">{m.name}</td>
                            <td className="py-2">{m.dosage}</td>
                            <td className="py-2">{m.quantity}</td>
                            <td className="py-2">{formatDate(m.expirationDate)}</td>
                            <td className="py-2">
                              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-emerald-400">Good</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {medicines.length > 5 && (
                      <p className="mt-2 text-center text-xs text-slate-600">...and {medicines.length - 5} more</p>
                    )}
                  </div>
                </motion.div>
              )}

              {selectedFormat === 'txt' && (
                <motion.div
                  key="txt-preview"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="font-mono text-xs text-slate-300"
                >
                  <pre className="whitespace-pre-wrap">
{`============================================================
           HOMEMED CABINET — INVENTORY REPORT
============================================================
Export Date: ${formatDate(new Date().toISOString())}
Total Medicines: ${medicines.length}
============================================================

MEDICINE INVENTORY
------------------------------------------------------------
${medicines.length === 0 ? 'No medicines in inventory.' : medicines.slice(0, 3).map((m, i) => `[${i + 1}] ${m.name}
    Dosage: ${m.dosage}
    Quantity: ${m.quantity}
    Expires: ${formatDate(m.expirationDate)}`).join('\n\n')}${medicines.length > 3 ? '\n\n...and more' : ''}

============================================================
AI ANALYSIS PROMPT
------------------------------------------------------------
${AI_PROMPT}

============================================================`}
                  </pre>
                </motion.div>
              )}

              {selectedFormat === 'json' && (
                <motion.div
                  key="json-preview"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="font-mono text-xs"
                >
                  <pre className="whitespace-pre-wrap">
{`{
  "metadata": {
    "app": "HomeMed Cabinet",
    "version": "1.0.0",
    "exportDate": "${formatDate(new Date().toISOString())}",
    "exportFormat": "JSON",
    "totalMedicines": ${medicines.length}
  },
  "medicines": [
${medicines.slice(0, 2).map((m) => `    {
      "name": "${m.name}",
      "dosage": "${m.dosage}",
      "quantity": ${m.quantity},
      "category": "${m.category}"
    }`).join(',\n')}${medicines.length > 2 ? ',\n    ...' : ''}
  ],
  "analysisPrompt": "..."
}`}
                  </pre>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </GlassCard>
      </motion.div>

      {/* AI Prompt Card */}
      <motion.div variants={itemVariants}>
        <GlassCard className="border-l-[3px] border-l-teal-500/50">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-teal-400" />
            <h3 className="text-base font-semibold text-slate-100">AI Analysis Ready</h3>
          </div>
          <p className="mb-4 text-sm text-slate-400">
            Every export includes a structured prompt for AI-assisted analysis.
          </p>
          <div className="relative rounded-xl bg-[#0B1120] p-4">
            <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-slate-300">
              {AI_PROMPT}
            </pre>
            <button
              onClick={handleCopyPrompt}
              className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-300"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
        </GlassCard>
      </motion.div>

      {/* Generate Button */}
      <motion.div variants={itemVariants}>
        <button
          onClick={handleExport}
          disabled={generating || medicines.length === 0}
          className={`flex h-13 w-full items-center justify-center gap-2 rounded-xl text-base font-semibold text-white transition-all active:scale-[0.98] ${
            medicines.length === 0
              ? 'cursor-not-allowed bg-slate-700 opacity-50'
              : 'bg-teal-500 hover:bg-teal-600 hover:shadow-[0_0_24px_rgba(20,184,166,0.2)]'
          } disabled:opacity-60`}
          style={{ height: '52px' }}
        >
          {generating ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Download className="h-5 w-5" />
              Generate & Download {selectedFormat.toUpperCase()}
            </>
          )}
        </button>
      </motion.div>
    </motion.div>
  );
}
