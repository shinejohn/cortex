# Component Documentation
## GoEventCity Frontend Components

**Date:** 2025-12-20  
**Framework:** React 19.2.3 + TypeScript 5.9.3 + Inertia.js v2

---

## Common Components

### LoadingSpinner
**Location:** `resources/js/components/common/LoadingSpinner.tsx`

A reusable loading spinner component.

**Props:**
- `size` (optional): `"sm" | "md" | "lg"` - Size of spinner (default: "md")
- `className` (optional): Additional CSS classes
- `text` (optional): Text to display below spinner

**Usage:**
```tsx
<LoadingSpinner size="lg" text="Loading events..." />
```

---

### LoadingButton
**Location:** `resources/js/components/common/LoadingButton.tsx`

A button component with loading state.

**Props:**
- `loading` (optional): Boolean - Show loading state
- `loadingText` (optional): Text to show when loading
- All standard Button props

**Usage:**
```tsx
<LoadingButton loading={isSubmitting} loadingText="Saving...">
    Save Changes
</LoadingButton>
```

---

### ErrorMessage
**Location:** `resources/js/components/common/ErrorMessage.tsx`

Displays error messages in a user-friendly format.

**Props:**
- `title` (optional): Error title (default: "Error")
- `message`: String, array of strings, or object with field errors
- `onDismiss` (optional): Callback when dismissed
- `className` (optional): Additional CSS classes
- `variant` (optional): `"default" | "destructive"` (default: "destructive")

**Usage:**
```tsx
<ErrorMessage
    title="Validation Error"
    message={errors}
    onDismiss={() => setErrors(null)}
/>
```

---

### SuccessMessage
**Location:** `resources/js/components/common/SuccessMessage.tsx`

Displays success messages.

**Props:**
- `title` (optional): Success title (default: "Success")
- `message`: Success message string
- `onDismiss` (optional): Callback when dismissed
- `className` (optional): Additional CSS classes
- `autoDismiss` (optional): Auto-dismiss after delay (default: false)
- `autoDismissDelay` (optional): Delay in milliseconds (default: 5000)

**Usage:**
```tsx
<SuccessMessage
    message="Event created successfully!"
    autoDismiss={true}
    autoDismissDelay={3000}
/>
```

---

## Check-in Components

### CheckInButton
**Location:** `resources/js/components/check-in/CheckInButton.tsx`

Button component for checking into events.

**Props:**
- `eventId`: Event UUID
- `eventName`: Event name
- `venueName`: Venue name
- `onCheckIn` (optional): Callback after check-in

**Usage:**
```tsx
<CheckInButton
    eventId={event.id}
    eventName={event.title}
    venueName={event.venue?.name || "TBA"}
/>
```

---

### CheckInModal
**Location:** `resources/js/components/check-in/CheckInModal.tsx`

Modal component for check-in form.

**Props:**
- `isOpen`: Boolean - Modal open state
- `onClose`: Close callback
- `eventId`: Event UUID
- `eventName`: Event name

**Usage:**
```tsx
<CheckInModal
    isOpen={showModal}
    onClose={() => setShowModal(false)}
    eventId={event.id}
    eventName={event.title}
/>
```

---

### CheckInFeed
**Location:** `resources/js/components/check-in/CheckInFeed.tsx`

Displays a feed of recent check-ins.

**Props:**
- `checkIns`: Array of check-in objects
- `maxItems` (optional): Maximum items to display (default: 10)

**Usage:**
```tsx
<CheckInFeed checkIns={recentCheckIns} maxItems={5} />
```

---

### PlannedEventsWidget
**Location:** `resources/js/components/check-in/PlannedEventsWidget.tsx`

Widget displaying user's planned events.

**Props:**
- `userId`: User UUID
- `maxItems` (optional): Maximum items to display

**Usage:**
```tsx
<PlannedEventsWidget userId={user.id} maxItems={5} />
```

---

## Hub Components

### HubCard
**Location:** `resources/js/components/hubs/HubCard.tsx` (if exists)

Card component for displaying hub information.

**Props:**
- `hub`: Hub object
- `showStats` (optional): Show statistics (default: true)

---

## Ticket Components

### TicketCard
**Location:** `resources/js/components/tickets/TicketCard.tsx` (if exists)

Card component for displaying ticket information.

**Props:**
- `ticketPlan`: Ticket plan object
- `onSelect` (optional): Selection callback
- `selected` (optional): Is selected

---

## Event Components

### EventCard
**Location:** `resources/js/components/events/EventCard.tsx` (if exists)

Card component for displaying event information.

**Props:**
- `event`: Event object
- `showVenue` (optional): Show venue info (default: true)
- `showPrice` (optional): Show price (default: true)

---

## UI Components

All UI components are located in `resources/js/components/ui/` and are based on Radix UI and shadcn/ui patterns.

**Common UI Components:**
- `Button` - Button component with variants
- `Card` - Card container component
- `Badge` - Badge component
- `Tabs` - Tab navigation component
- `Alert` - Alert/notification component
- `Input` - Input field component
- `Select` - Select dropdown component
- `Dialog` - Modal dialog component
- `DropdownMenu` - Dropdown menu component

---

## Component Patterns

### Loading States
Always use `LoadingSpinner` or `LoadingButton` for loading states:

```tsx
{isLoading ? (
    <LoadingSpinner text="Loading..." />
) : (
    <Content />
)}
```

### Error Handling
Use `ErrorMessage` component for displaying errors:

```tsx
{errors && (
    <ErrorMessage
        title="Error"
        message={errors}
        onDismiss={() => setErrors(null)}
    />
)}
```

### Success Messages
Use `SuccessMessage` component for success feedback:

```tsx
{success && (
    <SuccessMessage
        message={success}
        autoDismiss={true}
    />
)}
```

---

**Last Updated:** 2025-12-20

