import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Link } from "@inertiajs/react";
import { Clock, MapPin, Tag } from "lucide-react";
import { route } from "ziggy-js";

interface Coupon {
    id: number;
    title: string;
    description: string;
    code: string;
    discount_value: string;
    discount_type: "percentage" | "fixed_amount";
    expires_at: string;
    category?: {
        name: string;
    };
    image?: string;
    business_name?: string;
    location?: string;
}

interface Props {
    coupon: Coupon;
    featured?: boolean;
}

export function CouponCard({ coupon, featured = false }: Props) {
    const isExpired = new Date(coupon.expires_at) < new Date();

    return (
        <Card className={`flex flex-col h-full overflow-hidden transition-all hover:shadow-md ${featured ? 'border-primary/50 shadow-sm' : ''}`}>
            {/* Image Placeholder or Actual Image */}
            <div className="relative h-48 w-full bg-muted">
                {coupon.image ? (
                    <img
                        src={coupon.image}
                        alt={coupon.title}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center bg-secondary text-secondary-foreground">
                        <Tag className="h-12 w-12 opacity-20" />
                    </div>
                )}
                {featured && (
                    <Badge className="absolute right-2 top-2 bg-primary text-primary-foreground">
                        Featured
                    </Badge>
                )}
                {coupon.category && (
                    <Badge variant="secondary" className="absolute left-2 top-2">
                        {coupon.category.name}
                    </Badge>
                )}
            </div>

            <CardHeader className="pb-2">
                <div className="flex justify-between items-start gap-2">
                    <CardTitle className={`line-clamp-1 ${featured ? 'text-xl' : 'text-lg'}`}>
                        {coupon.title}
                    </CardTitle>
                </div>
                {coupon.business_name && (
                    <CardDescription className="font-medium text-foreground/80">
                        {coupon.business_name}
                    </CardDescription>
                )}
            </CardHeader>

            <CardContent className="flex-1 pb-2">
                <div className="flex items-center gap-2 mb-2 text-2xl font-bold text-primary">
                    {coupon.discount_type === 'percentage'
                        ? `${coupon.discount_value}% OFF`
                        : `$${coupon.discount_value} OFF`
                    }
                </div>

                <p className="line-clamp-2 text-sm text-muted-foreground mb-4">
                    {coupon.description}
                </p>

                <div className="grid gap-1 text-xs text-muted-foreground">
                    {coupon.location && (
                        <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span className="line-clamp-1">{coupon.location}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>Expires {new Date(coupon.expires_at).toLocaleDateString()}</span>
                    </div>
                </div>
            </CardContent>

            <Separator className="my-2" />

            <CardFooter className="pt-2">
                <Button
                    className="w-full"
                    variant={isExpired ? "outline" : "default"}
                    disabled={isExpired}
                    asChild={!isExpired}
                >
                    {isExpired ? (
                        "Expired"
                    ) : (
                        <Link href={route('daynews.coupons.show', coupon.id)}>
                            View Deal
                        </Link>
                    )}
                </Button>
            </CardFooter>
        </Card>
    );
}
