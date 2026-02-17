# PHASE 4: ALPHASITE + SMB COMMAND CENTER UI CODE REVIEW
## Antigravity Instructions — Page-by-Page Inspection

---

**Objective:** Review every page and component belonging to AlphaSite (AI Employee Management) and the SMB Command Center (CRM, Pipeline, Campaigns). These are business-facing dashboards with more complex state management and data flows.

**Prerequisites:** Phase 3 must be complete.

**Important Database Note:** AlphaSite connects to the **Postgres Publishing** database. The SMB Command Center connects to **Postgres CC CRM SMB**. Verify that cross-database queries use the correct connection names in `config/database.php`.

---

## APP 4A: AlphaSite (AI Employee Management)

### Expected Pages — Three-Tier Architecture

**Tier 1: Customer Business Interface**
- **Dashboard ("Your AI Team")** — AI employee cards, business health metrics, recent activity, quick actions
- **AI Employee Detail** — Individual AI worker profile, task history, performance metrics
- **Hire New AI** — AI employee selection/configuration wizard
- **Task Assignment** — Assign tasks to AI employees
- **Performance Reports** — Individual and team performance analytics
- **Billing/Subscription** — Plan management, usage, invoicing

**Tier 2: Fibonacco Operations Dashboard**
- **Community Manager Dashboard** — Multi-client overview
- **Content Oversight** — AI-generated content review
- **Client Management** — Business customer list and management

**Tier 3: Admin Control Panel**
- **Agent Configuration** — AI agent setup and tuning
- **Pricing Management** — Plan and pricing configuration
- **Platform Metrics** — System-wide analytics

### AlphaSite-Specific Checks
```
□ AI Employee cards render with correct data (name, status, efficiency, avatar)
□ Employee status indicators work (Active, Idle, Error states)
□ Task assignment flow works end-to-end (select AI, assign task, confirm)
□ Performance metrics charts render with real data (not placeholder)
□ Efficiency percentages calculate and display correctly
□ "Hire New AI" wizard steps all work (navigation between steps)
□ Wizard form validation works at each step
□ Wizard final submission creates the AI employee record
□ Business health dashboard metrics pull from correct data sources
□ Recent activity feed shows chronological, real activities
□ Quick action buttons trigger correct workflows
□ Billing page shows current plan and usage accurately
□ Plan upgrade/downgrade flow works with Stripe
□ Multi-tier access control works (Tier 1 users cannot see Tier 3 pages)
□ Role-based UI shows/hides elements correctly per user tier
□ AI employee "task completed" notifications display
□ Performance comparison between AI employees works
□ Data refresh/polling works for real-time status updates
□ Logout properly clears session across tiers
```

---

## APP 4B: SMB COMMAND CENTER

### Expected Pages — CRM Module

**CRM Main Pages**
- **CRM Dashboard** — `/crm` — Key metrics, quick actions, activity overview
- **Customer Search & Lookup** — Search by name, email, phone, business
- **Customer List Management** — Sortable, filterable customer table
- **Customer Detail Page** — Full customer profile with activity timeline, notes, tasks, attachments

**Pipeline Management**
- **Pipeline Board View** — Kanban-style deal stages (drag-and-drop)
- **Pipeline List View** — Tabular deal listing
- **Pipeline Settings** — Stage configuration
- **Deal/Opportunity Detail** — Deal info, timeline, contacts, value
- **Create/Edit Deal Modal** — Deal form with validation

**Campaign Management**
- **Campaigns List** — All campaigns with status indicators
- **Campaign Detail** — Campaign overview with metrics
- **Campaign Analytics** — Performance charts and data
- **Campaign Builder** — Multi-step campaign creation wizard
- **A/B Test Setup** — Variant configuration

**Segments & Lists**
- **Segments List** — All customer segments
- **Segment Builder** — Rule-based segment creation
- **Segment Detail** — Segment membership and analytics
- **Smart Lists** — Dynamic, auto-updating lists

**CRM Reports & Analytics**
- **Customer Analytics Report** — Customer behavior and demographics
- **Pipeline Analytics Report** — Deal flow and conversion rates
- **Campaign Performance Report** — Campaign ROI and engagement
- **Revenue Attribution Report** — Revenue source tracking
- **Customer Lifetime Value Report** — CLV calculations
- **Cohort Analysis** — Retention and behavior cohorts

