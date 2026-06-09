# HomeMed Cabinet — Technical Specification

## Dependencies

| Package | Version | Purpose |
|---|---|---|
| react | ^19.0.0 | UI framework |
| react-dom | ^19.0.0 | DOM renderer |
| react-router | ^7.0.0 | Client-side routing |
| framer-motion | ^12.0.0 | Animations, transitions, gestures |
| lucide-react | ^0.500.0 | Icon library |
| jspdf | ^3.0.0 | PDF export generation |
| jspdf-autotable | ^5.0.0 | PDF table support |
| date-fns | ^4.0.0 | Date parsing, formatting, comparison |
| tailwindcss | ^3.4.0 | Utility CSS |
| @tailwindcss/forms | ^0.5.0 | Form element normalization |
| typescript | ^5.7.0 | Type safety |
| vite | ^6.0.0 | Build tool |
| @vitejs/plugin-react | ^4.0.0 | Vite React plugin |

## Component Inventory

### shadcn/ui Components (Built-in)

| Component | Source | Usage |
|---|---|---|
| Button | shadcn/ui | Primary/secondary actions, icon buttons |
| Input | shadcn/ui | Form text inputs |
| Textarea | shadcn/ui | Form textareas |
| Select | shadcn/ui | Dropdown selects (form type, category, sort) |
| Dialog | shadcn/ui | Confirmation dialogs, modals |
| Label | shadcn/ui | Form field labels |
| Switch | shadcn/ui | Theme toggle, boolean preferences |
| Checkbox | shadcn/ui | Export preferences toggles |
| Badge | shadcn/ui | Category badges, status indicators |
| Card | shadcn/ui | Base card structure |
| Separator | shadcn/ui | Dividers between sections |
| ScrollArea | shadcn/ui | Scrollable containers with custom scrollbar |

### Custom Components

| Component | Purpose | Props |
|---|---|---|
| GlassCard | Glassmorphism card wrapper with hover effects | children, className, hoverable, glowOnHover |
| CategoryBadge | Category pill badge | category: MedicineCategory |
| StatusBadge | Expiration/stock status badge | status: 'expired' \| 'expiring' \| 'good' \| 'low' |
| StatCard | Dashboard stat with animated number | icon, label, value, trend?, color |
| MedicineCard | Grid view medicine card | medicine, onEdit, onDelete, onExpand |
| MedicineRow | List view medicine row | medicine, onEdit, onDelete, onExpand |
| MedicineDetail | Expandable detail panel | medicine, isExpanded |
| MedicineForm | Add/edit medicine form | medicine?, onSave, onCancel |
| ImageUpload | Image upload with preview | value, onChange |
| SearchBar | Search + filter bar | value, onSearch, filters, onFilterChange |
| FilterChips | Horizontal filter chip row | activeFilter, onFilterChange |
| SortControl | Sort dropdown + view toggle | sortBy, onSortChange, viewMode, onViewChange |
| EmergencyReadiness | Emergency checklist panel | medicines |
| ExportPreview | Export format preview | format, medicines |
| ToastProvider | Toast notification system | — |
| Toast | Individual toast notification | type, message, onDismiss |
| EmptyState | Empty state illustration + CTA | icon, title, description, action? |
| ConfirmationDialog | Destructive action dialog | title, message, onConfirm, onCancel |
| MobileNav | Bottom tab navigation | activeTab, onTabChange |
| DesktopSidebar | Left sidebar navigation | activeTab, onTabChange |
| TopBar | App header bar | onThemeToggle |
| ThemeToggle | Dark/light mode switch | — |
| AmbientGlow | Background ambient glow effect | — |
| AnimatedNumber | Count-up number animation | value, duration?, suffix? |
| FloatingIllustration | Bobbing SVG animation | children |
| SkeletonCard | Loading skeleton placeholder | — |
| ProgressBar | Animated progress bar | value, animated? |
| AIPromptCard | AI analysis prompt display | — |
| FloatingActionButton | Mobile FAB for quick add | onClick |

## Animation Implementation

