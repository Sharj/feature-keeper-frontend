# Feature Keeper — Design System

**System Name**: Warm Precision
**Version**: 1.0
**Last Updated**: 2026-03-25

---

## Design Philosophy

Feature Keeper's design language balances **editorial authority** with **warm approachability**. Serif headings convey that we take feedback seriously. A terracotta accent palette feels distinctive and human — deliberately avoiding the ubiquitous blue/purple SaaS aesthetic. Warm cream backgrounds prevent the clinical feel of pure white.

### Core Principles

1. **Warmth over sterility** — Cream backgrounds, terracotta accents, warm gray text hierarchy
2. **Typography-led hierarchy** — Serif headings create clear visual distinction from body text
3. **Generous whitespace** — Let content breathe. Density should feel intentional, not cramped
4. **Subtle depth** — Soft shadows and borders create layering without heavy drop-shadows
5. **Motion with purpose** — Animations guide attention, never distract

---

## Typography

### Font Stack

| Role | Font | Fallbacks | Usage |
|------|------|-----------|-------|
| **Display / Headings** | Instrument Serif (400) | Georgia, Times New Roman, serif | h1–h4, page titles, hero text, modal titles |
| **Body / UI** | Outfit (variable, 300–700) | system-ui, -apple-system, sans-serif | Everything else: paragraphs, labels, buttons, navigation |

### Type Scale

| Element | Size | Weight | Font | Letter Spacing |
|---------|------|--------|------|----------------|
| Hero heading | 48–56px (text-5xl/text-6xl) | 400 | Serif | -0.02em |
| Page heading (h1) | 24–30px (text-2xl/text-3xl) | 400 | Serif | -0.01em |
| Section heading (h2) | 20px (text-xl) | 400 | Serif | -0.01em |
| Card heading (h3) | 18px (text-lg) | 400 | Serif | -0.01em |
| Subheading (h4) | 16px (text-base) | 400 | Serif | -0.01em |
| Body | 14px (text-sm) | 400 | Sans | 0 |
| Small / Caption | 13px (text-[13px]) | 400–500 | Sans | 0 |
| Label | 14px (text-sm) | 500 | Sans | 0 |
| Button | 13–14px | 500 | Sans | 0 |
| Badge | 12–13px | 500 | Sans | 0 |

### Tailwind Classes

```
Headings:    font-serif text-ink
Body:        font-sans text-subtle (or text-ink for emphasis)
Labels:      text-sm font-medium text-ink
Captions:    text-[13px] text-muted
```

---

## Color Palette

### Core Colors

| Token | Hex | Tailwind | Usage |
|-------|-----|----------|-------|
| **Cream** | `#f8f7f4` | `bg-cream` | Page background, subtle surfaces |
| **Surface** | `#ffffff` | `bg-surface` | Cards, modals, input backgrounds |
| **Edge** | `#e7e5e0` | `border-edge` | Subtle borders, dividers |
| **Edge Strong** | `#d4d1cb` | `border-edge-strong` | Emphasized borders, hover states |

### Text Colors

| Token | Hex | Tailwind | Usage |
|-------|-----|----------|-------|
| **Ink** | `#1a1816` | `text-ink` | Primary text, headings |
| **Subtle** | `#5c5650` | `text-subtle` | Secondary text, descriptions |
| **Muted** | `#9c968f` | `text-muted` | Tertiary text, placeholders, timestamps |
| **Faint** | `#c8c3bc` | `text-faint` | Disabled text, decorative elements |

### Brand Accent (Terracotta)

| Token | Hex | Tailwind | Usage |
|-------|-----|----------|-------|
| **Accent** | `#c2410c` | `bg-accent` / `text-accent` | Primary buttons, active tabs, links, focus rings |
| **Accent Soft** | `#fef3ee` | `bg-accent-soft` | Accent badges, hover backgrounds, highlights |
| **Accent Bold** | `#9a3412` | `bg-accent-bold` | Button hover state, dark accent text |

### Semantic Colors

