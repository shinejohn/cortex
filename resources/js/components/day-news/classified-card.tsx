import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Link } from "@inertiajs/react";
import { Clock, MapPin, Tag } from "lucide-react";
import { route } from "ziggy-js";

interface Classified {
    id: number;
    title: string;
    description: string;
    price: string;
    price_type: string;
    condition: string;
    location: string;
    category?: {
        name: string;
    };
    created_at: string;
    images?: { url: string }[];
}

interface Props {
    classified: Classified;
}

export function ClassifiedCard({ classified }: Props) {
    // Get the first image or use a placeholder
    const mainImage = classified.images && classified.images.length > 0 ? classified.images[0].url : null;

    return (
        <Card className="flex flex-col h-full overflow-hidden transition-all hover:shadow-md">
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
                <Badge className="absolute right-2 top-2 bg-black/50 hover:bg-black/70 backdrop-blur-sm">
                    {classified.condition}
                </Badge>
            </div>

            <CardHeader className="pb-2">
                <div className="flex justify-between items-start gap-2">
                    <CardTitle className="line-clamp-1 text-lg">
                        {classified.title}
                    </CardTitle>
                </div>
            </CardHeader>

            <CardContent className="flex-1 pb-2">
                <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-xl font-bold text-primary">
                        ${classified.price}
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
                    <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span className="line-clamp-1">{classified.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>Posted {new Date(classified.created_at).toLocaleDateString()}</span>
                    </div>
                </div>
            </CardContent>

            <Separator className="my-2" />

            <CardFooter className="pt-2">
                <Button className="w-full" asChild variant="outline">
                    <Link href={route('daynews.classifieds.show', classified.id)}>
                        View Details
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
