import { Loader2Icon, SparklesIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AiWritingPanelProps {
  prompt: string;
  onPromptChange: (value: string) => void;
  onGenerate: () => void;
  onHeadlines: () => void;
  isLoading: boolean;
  error?: string;
  headlineSuggestions: Array<{ headline: string }>;
  onSelectHeadline: (headline: string) => void;
}

export default function AiWritingPanel({
  prompt,
  onPromptChange,
  onGenerate,
  onHeadlines,
  isLoading,
  error,
  headlineSuggestions,
  onSelectHeadline,
}: AiWritingPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SparklesIcon className="size-5 text-amber-500" />
          AI Writing Assistant
        </CardTitle>
        <CardDescription>
          Describe what you want to write and AI will help you draft. Or get headline suggestions for your topic.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
        <div>
          <Label htmlFor="ai-prompt">What do you want to write about?</Label>
          <div className="mt-2 flex gap-2">
            <Input
              id="ai-prompt"
              value={prompt}
              onChange={(e) => onPromptChange(e.target.value)}
              placeholder="e.g. Local bakery opens new location downtown..."
              className="flex-1"
            />
            <Button type="button" onClick={onGenerate} disabled={isLoading || !prompt.trim()}>
              {isLoading ? <Loader2Icon className="size-4 animate-spin" /> : "Generate"}
            </Button>
            <Button type="button" variant="outline" onClick={onHeadlines} disabled={isLoading}>
              Headlines
            </Button>
          </div>
        </div>
        {headlineSuggestions.length > 0 && (
          <div>
            <Label className="text-sm">Suggested headlines — click to use</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {headlineSuggestions.map((h, i) => (
                <Button
                  key={i}
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="h-auto py-1.5 text-left font-normal"
                  onClick={() => onSelectHeadline(h.headline)}
                >
                  {h.headline}
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
