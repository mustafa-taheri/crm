# Tohfawala CRM — Design System

> Primary brand color: **#9d2b2b** (deep burgundy red)
> Secondary: **#ffffff** (white) and **#0a0a0a** (near-black text)

---

## 1. Color Palette

### 1.1 Brand Colors

| Name | Hex | Usage |
|------|-----|-------|
| **Primary** | `#9d2b2b` | Buttons, links, active states, accents |
| **Primary Dark** | `#7a2121` | Hover states, pressed |
| **Primary Light** | `#c95353` | Light backgrounds, subtle accents |
| **Primary 50** | `#fef2f2` | Lightest tint (backgrounds) |
| **Primary 100** | `#ffe0e0` | Tint (borders, subtle highlights) |
| **Primary 200** | `#ffbdbd` | Mid tint |
| **Primary 300** | `#ff9b9b` | Mid tint |
| **Primary 400** | `#ff7979` | Mid tint |
| **Primary 500** | `#ff5656` | Base tint |
| **Primary 600** | `#e53434` | Slightly darker |
| **Primary 700** | `#cc1f1f` | Darker shade |
| **Primary 800** | `#b30a0a` | Dark shade |
| **Primary 900** | `#9d2b2b` | Darkest shade (brand primary) |
| **White** | `#ffffff` | Text on red, backgrounds |
| **Near Black** | `#0a0a0a` | Primary text |
| **Dark Gray** | `#2d2d2d` | Secondary text |
| **Gray** | `#6b7280` | Muted text, placeholders |
| **Light Gray** | `#e5e7eb` | Borders, dividers |
| **Very Light Gray** | `#f3f4f6` | Background |
| **Success** | `#10b981` | Status: delivered, completed |
| **Success Light** | `#d1fae5` | Success backgrounds |
| **Warning** | `#f59e0b` | Status: pending, in progress |
| **Warning Light** | `#fef3c7` | Warning backgrounds |
| **Error** | `#ef4444` | Status: failed, error |
| **Error Light** | `#fee2e2` | Error backgrounds |
| **Info** | `#3b82f6` | Status: new, unread |
| **Info Light** | `#dbeafe` | Info backgrounds |

### 1.2 Status Color Mapping

| CRM Status | Color (text) | Color (bg) |
|------------|-------------|------------|
| `New Reply` | `#3b82f6` (blue) | `#dbeafe` |
| `Interested` | `#10b981` (green) | `#d1fae5` |
| `Quotation` | `#f59e0b` (amber) | `#fef3c7` |
| `Negotiation` | `#8b5cf6` (purple) | `#ede9fe` |
| `Won` | `#10b981` (green) | `#d1fae5` |
| `Lost` | `#ef4444` (red) | `#fee2e2` |
| `Unread` | `#ef4444` (red) | `#fee2e2` |
| `Overdue` | `#ef4444` (red) | `#fee2e2` |

### 1.3 Dark Mode Tokens

| Element | Light | Dark |
|---------|-------|------|
| `--background` | `#ffffff` | `#0a0a0a` |
| `--foreground` | `#0a0a0a` | `#f9fafb` |
| `--card` | `#ffffff` | `#1a1a1a` |
| `--card-foreground` | `#0a0a0a` | `#f9fafb` |
| `--primary` | `#9d2b2b` | `#9d2b2b` |
| `--primary-foreground` | `#ffffff` | `#ffffff` |
| `--muted` | `#f3f4f6` | `#1e1e1e` |
| `--muted-foreground` | `#6b7280` | `#9ca3af` |
| `--border` | `#e5e7eb` | `#374151` |
| `--input` | `#e5e7eb` | `#374151` |
| `--sidebar` | `#f8f9fa` | `#151515` |
| `--sidebar-border` | `#e5e7eb` | `#374151` |

---

## 2. Typography

### 2.1 Font Family

```
Font Family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
  Ubuntu, Cantarell, "Helvetica Neue", "Arial Nova", "Inter", sans-serif;
```