| Semantic | Color | Light | Usage |
|----------|-------|-------|-------|
| **Positive** | `#16794a` / `text-positive` | `#ecfdf3` / `bg-positive-soft` | Success states, completed status |
| **Caution** | `#a26207` / `text-caution` | `#fefce8` / `bg-caution-soft` | Warnings, pending states |
| **Critical** | `#be123c` / `text-critical` | `#fff1f3` / `bg-critical-soft` | Errors, destructive actions, danger zones |
| **Inform** | `#1d6cb5` / `text-inform` | `#eff6ff` / `bg-inform-soft` | Info messages, admin-authored content |

### Navigation

| Token | Hex | Tailwind | Usage |
|-------|-----|----------|-------|
| **Nav** | `#1a1816` | `bg-nav` | Dashboard top navbar background |
| **Nav Subtle** | `#a09890` | `text-nav-subtle` | Muted nav text |

---

## Spacing

Uses Tailwind's default spacing scale. Key patterns:

| Context | Value | Class |
|---------|-------|-------|
| Page padding (horizontal) | 24px | `px-6` |
| Page padding (vertical) | 32px | `py-8` |
| Card padding | 20–24px | `p-5` or `p-6` |
| Card padding (compact) | 16px | `p-4` |
| Section gap | 24–32px | `space-y-6` or `space-y-8` |
| Form field gap | 16px | `space-y-4` |
| Inline element gap | 8–12px | `gap-2` or `gap-3` |
| Max content width | 1152px | `max-w-6xl` |
| Max form width | 448px | `max-w-md` |

---

## Border Radius

| Context | Value | Class |
|---------|-------|-------|
| Buttons, inputs | 8px | `rounded-lg` |
| Cards, modals | 12px | `rounded-xl` |
| Badges, pills | 9999px | `rounded-full` |
| Small elements | 6px | `rounded-md` |

---

## Shadows

| Level | Usage | Class |
|-------|-------|-------|
| **XS** | Subtle depth for secondary buttons | `shadow-xs` |
| **SM** | Default card elevation, primary buttons | `shadow-sm` |
| **MD** | Elevated cards, hover states | `shadow-md` |
| **LG** | Dropdowns, popovers | `shadow-lg` |
| **XL** | Modals | `shadow-xl` |

Shadow color uses warm-toned black (`rgba(26, 24, 22, ...)`) to maintain warmth.

---

## Components

### Button

| Variant | Appearance | Usage |
|---------|------------|-------|
| **Primary** | Terracotta bg, white text, shadow | Main CTAs, form submissions |
| **Secondary** | White bg, border, dark text | Secondary actions, cancels |
| **Ghost** | No bg, subtle text, cream hover | Tertiary actions, navigation |
| **Danger** | Rose bg, white text | Destructive actions (delete, remove) |
| **Accent Ghost** | No bg, accent text, accent-soft hover | Accent-colored tertiary actions |

**Sizes**: `sm` (30px height), `md` (36px height), `lg` (42px height)
**States**: loading (spinner), disabled (50% opacity), hover (darker bg + shadow)

```tsx
import { Button } from "@/components/ui";

<Button variant="primary" size="md" loading={false}>Save Changes</Button>
<Button variant="secondary">Cancel</Button>
<Button variant="danger" size="sm">Delete</Button>
```

### Input

Standard text input with label, error state, and hint text.

- **Default**: `border-edge`, on focus: `border-accent` + `ring-accent/20`
- **Error**: `border-critical` + `ring-critical/20`
- **Disabled**: 50% opacity, cream background

```tsx
import { Input } from "@/components/ui";

<Input label="Email" type="email" placeholder="you@example.com" error="Required" />
```

### Textarea

Same styling as Input, with resize-y enabled.

```tsx
import { Textarea } from "@/components/ui";

<Textarea label="Description" rows={3} placeholder="Describe your idea..." />
```

### Select

Styled native select with custom chevron icon.

```tsx
import { Select } from "@/components/ui";

<Select
  label="Role"
  placeholder="Choose role"
  options={[
    { value: "admin", label: "Admin" },
    { value: "member", label: "Member" },
  ]}
/>
```

### Card

Container component with 3 variants:

| Variant | Appearance | Usage |
|---------|------------|-------|
| **Default** | White bg, subtle border | Static content containers |
| **Elevated** | White bg, border + shadow | Important/featured content |
| **Interactive** | Same as default + hover effects | Clickable cards (links) |

