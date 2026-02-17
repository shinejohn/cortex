@component('mail::message')
# Your {{ $contentTypeLabel ?? 'Content' }} Has Been Removed from View

Dear Creator,

The following content has been removed from public view on Day.News:

**Content:** {{ $contentTitle ?? 'N/A' }}

**Originally Published:** {{ $publishedAt ?? 'N/A' }}

## Reason for Removal

While your content may not have directly violated our Content Standards Policy, it generated an unacceptable volume of responses that do violate our policy. Our automated monitoring system detected that the discourse surrounding your content fell below our community standards threshold.

**Civil Discourse Ratio:** {{ number_format($civilDiscourseRatio * 100, 0) }}% of responses met community standards

**Required Threshold:** 50%

Your content has not been deleted and is preserved in our records. It is no longer accessible via public URLs or search.

If you believe this removal was unjust, you may file an appeal: [{{ $appealUrl ?? config('app.url') }}/appeal]({{ $appealUrl ?? config('app.url') }}/appeal)

— The Day.News Content Team
@endcomponent