> **Note:** The system uses Next.js font optimization. The Geist/Geist Mono fonts are already in `layout.tsx`. Retain them for a clean, modern feel. The custom properties below map to those fonts.

### 2.2 Font Sizes (Tailwind Scale)

| Class | Size | Line Height | Usage |
|-------|------|-------------|-------|
| `text-xs` | 0.75rem (12px) | 1rem | Captions, labels |
| `text-sm` | 0.875rem (14px) | 1.25rem | Body small, helper text |
| `text-base` | 1rem (16px) | 1.5rem | Body standard |
| `text-lg` | 1.125rem (18px) | 1.75rem | Body large |
| `text-xl` | 1.25rem (20px) | 1.75rem | Section headers |
| `text-2xl` | 1.5rem (24px) | 2rem | Page headers |
| `text-3xl` | 1.875rem (30px) | 2.25rem | Page titles |
| `text-4xl` | 2.25rem (36px) | 2.5rem | Hero/brand |

### 2.3 Font Weights

| Class | Weight | Usage |
|-------|--------|-------|
| `font-normal` | 400 | Body text |
| `font-medium` | 500 | Labels, table headers |
| `font-semibold` | 600 | Section headers, button text |
| `font-bold` | 700 | Page titles, emphasis |

### 2.4 Typography Patterns

```tsx
// Headline (page title)
<h1 className="text-3xl font-bold text-foreground">Dashboard</h1>

// Section header
<h2 className="text-xl font-semibold text-foreground">Recent Conversations</h2>

// Card title
<h3 className="text-lg font-semibold text-foreground">ABC Pvt Ltd</h3>

// Body text
<p className="text-sm text-gray-600">Last contacted: 2 hours ago</p>

// Caption
<span className="text-xs text-gray-500">Updated 5 min ago</span>

// Label
<label className="text-sm font-medium text-gray-700">Customer Name</label>
```

---

## 3. Spacing System

### 3.1 Spacing Scale (Tailwind)

Uses default Tailwind spacing scale:

| Class | Pixels |
|-------|--------|
| `sp-1` | 4px |
| `sp-2` | 8px |
| `sp-3` | 12px |
| `sp-4` | 16px |
| `sp-5` | 20px |
| `sp-6` | 24px |
| `sp-8` | 32px |
| `sp-10` | 40px |
| `sp-12` | 48px |

### 3.2 Layout Spacing

```tsx
// Page container
<div className="p-6 max-w-7xl mx-auto">

// Card padding
<div className="p-4">

// Form field spacing
<div className="mb-4 space-y-2">

// Button spacing
<button className="h-9 px-4 py-2">

// List item spacing
<li className="py-3">
```

---

## 4. Border Radius

| Class | Pixels | Usage |
|-------|--------|-------|
| `radius-sm` | 4px | Small elements (tags, badges) |
| `radius-md` | 8px | Cards, inputs |
| `radius-lg` | 12px | Modal dialogs |
| `radius-xl` | 16px | Large cards |
| `radius-full` | 9999px | Pills, circular buttons |

Tailwind classes: `rounded-sm`, `rounded`, `rounded-md`, `rounded-lg`, `rounded-xl`, `rounded-full`

---

## 5. Components

### 5.1 Buttons

```tsx
// Primary
<button className="bg-primary hover:bg-primary/90 text-primary-foreground h-9 px-4 py-2 rounded-md font-medium">
  Save Customer
</button>

// Secondary
<button className="border border-border hover:bg-accent h-9 px-4 py-2 rounded-md font-medium">
  Cancel
</button>

// Ghost (icon)
<button className="hover:bg-accent rounded-md p-2">
  <Trash2 className="h-4 w-4" />
</button>

// Destructive
<button className="bg-error hover:bg-error/90 text-error-foreground h-9 px-4 py-2 rounded-md font-medium">
  Archive Customer
</button>
```

