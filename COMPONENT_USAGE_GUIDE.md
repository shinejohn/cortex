# shadcn/ui Component Usage Guide

**Date:** January 2025  
**Framework:** React 19 + TypeScript + Tailwind CSS 4  
**UI Library:** shadcn/ui (Radix UI primitives)

---

## Overview

This guide documents the standardized component patterns used across all multisite applications (Go Event City, Day News, Downtown Guide, Go Local Voices, Alpha Site).

---

## Core Principles

### 1. **Semantic Tokens Over Hardcoded Colors**

❌ **Don't:**
```tsx
<div className="bg-blue-600 text-white">Button</div>
<span className="bg-indigo-100 text-indigo-800">Badge</span>
```

✅ **Do:**
```tsx
<Button variant="default">Button</Button>
<Badge variant="secondary">Badge</Badge>
```

### 2. **Use shadcn Components**

Always prefer shadcn components over plain HTML elements:

- `<Button>` instead of `<button>`
- `<Badge>` instead of `<span>` with custom styles
- `<Input>` instead of `<input>`
- `<Card>` instead of `<div>` with custom card styles
- `<Alert>` instead of custom alert divs

### 3. **Consistent Variants**

Use semantic variants that work across themes:

- `variant="default"` - Primary actions
- `variant="secondary"` - Secondary actions
- `variant="outline"` - Outlined buttons/badges
- `variant="ghost"` - Minimal styling
- `variant="destructive"` - Destructive actions

---

## Component Reference

### Button

**Location:** `@/components/ui/button`

**Variants:**
- `default` - Primary button (uses `bg-primary`)
- `secondary` - Secondary button (uses `bg-secondary`)
- `destructive` - Destructive actions (uses `bg-destructive`)
- `outline` - Outlined button
- `ghost` - Minimal styling
- `link` - Link-style button

**Sizes:**
- `default` - Standard size
- `sm` - Small
- `lg` - Large
- `icon` - Square icon button

**Example:**
```tsx
import { Button } from "@/components/ui/button";

<Button variant="default" size="sm">Submit</Button>
<Button variant="ghost" size="icon">
  <Icon className="h-4 w-4" />
</Button>
```

---

### Badge

**Location:** `@/components/ui/badge`

**Variants:**
- `default` - Primary badge
- `secondary` - Secondary badge (most common)
- `destructive` - Error/warning badge
- `outline` - Outlined badge

**Example:**
```tsx
import { Badge } from "@/components/ui/badge";

<Badge variant="secondary">Verified</Badge>
<Badge variant="destructive">Error</Badge>
```

---

### Input

**Location:** `@/components/ui/input`

**Features:**
- Automatic focus states
- Error states via `aria-invalid`
- Dark mode support
- Consistent sizing

**Example:**
```tsx
import { Input } from "@/components/ui/input";

<Input 
  type="text" 
  placeholder="Enter name"
  aria-invalid={!!errors.name}
/>
```

---

### Card

**Location:** `@/components/ui/card`

**Components:**
- `Card` - Main container
- `CardHeader` - Header section
- `CardTitle` - Title
- `CardDescription` - Description
- `CardContent` - Main content
- `CardFooter` - Footer section

**Example:**
```tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
</Card>
```

---

### Alert

**Location:** `@/components/ui/alert`

**Variants:**
- `default` - Standard alert
- `destructive` - Error alert

**Components:**
- `Alert` - Container
- `AlertTitle` - Title
- `AlertDescription` - Description

**Example:**
```tsx
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

<Alert variant="destructive">
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>Something went wrong</AlertDescription>
</Alert>
```

---

## Semantic Color Tokens

### Background Colors
- `bg-background` - Main background
- `bg-card` - Card background
- `bg-popover` - Popover/dropdown background
- `bg-primary` - Primary color
- `bg-secondary` - Secondary color
- `bg-muted` - Muted/subtle background
- `bg-accent` - Accent color
- `bg-destructive` - Error/destructive actions
- `bg-success` - Success states

### Text Colors
- `text-foreground` - Primary text
- `text-muted-foreground` - Secondary text
- `text-primary` - Primary colored text
- `text-secondary` - Secondary colored text
- `text-destructive` - Error text
- `text-success-foreground` - Success text

### Border Colors
- `border` - Default border
- `border-border` - Standard border
- `border-input` - Input borders
- `border-primary` - Primary border
- `border-destructive` - Error border

---

## Common Patterns

### Form Errors

**Before:**
```tsx
<p className="text-sm text-red-600">{errors.field}</p>
```

**After:**
```tsx
<p className="text-sm text-destructive">{errors.field}</p>
```

---

### Theme-Specific Colors

**Before:**
```tsx
const themeColors = {
  daynews: "bg-blue-600",
  eventcity: "bg-indigo-600",
};
```

**After:**
```tsx
// Use semantic tokens - works for all themes
<Button variant="default">Action</Button>
```

---

### Star Ratings

**Before:**
```tsx
<StarIcon className={isFilled ? "text-blue-500" : "text-gray-300"} />
```

**After:**
```tsx
<StarIcon className={isFilled ? "fill-yellow-400 text-yellow-400" : "text-muted"} />
```

---

### Category Badges

**Before:**
```tsx
<span className="bg-blue-100 text-blue-800">{category}</span>
```

**After:**
```tsx
<Badge variant="secondary">{category}</Badge>
```

---

## Migration Checklist

When refactoring components:

- [ ] Replace hardcoded colors with semantic tokens
- [ ] Convert `<button>` to `<Button>` component
- [ ] Convert custom badges to `<Badge>` component
- [ ] Convert `<input>` to `<Input>` component
- [ ] Replace theme-specific color objects with semantic tokens
- [ ] Test dark mode support
- [ ] Verify accessibility (focus states, ARIA attributes)
- [ ] Check responsive behavior

---

## Best Practices

1. **Consistency First** - Use the same patterns across all apps
2. **Semantic Over Visual** - Prefer semantic tokens over specific colors
3. **Component Over Custom** - Use shadcn components when available
4. **Accessibility** - Always include proper ARIA attributes
5. **Dark Mode** - Test components in both light and dark modes

---

## Resources

- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Radix UI Primitives](https://www.radix-ui.com)
- [Tailwind CSS 4](https://tailwindcss.com)
- [CSS Variables Reference](./resources/css/app.css)

---

## Migration Status

**Last Updated:** January 2025

### ✅ Completed
- ✅ Core components refactored (header, footer, cards, badges)
- ✅ Domain-specific components refactored (event-city, day-news, downtown-guide, local-voices)
- ✅ Shared components refactored (events, business, news, calendar)
- ✅ 50+ page components refactored across all domains
- ✅ Error messages standardized to `text-destructive`
- ✅ Background colors standardized to semantic tokens
- ✅ Theme-specific colors replaced with semantic tokens

### 📊 Statistics
- **Components refactored:** 90+
- **Pages refactored:** 50+
- **Hardcoded colors replaced:** 200+ instances
- **Remaining hardcoded colors:** ~17 files (edge cases, complex patterns)

### 🎯 Remaining Work
- Some shared components may have edge cases
- Complex conditional styling patterns may need manual review
- Dark mode variants in some components

---

## Questions?

If you're unsure about which component or variant to use, check existing components in:
- `resources/js/components/ui/` - shadcn components
- `resources/js/components/shared/` - Shared component examples
- `resources/js/components/common/` - Common component patterns

