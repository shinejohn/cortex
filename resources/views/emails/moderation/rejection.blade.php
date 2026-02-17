@component('mail::message')
# Your {{ $contentTypeLabel ?? 'Content' }} Was Not Published

Dear {{ $creatorName ?? 'Creator' }},

We were unable to publish the following content because it does not meet the Day.News Content Standards Policy:

**Content:** {{ $contentTitle ?? 'N/A' }}

**Type:** {{ $contentTypeLabel ?? 'Content' }}

**Submitted:** {{ $submittedAt ?? now()->format('M j, Y g:i A') }}

## Policy Violation

**Section:** {{ $log->violation_section ?? 'N/A' }}

**Reason:** {{ $log->violation_explanation ?? 'Policy violation detected.' }}

Our Content Standards Policy exists to maintain a safe, trustworthy platform for community news and engagement. You can review the complete policy here: [{{ $policyUrl ?? config('app.url') }}/content-policy]({{ $policyUrl ?? config('app.url') }}/content-policy)

If you believe this decision was made in error, you may file an appeal: [{{ $appealUrl ?? config('app.url') }}/appeal]({{ $appealUrl ?? config('app.url') }}/appeal)

You are welcome to submit new content that addresses the policy concern identified above.

— The Day.News Content Team
@endcomponent
