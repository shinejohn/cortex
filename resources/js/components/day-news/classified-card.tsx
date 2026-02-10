import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Classified } from "@/types/classified";
import { Link } from "@inertiajs/react";
import { Calendar, ImageOff, MapPin, Tag } from "lucide-react";
import { route } from "ziggy-js";
import { ClassifiedSaveButton } from "./classified-save-button";

interface Props {
    classified: Classified;
    variant?: "default" | "featured" | "compact";
}

export function ClassifiedCard({ classified, variant = "default" }: Props) {
    const classifiedUrl = route("daynews.classifieds.show", { slug: classified.slug });
    const mainImage = classified.images && classified.images.length > 0 ? classified.images[0].url : null;

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

        if (diffInDays === 0) return "Today";
        if (diffInDays === 1) return "Yesterday";
        if (diffInDays < 7) return `${diffInDays} days ago`;
        return date.toLocaleDateString();
    };

    if (variant === "compact") {
        return (
            <Card className="group overflow-hidden border-none shadow-sm hover:shadow-md transition-all p-0">
                <div className="flex gap-3 p-4">
                    <div className="size-16 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                        {mainImage ? (
                            <img src={mainImage} alt={classified.title} className="size-full object-cover" />
                        ) : (
                            <div className="flex size-full items-center justify-center">
                                <ImageOff className="size-6 text-muted-foreground" />
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <Link href={classifiedUrl}>
                            <h3 className="line-clamp-1 font-display font-black tracking-tight text-sm transition-colors group-hover:text-primary">{classified.title}</h3>
                        </Link>
                        <p className="text-sm font-bold text-primary">{classified.price_display}</p>
                        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                            {classified.condition_display && (
                                <Badge variant="secondary" className="text-[10px] uppercase tracking-widest font-black">{classified.condition_display}</Badge>
                            )}
                        </div>
                    </div>
                </div>
            </Card>
        );
    }

    if (variant === "featured") {
        return (
            <Card className="group overflow-hidden border-none shadow-sm hover:shadow-md transition-all p-0">
                <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                    {mainImage ? (
                        <img
                            src={mainImage}
                            alt={classified.title}
                            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                    ) : (
                        <div className="flex size-full items-center justify-center">
                            <ImageOff className="size-12 text-muted-foreground" />
                        </div>
                    )}
                    <div className="absolute top-3 left-3">
                        <Badge className="bg-primary text-primary-foreground font-black">{classified.price_display}</Badge>
                    </div>
                    {classified.condition_display && (
                        <div className="absolute top-3 right-3">
                            <Badge variant="secondary" className="text-[10px] uppercase tracking-widest font-black">{classified.condition_display}</Badge>
                        </div>
                    )}
                </div>
                <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                        <Link href={classifiedUrl} className="flex-1">
                            <CardTitle className="line-clamp-2 font-display font-black tracking-tight text-lg transition-colors group-hover:text-primary">{classified.title}</CardTitle>
                        </Link>
                        <ClassifiedSaveButton classifiedId={classified.id} isSaved={classified.is_saved ?? false} savesCount={classified.saves_count ?? 0} />
                    </div>
                </CardHeader>
                <CardContent className="space-y-3 pb-4">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-3">
                            {classified.regions && classified.regions.length > 0 && (
                                <span className="flex items-center gap-1">
                                    <MapPin className="size-3.5 text-primary" />
                                    {classified.regions[0].name}
                                </span>
                            )}
                            <span className="flex items-center gap-1">
                                <Calendar className="size-3.5 text-primary" />
                                {formatDate(classified.created_at)}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t bg-muted/5">
                        {classified.category && (
                            <Badge variant="outline" className="text-xs">
                                <Tag className="mr-1 size-3" />
                                {classified.category.name}
                            </Badge>
                        )}
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Default card
    return (
        <Card className="group overflow-hidden border-none shadow-sm hover:shadow-md transition-all p-0">
            <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                {mainImage ? (
                    <img
                        src={mainImage}
                        alt={classified.title}
                        className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex size-full items-center justify-center">
                        <ImageOff className="size-10 text-muted-foreground" />
                    </div>
                )}
                <div className="absolute top-2 left-2">
                    <Badge className="bg-primary text-primary-foreground font-black text-sm">{classified.price_display}</Badge>
                </div>
                {classified.condition_display && (
                    <div className="absolute top-2 right-2">
                        <Badge variant="secondary" className="text-[10px] uppercase tracking-widest font-black">
                            {classified.condition_display}
                        </Badge>
                    </div>
                )}
            </div>
            <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                    <Link href={classifiedUrl} className="flex-1">
                        <CardTitle className="line-clamp-2 font-display font-black tracking-tight text-base transition-colors group-hover:text-primary">{classified.title}</CardTitle>
                    </Link>
                    <ClassifiedSaveButton classifiedId={classified.id} isSaved={classified.is_saved ?? false} savesCount={classified.saves_count ?? 0} />
                </div>
            </CardHeader>
            <CardContent className="space-y-2 pb-4">
                {classified.price_type !== "fixed" && (
                    <span className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">
                        {classified.price_type}
                    </span>
                )}
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    {classified.regions && classified.regions.length > 0 && (
                        <span className="flex items-center gap-1">
                            <MapPin className="size-3.5 text-primary" />
                            {classified.regions[0]?.name}
                        </span>
                    )}
                    <span className="flex items-center gap-1">
                        <Calendar className="size-3.5 text-primary" />
                        {formatDate(classified.created_at)}
                    </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                    {classified.category && (
                        <Badge variant="outline" className="text-xs">
                            <Tag className="mr-1 size-3" />
                            {classified.category.name}
                        </Badge>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
