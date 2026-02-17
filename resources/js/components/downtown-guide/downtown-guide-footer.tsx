import { Link } from "@inertiajs/react";
import ApplicationLogo from "@/components/app-logo";

export default function DowntownGuideFooter() {
    return (
        <footer className="border-t bg-background/95 pb-20 md:pb-0">
            <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
                <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
                    <Link href="/" className="flex items-center space-x-2">
                        <ApplicationLogo className="h-6 w-6" />
                        <span className="font-bold">Downtown Guide</span>
                    </Link>
                    <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                        Built by{" "}
                        <a
                            href="#"
                            target="_blank"
                            rel="noreferrer"
                            className="font-medium underline underline-offset-4"
                        >
                            Fibonacco
                        </a>
                        . The source code is available on{" "}
                        <a
                            href="#"
                            target="_blank"
                            rel="noreferrer"
                            className="font-medium underline underline-offset-4"
                        >
                            GitHub
                        </a>
                        .
                    </p>
                </div>
                <div className="flex items-center space-x-4">
                    <Link href="/privacy" className="text-sm text-muted-foreground hover:underline">
                        Privacy
                    </Link>
                    <Link href="/terms" className="text-sm text-muted-foreground hover:underline">
                        Terms
                    </Link>
                </div>
            </div>
        </footer>
    );
}