**Bulk Operations**
- **Bulk Actions Panel** — Multi-select actions on customer list
- **Import Customers** — CSV/file upload with field mapping
- **Export Customers** — Download customer data
- **Merge Duplicates** — Duplicate detection and merging
- **Bulk Update** — Mass field updates

**CRM Settings**
- **Custom Fields Manager** — Create/edit custom data fields
- **Tags & Labels Manager** — Tag taxonomy management
- **Pipeline Stage Editor** — Drag-and-drop stage ordering
- **Lead Scoring Rules** — Scoring criteria configuration
- **Assignment Rules** — Auto-assignment logic

### SMB Command Center-Specific Checks
```
□ CRM Dashboard metrics load from Postgres CC CRM SMB database
□ Customer search returns results across all searchable fields
□ Customer search debounces input (no query on every keystroke)
□ Customer list pagination works with large datasets
□ Customer list sorting works on all sortable columns
□ Customer list filtering works (status, tags, segments, date range)
□ Customer detail page loads all tabs (overview, activity, deals, tasks)
□ Activity timeline shows chronological entries
□ Note creation form works (save, cancel, edit existing)
□ Task creation works with due date picker
□ Task status toggling works (complete/incomplete)
□ File attachment upload works
□ Pipeline board renders all stages as columns
□ Pipeline drag-and-drop moves deals between stages
□ Pipeline drag-and-drop updates the deal's stage in the database
□ Deal value totals update per stage when deals move
□ Deal detail page shows correct associated contacts
□ Deal creation modal validates required fields
□ Deal editing saves changes and shows success feedback
□ Campaign list shows correct status badges (Draft, Active, Completed, Paused)
□ Campaign builder wizard validates each step before allowing next
□ Campaign builder saves draft state between sessions
□ Campaign analytics charts render with real campaign data
□ A/B test configuration saves variant settings
□ Segment builder rule conditions work (AND/OR logic)
□ Segment builder preview shows matching customer count
□ Smart lists auto-refresh when filter criteria are met
□ Report pages render charts without errors
□ Report date range selectors work
□ Report data exports work (CSV, PDF if applicable)
□ Bulk select checkboxes work (select all, select individual)
□ Bulk actions dropdown appears when items are selected
□ Import page validates CSV format and shows field mapping
□ Import preview shows data correctly before final import
□ Merge duplicates page shows comparison side-by-side
□ Merge operation preserves the correct "master" record
□ Custom field creation works for all field types (text, number, date, select, etc.)
□ Custom fields appear on customer detail page after creation
□ Tag management allows CRUD operations
□ Pipeline stage editor saves new order after drag-and-drop
□ Lead scoring rules save and apply correctly
□ Assignment rules trigger on new lead creation
□ Cross-database queries use 'command_center' connection (not default)
□ No queries accidentally hit the Publishing database
```

---

## CROSS-DATABASE VERIFICATION

Since AlphaSite and the Command Center use different databases, verify:

```
□ AlphaSite controllers use the correct database connection for each query
□ AlphaSite models that access CC data use: protected $connection = 'command_center'
□ Command Center controllers use 'command_center' connection by default
□ CC controllers accessing Publishing data use: DB::connection('publishing')
□ No cross-database joins are attempted (these fail — use separate queries + merge)
□ config/database.php has all required connections defined
□ Environment variables for both databases are set correctly
□ Connection failures to cross-databases degrade gracefully (log warning, don't crash)
```

---

## COMPLETION CRITERIA FOR PHASE 4

Phase 4 is COMPLETE when:

1. ✅ Every AlphaSite page has been inspected with all standard + app-specific checks
2. ✅ Every SMB Command Center page has been inspected with all standard + CRM-specific checks
3. ✅ Cross-database verification is complete
4. ✅ Every issue at ALL severity levels (CRITICAL, HIGH, MEDIUM, LOW) has been FIXED and VERIFIED — zero open issues
5. ✅ Master checklist updated for both apps
6. ✅ All changes committed to `qa/pre-production-phase-4` branch
7. ✅ `QA_AUDIT_LOG_PHASE_4.json` generated and committed

**Do not proceed to Phase 5 until Phase 4 is fully complete.**