Variants via `class-variance-authority`:
- `primary` (red background)
- `secondary` (border + gray)
- `ghost` (transparent, subtle hover)
- `destructive` (red background)
- `success` (green background)
- `outline` (border only)

### 5.2 Inputs

```tsx
<input className="border border-input rounded-md px-3 py-2 text-base focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none w-full" />

// With label
<div className="space-y-1">
  <label className="text-sm font-medium text-gray-700">Email</label>
  <input className="border border-input rounded-md px-3 py-2 text-base w-full" />
</div>
```

### 5.3 Badges / Tags

```tsx
// Status badge
<span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800">
  Interested
</span>

// Unread indicator
<span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-error-light text-error">
  🔴 Unread
</span>
```

### 5.4 Cards

```tsx
// Standard card
<div className="bg-card border border-border rounded-md p-4 shadow-sm">
  <h3 className="text-lg font-semibold mb-2">Card Title</h3>
  <p className="text-sm text-gray-600">Card content...</p>
</div>

// Dashboard stat card
<div className="bg-card border border-border rounded-md p-4">
  <p className="text-sm text-gray-500 mb-1">Customers</p>
  <p className="text-2xl font-bold text-foreground">2,438</p>
</div>
```

### 5.5 Tables

```tsx
// Table header
<table className="w-full">
  <thead>
    <tr className="border-b border-border">
      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Customer</th>
      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Status</th>
    </tr>
  </thead>
  <tbody>
    <tr className="border-b border-border hover:bg-muted/50">
      <td className="py-3 px-4">ABC Pvt Ltd</td>
      <td className="py-3 px-4">
        <span className="inline-flex px-2 py-0.5 rounded text-xs bg-primary-100 text-primary-800">New</span>
      </td>
    </tr>
  </tbody>
</table>
```

### 5.6 Layout Components

```
Layout/
├── AppLayout.tsx         — main layout (sidebar + header)
├── Sidebar.tsx           — role-based navigation
├── Header.tsx            — user menu, notifications, dark mode
├── DashboardStats.tsx    — stat cards
└── ConversationList.tsx  — WhatsApp inbox left panel
```

### 5.7 Modal / Dialog (Radix)

```tsx
<Dialog>
  <DialogTrigger asChild>
    <button className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 rounded-md">
      Add Customer
    </button>
  </DialogTrigger>
  <DialogContent className="bg-card border border-border">
    <DialogHeader>
      <DialogTitle>Add Customer</DialogTitle>
      <DialogDescription>Enter customer details below.</DialogDescription>
    </DialogHeader>
    {/* form */}
    <DialogFooter>
      <DialogClose>Cancel</DialogClose>
      <button className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 rounded-md">
        Save
      </button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

## 6. Navigation

### 6.1 Sidebar Structure

```
Dashboard
Customers
  └── (list, add, import)
WhatsApp
  ├── Inbox
  └── Campaigns
Follow-ups
Reports
  ├── Campaigns
  ├── Customer Status
  ├── Salesperson Activity
  └── Follow-ups
Settings
  └── Users (admin only)
```

### 6.2 Sidebar Item States

| State | Styling |
|-------|---------|
| Default | `text-gray-600 hover:bg-muted hover:text-foreground` |
| Active | `bg-primary/10 text-primary font-medium` |
| Disabled | `text-gray-400 cursor-not-allowed` |

### 6.3 Breadcrumbs

```tsx
<nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
  <Link href="/customers" className="hover:text-foreground">Customers</Link>
  <ChevronRight className="h-4 w-4" />
  <span className="text-foreground">ABC Pvt Ltd</span>
</nav>
```

---

## 7. WhatsApp Conversation UI

### 7.1 Message Bubbles

```
Customer message:
┌─────────────────────────────┐
│ Hi, I like product #24.    │
│                             │
│    10:30 AM                 │
└─────────────────────────────┘
(aligned left, gray background)

