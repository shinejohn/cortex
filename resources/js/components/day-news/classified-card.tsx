import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Classified } from "@/types/classified";
import { Link } from "@inertiajs/react";
import { Clock, MapPin, Tag } from "lucide-react";
import { route } from "ziggy-js";

interface Props {
    classified: Classified;
    variant?: "default" | "featured";
}

export function ClassifiedCard({ classified, variant = "default" }: Props) {
    // Get the first image or use a placeholder
    const mainImage = classified.images && classified.images.length > 0 ? classified.images[0].url : null;
    const isFeatured = variant === "featured";

    return (
        <Card className={`flex flex-col h-full overflow-hidden transition-all hover:shadow-md ${isFeatured ? 'border-primary shadow-lg ring-1 ring-primary/20' : ''}`}>
            {/* Image Placeholder or Actual Image */}
            <div className="relative h-48 w-full bg-muted">
                {mainImage ? (
                    <img
                        src={mainImage}
                        alt={classified.title}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center bg-secondary text-secondary-foreground">
                        <Tag className="h-12 w-12 opacity-20" />
                    </div>
                )}
                {classified.category && (
                    <Badge variant="secondary" className="absolute left-2 top-2">
                        {classified.category.name}
                    </Badge>
                )}
                {classified.condition_display && (
                    <Badge className="absolute right-2 top-2 bg-black/50 hover:bg-black/70 backdrop-blur-sm">
                        {classified.condition_display}
                    </Badge>
                )}
            </div>

            <CardHeader className="pb-2">
                <div className="flex justify-between items-start gap-2">
                    <CardTitle className={`line-clamp-1 ${isFeatured ? 'text-lg font-bold' : 'text-base'}`}>
                        {classified.title}
                    </CardTitle>
                </div>
            </CardHeader>

            <CardContent className="flex-1 pb-2">
                <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-xl font-bold text-primary">
                        {classified.price_display}
                    </span>
                    {classified.price_type !== 'fixed' && (
                        <span className="text-xs text-muted-foreground capitalize">
                            {classified.price_type}
                        </span>
                    )}
                </div>

                <p className="line-clamp-2 text-sm text-muted-foreground mb-4">
                    {classified.description}
                </p>

                <div className="grid gap-1 text-xs text-muted-foreground">
                    {classified.regions && classified.regions.length > 0 && (
                        <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span className="line-clamp-1">
                                {classified.regions.map(r => r.name).join(', ')}
                            </span>
                        </div>
                    )}
                    <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>Posted {new Date(classified.created_at).toLocaleDateString()}</span>
                    </div>
                </div>
            </CardContent>

            <Separator className="my-2" />

            <CardFooter className="pt-2">
                <Button className="w-full" asChild variant={isFeatured ? "default" : "outline"}>
                    <Link href={route('daynews.classifieds.show', { slug: classified.slug })}>
                        View Details
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