**Padding**: `none`, `sm` (16px), `md` (20px), `lg` (24px)

```tsx
import { Card } from "@/components/ui";

<Card variant="interactive" padding="md">
  <h3>Card Title</h3>
  <p>Card content</p>
</Card>
```

### Badge

Pill-shaped labels for status, categories, and metadata.

| Variant | Colors | Usage |
|---------|--------|-------|
| **Default** | Cream bg, subtle text | Generic labels |
| **Success** | Green-soft bg, green text | Completed, active, verified |
| **Warning** | Yellow-soft bg, amber text | Pending, in progress |
| **Danger** | Rose-soft bg, rose text | Errors, rejected |
| **Info** | Blue-soft bg, blue text | Informational |

**Dynamic colors**: Pass `color="#hex"` for status/category badges with custom colors.

```tsx
import { Badge } from "@/components/ui";

<Badge variant="success" dot>Active</Badge>
<Badge color="#3b82f6" dot>In Progress</Badge>
```

### Modal

Overlay dialog with backdrop blur, escape-to-close, scroll lock.

```tsx
import { Modal } from "@/components/ui";

<Modal open={isOpen} onClose={() => setOpen(false)} title="Create Board" size="md">
  <form>...</form>
</Modal>
```

### Tabs

Horizontal tab bar with bottom-border active indicator.

```tsx
import { Tabs } from "@/components/ui";

<Tabs
  tabs={[
    { id: "ideas", label: "Ideas", count: 12 },
    { id: "statuses", label: "Statuses" },
  ]}
  active="ideas"
  onChange={setActiveTab}
/>
```

### Avatar

Circular avatar with image or initial-based fallback. Color is deterministic based on name.

```tsx
import { Avatar } from "@/components/ui";

<Avatar name="Jane Doe" src="/photo.jpg" size="md" />
<Avatar name="John" size="sm" />  // Shows "JO" initials
```

### EmptyState

Centered placeholder for empty lists/sections.

```tsx
import { EmptyState, Button } from "@/components/ui";

<EmptyState
  title="No ideas yet"
  description="Be the first to share your feedback"
  action={<Button>Submit Idea</Button>}
/>
```

### PageHeader

Standard page header with title, optional description, back link, and action buttons.

```tsx
import { PageHeader, Button } from "@/components/ui";

<PageHeader
  title="Feature Requests"
  description="Manage and prioritize user feedback"
  backHref="/dashboard"
  backLabel="Dashboard"
  actions={<Button>New Board</Button>}
/>
```

### ColorDot

Small colored circle for status/category indicators.

```tsx
import { ColorDot } from "@/components/ui";

<ColorDot color="#3b82f6" size="sm" />
```

---

## Layout Patterns

### Page Structure

```
┌─────────────────────────────────────────┐
│  Navbar (sticky, bg-nav, full width)    │
├─────────────────────────────────────────┤
│  max-w-6xl mx-auto px-6 py-8           │
│  ┌───────────────────────────────────┐  │
│  │  PageHeader                       │  │
│  ├───────────────────────────────────┤  │
│  │  Content (Cards, forms, lists)    │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### Dashboard Navbar

- Position: sticky top-0 z-50
- Background: `bg-nav` (#1a1816)
- Height: ~56px
- Content: Brand (left, serif, cream) + User actions (right)
- Border: subtle `border-b border-white/10`

### Card Grid

```tsx
<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
  <Card variant="interactive">...</Card>
</div>
```

### Split Panel (Board Admin Ideas)

```tsx
<div className="flex gap-6">
  <div className="w-80 shrink-0 overflow-y-auto">Left panel</div>
  <div className="flex-1 min-w-0">Right panel</div>
</div>
```

### Centered Form (Auth pages)

```tsx
<div className="min-h-screen flex items-center justify-center px-4">
  <Card variant="elevated" className="w-full max-w-md">
    <form>...</form>
  </Card>