Salesperson reply:
┌─────────────────────────────┐
│ Sure, how many pieces?     │
│                             │
│    10:32 AM  ✓✓✓            │
└─────────────────────────────┘
(aligned right, red accent border)
```

### 7.2 Inbox 3-Panel Layout

```tsx
<div className="flex h-[calc(100vh-4rem)] border-t border-border">
  {/* Conversation List */}
  <div className="w-64 border-r border-border overflow-y-auto">
    <ConversationList />
  </div>
  {/* Conversation View */}
  <div className="flex-1 flex flex-col">
    <ConversationView />
  </div>
  {/* Customer Context */}
  <div className="w-64 border-l border-border overflow-y-auto">
    <CustomerContext />
  </div>
</div>
```

---

## 8. Responsive Design

### 8.1 Breakpoints

| Class | Min Width | Usage |
|-------|-----------|-------|
| (default) | — | Mobile (stacked) |
| `sm:` | 640px | Tablet portrait |
| `md:` | 768px | Tablet landscape |
| `lg:` | 1024px | Desktop |
| `xl:` | 1280px | Wide desktop |
| `2xl:` | 1536px | Full content |

### 8.2 Mobile Patterns

- Sidebar collapses to hamburger menu on `md:` and below
- Tables scroll horizontally on mobile (`overflow-x-auto`)
- Message input stays fixed at bottom of screen
- Customer context panel becomes a slide-over (sheet) on mobile

---

## 9. Iconography

**Library:** `lucide-react`

### 9.1 Icon Sizes

| Class | Pixels | Usage |
|-------|--------|-------|
| `h-3 w-3` | 12px | Inline badges |
| `h-4 w-4` | 16px | Buttons, table cells |
| `h-5 w-5` | 20px | Sidebar icons |
| `h-6 w-6` | 24px | Page headers |

### 9.2 Common Icons Used

| Purpose | Icon |
|---------|------|
| Customers | `Users` |
| WhatsApp Inbox | `MessageCircle` |
| Campaigns | `Send` |
| Follow-ups | `Calendar` |
| Reports | `BarChart3` |
| Settings | `Settings` |
| Add | `Plus` |
| Edit | `Pencil` |
| Delete/Archive | `Trash2` |
| Search | `Search` |
| Filter | `Filter` |
| Checkmark | `Check` |
| Cross/Cancel | `X` |
| Calendar | `Calendar` |
| Clock | `Clock` |
| Exclamation | `AlertCircle` |
| Info | `Info` |
| Export | `Download` |

---

## 10. Design Patterns

### 10.1 Form Pattern

```tsx
const form = useForm({
  resolver: zodResolver(customerSchema),
  defaultValues: { name: "", mobile: "", email: "" }
});

const { control } = form;

<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
  <FormField
    control={control}
    name="name"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Customer Name *</FormLabel>
        <FormControl>
          <Input {...field} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
  <FormButtonContainer>
    <Button variant="secondary">Cancel</Button>
    <Button type="submit" className="bg-primary">Save</Button>
  </FormButtonContainer>
</form>
```

### 10.2 Data Fetching Pattern (Server Components)

```tsx
// Server component
export default async function CustomersPage() {
  const { data: customers } = await fetchCustomers();
  return (
    <div className="p-6">
      <CustomerTable data={customers} />
    </div>
  );
}

// API module
export async function fetchCustomers(search?: string) {
  const supabase = createServerClient();
  return supabase
    .from("customers")
    .select("*")
    .order("created_at", { ascending: false });
}
```

### 10.3 Action Pattern (Server Actions)

```tsx
// Server action
"use server";
import { revalidatePath } from "next/cache";

export async function archiveCustomer(id: string) {
  const supabase = createServerClient();
  await supabase
    .from("customers")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", id);
  revalidatePath("/customers");
}

// Client component
<button onClick={() => archiveCustomer(customer.id)}>
  Archive
