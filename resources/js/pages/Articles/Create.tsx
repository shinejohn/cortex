import { Head, router, useForm } from "@inertiajs/react";
import { useAiCreator } from "@/hooks/useAiCreator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";
import { Loader2Icon } from "lucide-react";

interface Region {
  id: string;
  name: string;
  type: string;
  metadata?: Record<string, unknown>;
}

interface Props {
  regions: Region[];
  categories: string[];
  availableTags: Record<string, string>;
  defaultRegionId: string | null;
  contentType: string;
}

export default function ArticleCreate({ regions, categories, defaultRegionId, contentType }: Props) {
  const { session, initSession, analyzeContent, generateContent, generateHeadlines, isLoading } = useAiCreator();
  const [aiPrompt, setAiPrompt] = useState("");
  const [headlines, setHeadlines] = useState<Array<{ headline: string }>>([]);
  const [selectedRegionId, setSelectedRegionId] = useState<string>(defaultRegionId ?? regions[0]?.id ?? "");

  const { data, setData, post, processing, errors } = useForm({
    title: "",
    content: "",
    excerpt: "",
    category: categories[0] ?? "local_news",
    region_id: defaultRegionId ?? regions[0]?.id ?? "",
    tags: [] as string[],
    featured_image_url: "",
    session_id: "",
    status: "draft",
  });

  useEffect(() => {
    initSession(contentType, selectedRegionId).then((s) => {
      if (s) setData("session_id", s.id);
    });
  }, [contentType, selectedRegionId]);

  useEffect(() => {
    if (!data.content || data.content.length < 50) return;
    const t = setTimeout(() => {
      analyzeContent(data.title, data.content).catch(() => {});
    }, 3000);
    return () => clearTimeout(t);
  }, [data.title, data.content]);

  const handleGenerate = async () => {
    if (!aiPrompt.trim()) return;
    const result = await generateContent(aiPrompt);
    if (result && typeof result === "object" && "title" in result && "content" in result) {
      setData({
        ...data,
        title: (result as { title?: string }).title ?? data.title,
        content: (result as { content?: string }).content ?? data.content,
        excerpt: (result as { excerpt?: string }).excerpt ?? data.excerpt,
      });
    }
  };

  const handleHeadlines = async () => {
    const topic = data.title || aiPrompt || "local news";
    const result = await generateHeadlines(topic);
    if (Array.isArray(result)) {
      setHeadlines(result.map((h) => ({ headline: typeof h === "object" && h && "headline" in h ? (h as { headline: string }).headline : String(h) })));
    }
  };

  return (
    <>
      <Head title="Create Article" />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="mx-auto max-w-5xl px-4">
          <h1 className="text-2xl font-bold mb-6">Create Article</h1>

          <div className="flex gap-6">
            <div className="flex-1 space-y-6">
              <div className="rounded-lg border bg-white p-4 dark:bg-gray-800 dark:border-gray-700">
                <Label className="text-sm font-medium">AI Writing</Label>
                <div className="mt-2 flex gap-2">
                  <Input
                    placeholder="Describe what you want to write..."
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="button" onClick={handleGenerate} disabled={isLoading}>
                    {isLoading ? <Loader2Icon className="size-4 animate-spin" /> : "Generate"}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleHeadlines} disabled={isLoading}>
                    Headlines
                  </Button>
                </div>
              </div>

              {headlines.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {headlines.map((h, i) => (
                    <Button
                      key={i}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setData("title", h.headline)}
                    >
                      {h.headline}
                    </Button>
                  ))}
                </div>
              )}

              <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                <div>
                  <Label htmlFor="region_id">Region</Label>
                  <Select
                    value={data.region_id}
                    onValueChange={(v) => {
                      setData("region_id", v);
                      setSelectedRegionId(v);
                    }}
                  >
                    <SelectTrigger id="region_id">
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      {regions.map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={data.title}
                    onChange={(e) => setData("title", e.target.value)}
                    placeholder="Article headline"
                  />
                  {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title}</p>}
                </div>

                <div>
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={data.content}
                    onChange={(e) => setData("content", e.target.value)}
                    placeholder="Write your article..."
                    rows={12}
                  />
                  {errors.content && <p className="text-sm text-red-500 mt-1">{errors.content}</p>}
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={data.category} onValueChange={(v) => setData("category", v)}>
                    <SelectTrigger id="category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c.replace(/_/g, " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    disabled={processing}
                    onClick={() => {
                      setData("status", "draft");
                      post(route("articles.store") as string);
                    }}
                  >
                    {processing ? <Loader2Icon className="size-4 animate-spin" /> : "Save Draft"}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={processing}
                    onClick={() => {
                      setData("status", "submit_for_review");
                      post(route("articles.store") as string);
                    }}
                  >
                    Submit for Review
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