</div>
```

---

## Animation

### Available Animations

| Class | Effect | Duration | Usage |
|-------|--------|----------|-------|
| `animate-fade-in` | Opacity 0→1 | 400ms ease-out | Page sections, modals backdrop |
| `animate-slide-up` | Fade + translateY(12px→0) | 400ms ease-out | Content blocks, list items |
| `animate-slide-down` | Fade + translateY(-8px→0) | 300ms ease-out | Dropdowns, notifications |
| `animate-scale-in` | Fade + scale(0.95→1) | 200ms ease-out | Modals, popovers |

### Staggered Entry Pattern

For lists, stagger child animations using inline `animation-delay`:

```tsx
{items.map((item, i) => (
  <div
    key={item.id}
    className="animate-slide-up"
    style={{ animationDelay: `${i * 60}ms`, animationFillMode: "both" }}
  >
    ...
  </div>
))}
```

### Interactive Transitions

All interactive elements use `transition-all duration-150 ease-in-out` for hover/focus states.

---

## Iconography

The system uses inline SVGs (24x24 viewBox, 2px stroke) rather than an icon library. This keeps the bundle minimal and allows precise color control.

Common icons:
- **Chevron** (navigation, selects): `<path d="m6 9 6 6 6-6"/>`
- **Close** (modals): `<path d="M18 6 6 18M6 6l12 12"/>`
- **Back** (page headers): `<path d="m15 18-6-6 6-6"/>`
- **Vote triangle** (ideas): Custom filled/unfilled upvote triangle

---

## Patterns & Conventions

### Error Handling

- Form errors: `text-critical` below the input field
- Global errors: `bg-critical-soft border border-critical/20 text-critical` alert box
- Loading states: Button spinner + disabled state

### Empty States

Always provide:
1. A descriptive title (what's empty)
2. A brief description (why / what to do)
3. An action button (how to fix it)

### Admin vs User Content

Admin-authored content (comments, notes) is visually distinguished:
- `bg-inform-soft` background or `border-l-2 border-inform` left accent
- Admin badge next to name

### Dynamic Status/Category Colors

Statuses and categories have user-defined hex colors. Use the `Badge` component with `color` prop:

```tsx
<Badge color={status.color} dot>{status.name}</Badge>
```

This renders the badge with the hex color at 10% opacity as background and full color as text.

---

## File Structure

```
src/
├── app/
│   ├── globals.css              # Design tokens, base styles, animations
│   ├── layout.tsx               # Root layout with font loading
│   ├── page.tsx                 # Landing page
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── dashboard/
│   │   ├── layout.tsx           # Auth guard + dark navbar
│   │   ├── page.tsx             # Organizations list
│   │   └── [orgId]/
│   │       ├── page.tsx         # Org settings
│   │       └── boards/
│   │           ├── page.tsx     # Boards list
│   │           └── [boardId]/page.tsx  # Board admin
│   └── o/[orgSlug]/b/[boardSlug]/
│       ├── layout.tsx           # EndUser context wrapper
│       ├── page.tsx             # Public board
│       └── ideas/[ideaId]/page.tsx  # Idea detail
├── components/
│   ├── ui/                      # Design system components
│   │   ├── index.ts             # Barrel export
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Textarea.tsx
│   │   ├── Select.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Modal.tsx
│   │   ├── Tabs.tsx
│   │   ├── Avatar.tsx
│   │   ├── EmptyState.tsx
│   │   ├── PageHeader.tsx
│   │   └── ColorDot.tsx
│   └── public/
│       └── EndUserAuthModal.tsx  # End-user auth modal
├── contexts/
│   ├── AuthContext.tsx
│   └── EndUserContext.tsx
├── lib/
│   └── api.ts                   # API client
└── types/
    └── index.ts                 # TypeScript interfaces
```

---

## Extending the System

When adding new components or pages:

1. **Use existing tokens** — Don't introduce new colors without adding them to `@theme` in globals.css
2. **Follow the component API pattern** — Accept `className` prop, use forwardRef for form elements
3. **Maintain warmth** — Use cream/warm tones, avoid pure grays (#gray-X). Prefer `text-subtle` over `text-gray-600`
4. **Serif for headings only** — Never use `font-serif` for body text, labels, or buttons
5. **Accent sparingly** — Terracotta accent is for primary actions and active states only. Too much accent dilutes impact