</button>
```

### 10.4 Real-time Subscription Pattern

```tsx
// Hook
export function useConversationRealtime(conversationId: string) {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const supabase = createBrowserClient();
    const channel = supabase
      .channel(`messages:conv=${conversationId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        setMessages(prev => [...prev, payload.new]);
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [conversationId]);

  return messages;
}
```

### 10.5 Status Badge Pattern

```tsx
const statusConfig = {
  new_reply: { label: "New Reply", class: "bg-blue-100 text-blue-800" },
  interested: { label: "Interested", class: "bg-green-100 text-green-800" },
  quotation: { label: "Quotation", class: "bg-amber-100 text-amber-800" },
  negotiation: { label: "Negotiation", class: "bg-purple-100 text-purple-800" },
  won: { label: "Won", class: "bg-green-100 text-green-800" },
  lost: { label: "Lost", class: "bg-red-100 text-red-800" },
} as const;

<span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${statusConfig[status].class}`}>
  {statusConfig[status].label}
</span>
```

### 10.6 Error Boundary Pattern

```tsx
export function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center h-96">
      <AlertCircle className="h-12 w-12 text-error mb-4" />
      <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
      <p className="text-gray-600 mb-4">An error occurred while loading this page.</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
```

---

## 11. Component Inventory (To Build)

### Auth
- `LoginForm`
- `ProtectedRoute` / middleware

### Customers
- `CustomerTable`
- `CustomerFilters`
- `CustomerSearch`
- `AddCustomerForm`
- `EditCustomerForm`
- `CustomerImportWizard` (multi-step)
- `ColumnMapper` (import step)
- `ValidationReport` (import step)
- `ImportSummary` (import result)

### Dashboard
- `AdminDashboard`
- `SalespersonDashboard`
- `StatCard`
- `PipelineCard`
- `RecentConversationsList`
- `TodayFollowupsList`

### Customer 360
- `CustomerHeader`
- `Customer360Tabs`
- `OverviewTab`
- `WhatsAppTab`
- `ActivityTimeline`
- `NotesTab`
- `FollowUpsTab`
- `StatusDropdown`

### WhatsApp Inbox
- `ConversationList`
- `ConversationView`
- `MessageBubble`
- `MessageInput`
- `MediaToolbar` (attach image/PDF/video)
- `CustomerContextPanel`
- `ConversationActions` (status, note, follow-up, assign)

### Campaigns
- `CampaignTable`
- `CampaignWizard` (multi-step)
- `AudienceSelector`
- `TemplateSelector`
- `MediaUploader`
- `CampaignPreview`
- `CampaignDetail`
- `CampaignAnalytics`
- `TemplateList`
- `TemplateForm`

### Follow-ups
- `FollowUpTable`
- `CreateFollowUpForm`
- `FollowUpActions` (complete, reassign)
- `FollowUpFilters`

### Notes
- `NoteList`
- `NoteEditor`

### Activities
- `ActivityTimeline`
- `ActivityItem`

### Reports
- `CampaignReport`
- `CustomerStatusReport`
- `SalespersonActivityReport`
- `FollowUpReport`
- `ReportFilters`
- `ExportButton`

### Shared
- `DataTable` (reusable table primitive)
- `Pagination`
- `SearchInput`
- `ConfirmDialog`
- `StatusBadge`
- `Avatar` (user/customer)
- `Tooltip` (Radix)

---

## 12. Tailwind Config

Add to `tailwind.config.js`:

```js
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#9d2b2b",
          50: "#fef2f2",
          100: "#ffe0e0",
          200: "#ffbdbd",
          300: "#ff9b9b",
          400: "#ff7979",
          500: "#ff5656",
          600: "#e53434",
          700: "#cc1f1f",
          800: "#b30a0a",
          900: "#9d2b2b",
          foreground: "#ffffff",
        },
        success: "#10b981",
        warning: "#f59e0b",
        error: "#ef4444",
        info: "#3b82f6",
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        full: "9999px",
      },
    },
  },
  plugins: [],
};
```