| Animation | Library | Implementation | Complexity |
|---|---|---|---|
| Page transitions (tab switch) | Framer Motion | AnimatePresence + motion.div with opacity/y variants, mode="wait" | Low |
| Card entrance stagger | Framer Motion | Parent variants with staggerChildren: 0.08, child y:20→0 + opacity | Low |
| Card hover (translateY + glow) | Framer Motion | motion.div with whileHover={{ y: -2 }} + CSS ::after pseudo-element opacity transition | Medium |
| Card tap/press | Framer Motion | whileTap={{ scale: 0.98 }} | Low |
| Stat number count-up | Framer Motion | useMotionValue + animate, triggered by useInView | Medium |
| Progress bar fill | Framer Motion | motion.div with initial width:0%, animate to target%, 800ms ease-out | Low |
| Card expand/collapse | Framer Motion | AnimatePresence + motion.div with height:"auto" animation, spring physics | Medium |
| Toast slide in/out | Framer Motion | AnimatePresence + motion.div, x:120%→0 enter, x:0→120% exit | Low |
| Toast stacking | Framer Motion | Dynamic y offset and scale based on index in stack | Medium |
| Floating empty state | Framer Motion | motion.div with animate={{ y: [0,-6,0] }}, repeat:Infinity | Low |
| Shimmer skeleton | CSS | @keyframes background-position sweep on pseudo-element, 1.5s infinite | Low |
| Ambient glow orbs | CSS | @keyframes translateX/Y drift, 20s infinite, different delays per orb | Low |
| Button hover/active | CSS | transition on background/box-shadow, Framer whileTap for scale | Low |
| Switch toggle | Framer Motion | motion.div for thumb with spring x transition | Low |
| Chevron rotate | Framer Motion | animate={{ rotate: isExpanded ? 180 : 0 }} | Low |
| Search bar expand on focus | Framer Motion | animate padding change, border color transition | Low |
| Delete card exit | Framer Motion | AnimatePresence + exit={{ scale: 0, opacity: 0 }}, 300ms | Low |
| FAB pulse glow | CSS | @keyframes box-shadow pulse, 2s infinite | Low |
| Export format card select | Framer Motion | layoutId for shared element, scale tap feedback | Medium |

## State & Logic

### Data Model

```typescript
interface Medicine {
  id: string;
  name: string;
  activeIngredient: string;
  dosage: string;
  formType: 'tablets' | 'syrup' | 'injection' | 'cream' | 'drops' | 'other';
  quantity: number;
  expirationDate: string; // ISO date string
  usageInstructions: string;
  category: 'adult' | 'children' | 'emergency' | 'chronic_illness' | 'other';
  prescriptionRequired: boolean;
  notes: string;
  image: string | null; // base64 data URL
  createdAt: string;
  updatedAt: string;
}

interface AppSettings {
  theme: 'dark' | 'light';
  defaultExportFormat: 'pdf' | 'txt' | 'json';
  includeNotes: boolean;
  includeImages: boolean;
}

interface FilterState {
  searchQuery: string;
  categoryFilter: string | null;
  statusFilter: 'all' | 'expired' | 'expiring' | 'emergency' | 'low_stock';
  sortBy: 'name' | 'expiration' | 'quantity' | 'category';
  viewMode: 'grid' | 'list';
}

type ToastType = 'success' | 'error' | 'warning' | 'info';
interface Toast {
  id: string;
  type: ToastType;
  message: string;
  undo?: () => void;
}
```

### State Management

**React Context + useReducer** for global state (no external library needed for this scale):

| Context | State | Actions |
|---|---|---|
| MedicineContext | Medicine[], FilterState | add, update, delete, restore, setFilters |
| SettingsContext | AppSettings | toggleTheme, setExportFormat, toggleIncludeNotes, toggleIncludeImages, resetAllData |
| ToastContext | Toast[] | addToast, dismissToast, dismissAll |
| DraftContext | Partial<Medicine> \| null | saveDraft, clearDraft, loadDraft |

### localStorage Schema

| Key | Value | Notes |
|---|---|---|
| `homemed_medicines` | `Medicine[]` | Main data store |
| `homemed_settings` | `AppSettings` | User preferences |
| `homemed_draft` | `Partial<Medicine>` | Unsaved form data |
| `homemed_deleted` | `{ medicine: Medicine, timestamp: number }` | Recently deleted (for undo, 30s expiry) |

### Persistence Logic

