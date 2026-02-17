import { Head, router, useForm } from "@inertiajs/react";
import { useAiCreator } from "@/hooks/useAiCreator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";
import { Loader2Icon } from "lucide-react";
import { route } from "ziggy-js";

interface Region {
  id: string;
  name: string;
  type: string;
  metadata?: Record<string, unknown>;
}

interface Props {
  regions: Region[];
  eventCategories: string[];
  defaultRegionId: string | null;
  contentType: string;
}

export default function EventCreate({ regions, eventCategories, defaultRegionId, contentType }: Props) {
  const { session, initSession, parseEvent, matchVenue, isLoading } = useAiCreator();
  const [aiInput, setAiInput] = useState("");
  const [venueMatches, setVenueMatches] = useState<Array<{ id: string; name: string; address: string | null }>>([]);
  const [selectedRegionId, setSelectedRegionId] = useState<string>(defaultRegionId ?? regions[0]?.id ?? "");

  const { data, setData, post, processing } = useForm({
    title: "",
    description: "",
    event_date: "",
    event_time: "",
    end_date: "",
    end_time: "",
    venue_id: "",
    venue_name: "",
    venue_address: "",
    category: eventCategories[0] ?? "music",
    subcategories: [] as string[],
    region_id: defaultRegionId ?? regions[0]?.id ?? "",
    is_free: false,
    price_min: "",
    price_max: "",
    performer_id: "",
    session_id: "",
  });

  useEffect(() => {
    initSession(contentType, selectedRegionId).then((s) => {
      if (s) setData("session_id", s.id);
    });
  }, [contentType, selectedRegionId]);

  const handleParseEvent = async () => {
    if (!aiInput.trim()) return;
    const result = await parseEvent(aiInput);
    if (result && typeof result === "object") {
      const r = result as Record<string, unknown>;
      setData({
        ...data,
        title: (r.title as string) ?? data.title,
        description: (r.description as string) ?? data.description,
        event_date: (r.event_date as string) ?? data.event_date,
        event_time: (r.event_time as string) ?? data.event_time,
        end_date: (r.end_date as string) ?? data.end_date,
        end_time: (r.end_time as string) ?? data.end_time,
        venue_name: (r.venue_name as string) ?? data.venue_name,
        venue_address: (r.venue_address as string) ?? data.venue_address,
        category: (r.category as string) ?? data.category,
        is_free: (r.is_free as boolean) ?? data.is_free,
        price_min: String((r.price_min as number) ?? data.price_min),
        price_max: String((r.price_max as number) ?? data.price_max),
      });
    }
  };

  const handleVenueSearch = async () => {
    const query = data.venue_name?.trim();
    if (!query) return;
    const matches = await matchVenue(query);
    setVenueMatches(Array.isArray(matches) ? matches : []);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route("events.store-ai") as string);
  };

  return (
    <>
      <Head title="Create Event" />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="mx-auto max-w-4xl px-4">
          <h1 className="text-2xl font-bold mb-6">Create Event</h1>

          <div className="rounded-lg border bg-white p-4 mb-6 dark:bg-gray-800 dark:border-gray-700">
            <Label className="text-sm font-medium">AI Event Parser</Label>
            <p className="text-muted-foreground text-sm mt-1 mb-2">
              Paste event details, a flyer description, or a URL and AI will fill in everything for you.
            </p>
            <div className="flex gap-2">
              <Textarea
                placeholder="e.g. Jazz Night at Blue Note, March 15 at 8pm, 131 W 3rd St..."
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                rows={3}
                className="flex-1"
              />
              <Button type="button" onClick={handleParseEvent} disabled={isLoading}>
                {isLoading ? <Loader2Icon className="size-4 animate-spin" /> : "Parse with AI"}
              </Button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="Event title"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={data.description}
                onChange={(e) => setData("description", e.target.value)}
                placeholder="Event description"
                rows={6}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="event_date">Date</Label>
                <Input
                  id="event_date"
                  type="date"
                  value={data.event_date}
                  onChange={(e) => setData("event_date", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="event_time">Time</Label>
                <Input
                  id="event_time"
                  type="text"
                  value={data.event_time}
                  onChange={(e) => setData("event_time", e.target.value)}
                  placeholder="e.g. 8:00 PM"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="venue_name">Venue</Label>
              <div className="flex gap-2">
                <Input
                  id="venue_name"
                  value={data.venue_name}
                  onChange={(e) => setData("venue_name", e.target.value)}
                  placeholder="Search or enter venue name"
                />
                <Button type="button" variant="outline" onClick={handleVenueSearch} disabled={isLoading}>
                  Search
                </Button>
              </div>
              {venueMatches.length > 0 && (
                <div className="mt-2 space-y-1">
                  {venueMatches.map((v) => (
                    <Button
                      key={v.id}
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => {
                        setData({ ...data, venue_id: v.id, venue_name: v.name, venue_address: v.address ?? "" });
                        setVenueMatches([]);
                      }}
                    >
                      {v.name} {v.address && `— ${v.address}`}
                    </Button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={data.category} onValueChange={(v) => setData("category", v)}>
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {eventCategories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" disabled={processing}>
              {processing ? <Loader2Icon className="size-4 animate-spin" /> : "Create Event"}
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}
