import { Link } from "@inertiajs/react";

interface ContentRemovedNoticeProps {
    contentType?: string;
}

export default function ContentRemovedNotice({ contentType = "content" }: ContentRemovedNoticeProps) {
    return (
        <div className="mx-auto max-w-2xl px-4 py-16 text-center">
            <h1 className="text-2xl font-bold">This {contentType} has been removed</h1>
            <p className="mt-4 text-muted-foreground">
                This {contentType} was removed because it did not meet the Day.News Content Standards Policy.
            </p>
            <p className="mt-4 text-muted-foreground">
                Our content standards exist to maintain a safe and trustworthy community news platform. You can
                review our complete Content Standards Policy at{" "}
                <Link href="/content-policy" className="text-primary hover:underline">
                    /content-policy
                </Link>
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
                If you are the author of this content and believe this removal was made in error, you can file
                an appeal through the link provided in your notification email.
            </p>
        </div>
    );
}