- **Medicines**: useEffect watches medicines state, serializes and saves to localStorage on every change
- **Settings**: Same pattern, saves on any setting change
- **Draft**: Debounced save (3s) while typing in the form. Cleared on successful save.
- **Deleted buffer**: Stored with timestamp. Checked on load, auto-purged if >30s old.
- **Migration**: On first load (no localStorage key), initialize with empty array + default settings. No demo data.

### Routing

| Route | Page | Notes |
|---|---|---|
| `/` | Dashboard | Default landing |
| `/medicines` | Medicine List | Full list with search/filters |
| `/add` | Add Medicine | Form for new medicine |
| `/edit/:id` | Edit Medicine | Pre-filled form |
| `/export` | Export | Export format selection + preview |
| `/settings` | Settings | Preferences + data management |

Mobile bottom nav and desktop sidebar navigate between these routes.

### Business Logic

**Expiration Status Calculation**:
```
function getExpirationStatus(expirationDate: string): 'expired' | 'expiring' | 'good' {
  const days = differenceInDays(parseISO(expirationDate), new Date());
  if (days < 0) return 'expired';
  if (days <= 30) return 'expiring';
  return 'good';
}
```

**Emergency Readiness Score**:
```
const EMERGENCY_ITEMS = ['paracetamol', 'bandages', 'antiseptic', 'allergy', 'thermometer', 'gloves'];
function calculateReadiness(medicines: Medicine[]): { score: number; found: string[]; missing: string[] } {
  const found = EMERGENCY_ITEMS.filter(item => 
    medicines.some(m => m.name.toLowerCase().includes(item))
  );
  return {
    score: Math.round((found.length / EMERGENCY_ITEMS.length) * 100),
    found,
    missing: EMERGENCY_ITEMS.filter(item => !found.includes(item))
  };
}
```

**Filtering Logic**:
- Search: Matches name OR activeIngredient (case-insensitive substring)
- Category filter: Exact match on category field
- Status filter: 'expired' (status === 'expired'), 'expiring' (status === 'expiring'), 'emergency' (category === 'emergency'), 'low_stock' (quantity <= 5)
- Sort: name (alphabetical), expiration (ascending date), quantity (ascending), category (alphabetical)

### Export Logic

**PDF Export** (jsPDF + jspdf-autotable):
1. Create new jsPDF document
2. Add cover page: "HomeMed Cabinet — Inventory Report" + export date
3. Add medicine table: Name, Dosage, Form, Quantity, Expiration, Category, Status
4. Add "Expiring Soon" section with highlighted rows
5. Add Emergency Readiness section with checklist
6. Add AI Analysis Prompt page
7. Add disclaimer footer on each page

**TXT Export**:
Structured text with clear headers, separators, and the AI prompt appended. Uses monospace-friendly formatting.

**JSON Export**:
Full structured JSON with medicines array, metadata (export date, app version), emergency readiness data, and AI analysis prompt.

### Auto-save Draft

- Custom hook `useAutoSaveDraft` that takes form values
- Uses `useEffect` + `setInterval(3000)` to save to localStorage
- Saves to `homemed_draft` key
- On form mount, checks for existing draft and offers to restore
- Clears draft on successful save

### Theme System

- SettingsContext provides current theme
- `useEffect` on mount reads settings and applies `dark`/`light` class to `<html>`
- CSS variables in index.css switch based on `.dark` class
- Default: dark mode

## Other Key Decisions

### No Backend

Fully client-side. All data in localStorage. No API calls, no authentication, no server communication.

### Image Handling

User-uploaded medicine images stored as base64 data URLs in localStorage. File input → FileReader.readAsDataURL() → stored on Medicine.image. No compression or optimization.

### Date Handling

All dates stored as ISO strings (YYYY-MM-DD). Display uses date-fns format(). Comparisons use date-fns differenceInDays(). Native HTML date input for form fields.

### Responsive Breakpoints

| Breakpoint | Width | Layout Changes |
|---|---|---|
| Mobile | < 768px | Bottom nav, single column, stacked layouts |
| Tablet | 768px–1024px | Sidebar appears, 2-3 column grids |
| Desktop | > 1024px | Full sidebar, 3-4 column grids, max-width container |

### Performance Considerations

- Medicine list virtualization not needed (expected < 100 items in household)
- Images lazy-loaded with Intersection Observer
- Animations use transform/opacity only (GPU-composited)
- Glassmorphism backdrop-filter applied sparingly (card-level only)
- localStorage operations debounced to avoid blocking
