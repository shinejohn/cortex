import { Head, Link } from "@inertiajs/react";
import { ArrowLeftIcon, BellIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Region {
  id: string;
  name: string;
  type: string;
  metadata?: Record<string, unknown>;
}

interface Props {
  contentType: string;
  contentLabel: string;
  plannedFeatures: string[];
  regions: Region[];
}

export default function ComingSoon({ contentType, contentLabel, plannedFeatures, regions }: Props) {
  return (
    <>
      <Head title={`AI-Assisted ${contentLabel} Creator — Coming Soon`} />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-2xl px-4 py-12">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            <ArrowLeftIcon className="size-4" />
            Back
          </Link>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">AI-Assisted {contentLabel} Creator</CardTitle>
              <p className="text-muted-foreground mt-1">Coming Soon</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-gray-600 dark:text-gray-400">
                We&apos;re building an AI-powered creator for {contentLabel.toLowerCase()} content. Here&apos;s what to expect:
              </p>
              <ul className="list-inside list-disc space-y-2 text-gray-600 dark:text-gray-400">
                {plannedFeatures.map((feature, i) => (
                  <li key={i}>{feature}</li>
                ))}
              </ul>

              <div className="space-y-2">
                <label className="text-sm font-medium">Region (preview)</label>
                <Select disabled>
                  <SelectTrigger>
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
                <p className="text-xs text-gray-500">Region selector will be functional when this creator launches.</p>
              </div>

              <Button disabled className="w-full">
                <BellIcon className="mr-2 size-4" />
                Notify me when available
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
