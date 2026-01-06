<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin\Email;

use App\Http\Controllers\Controller;
use App\Models\EmailTemplate;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

final class TemplateController extends Controller
{
    public function index(Request $request): Response
    {
        $templates = EmailTemplate::query()
            ->when($request->type, fn($q, $t) => $q->where('type', $t))
            ->when($request->is_active !== null, fn($q) => $q->where('is_active', $request->is_active))
            ->orderBy('type')
            ->orderBy('name')
            ->paginate(25);

        return Inertia::render('Admin/Email/Templates/Index', [
            'templates' => $templates,
            'filters' => $request->only(['type', 'is_active']),
            'types' => ['daily_digest', 'breaking_news', 'weekly_newsletter', 'smb_report', 'emergency', 'transactional'],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Email/Templates/Create', [
            'types' => ['daily_digest', 'breaking_news', 'weekly_newsletter', 'smb_report', 'emergency', 'transactional'],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:email_templates,slug',
            'type' => 'required|in:daily_digest,breaking_news,weekly_newsletter,smb_report,emergency,transactional',
            'subject_template' => 'required|string|max:255',
            'preview_text' => 'nullable|string|max:255',
            'html_template' => 'required|string',
            'text_template' => 'nullable|string',
            'variables' => 'nullable|array',
        ]);

        $template = EmailTemplate::create($validated);

        return redirect()
            ->route('admin.email.templates.show', $template)
            ->with('success', 'Template created successfully.');
    }

    public function show(EmailTemplate $template): Response
    {
        return Inertia::render('Admin/Email/Templates/Show', [
            'template' => $template,
        ]);
    }

    public function edit(EmailTemplate $template): Response
    {
        return Inertia::render('Admin/Email/Templates/Edit', [
            'template' => $template,
            'types' => ['daily_digest', 'breaking_news', 'weekly_newsletter', 'smb_report', 'emergency', 'transactional'],
        ]);
    }

    public function update(Request $request, EmailTemplate $template): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:email_templates,slug,' . $template->id,
            'subject_template' => 'required|string|max:255',
            'preview_text' => 'nullable|string|max:255',
            'html_template' => 'required|string',
            'text_template' => 'nullable|string',
            'variables' => 'nullable|array',
            'is_active' => 'boolean',
        ]);

        $template->update($validated);

        return redirect()
            ->route('admin.email.templates.show', $template)
            ->with('success', 'Template updated successfully.');
    }
}
