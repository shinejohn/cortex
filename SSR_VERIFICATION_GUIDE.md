# SSR Verification Guide

**Quick guide to verify SSR is working for SEO/AI**

## Quick Test

### 1. View Page Source

```bash
# Test a content page
curl -H "Host: dev.day.news" http://ALB_DNS/posts/article-slug -s | head -100
```

**Expected:** Full HTML with article content, not just `<div id="app"></div>`

### 2. Check SSR Service

```bash
# Check if SSR service is running
aws ecs describe-services \
  --cluster fibonacco-dev \
  --services fibonacco-dev-ssr \
  --region us-east-1 \
  --query 'services[0].{Status:status,Running:runningCount,Desired:desiredCount}'
```

**Expected:** Status: `ACTIVE`, Running: `1`, Desired: `1`

### 3. Test SSR Endpoint

```bash
# Test SSR service directly (from ECS task)
curl http://inertia-ssr:13714/health
```

**Expected:** Health check response

### 4. Check SSR Logs

```bash
# View SSR service logs
aws logs tail /ecs/fibonacco/dev/ssr --follow --region us-east-1
```

**Expected:** SSR rendering logs

---

## What SSR Should Provide

### ✅ SEO Benefits (Already Working)

1. **Full HTML Content**
   - Article text in initial HTML
   - Not just empty `<div id="app">`
   - Search engines can index content

2. **Meta Tags**
   - Title, description in `<head>`
   - Open Graph tags
   - Twitter Card tags
   - All SSR'd

3. **Structured Data**
   - JSON-LD schema in `<head>`
   - Article schema with full metadata
   - Rich snippets for search engines

4. **Social Sharing**
   - Preview cards work (Open Graph)
   - Images load correctly
   - Descriptions display

### ✅ AI Crawling Benefits (Already Working)

1. **Complete Content**
   - Full article text available
   - AI crawlers can read everything
   - No JavaScript execution needed

2. **Structured Information**
   - Author, date, category
   - Clear content hierarchy
   - Easy to parse

3. **Plain Text Available**
   - JSON-LD includes plain text
   - HTML content can be extracted
   - AI-friendly format

---

## Current Implementation Status

✅ **SSR Enabled:** Yes (default)  
✅ **SSR Service:** Deployed  
✅ **Content Pages:** Server-rendered  
✅ **SEO Components:** SSR'd  
✅ **Structured Data:** SSR'd  

**Your setup is SEO/AI-friendly!** 🎯

