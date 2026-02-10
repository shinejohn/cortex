import { Link } from "@inertiajs/react";
import { Calendar, Copy, ExternalLink, MapPin, Scissors, Tag } from "lucide-react";
import React from "react";
import { route } from "ziggy-js";

interface CouponItem {
    id: string;
    business_name: string;
    image: string | null;
    discount_value: string;
    discount_type: string;
    code: string;
    description: string;
    end_date: string;
    business_location: string;
}

interface CouponsPreviewProps {
    coupons: CouponItem[];
}

export const CouponsPreview = ({ coupons }: CouponsPreviewProps) => {
    if (!coupons || coupons.length === 0) {
        return null;
    }

    const handleCopyCode = (code: string, e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(code).then(() => {
            alert(`Coupon code ${code} copied to clipboard!`);
        });
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {coupons.map((coupon) => (
                <div
                    key={coupon.id}
                    className="group overflow-hidden rounded-lg border-none shadow-sm hover:shadow-md transition-all flex flex-col bg-card"
                >
                    {/* Header with logo and discount */}
                    <div className="flex items-center justify-between p-4 border-b border-muted bg-muted/30">
                        <div className="flex items-center">
                            <div className="size-10 rounded-full overflow-hidden mr-3 bg-background border border-border">
                                {coupon.image ? (
                                    <img
                                        src={coupon.image}
                                        alt={coupon.business_name}
                                        className="size-full object-cover"
                                    />
                                ) : (
                                    <div className="flex size-full items-center justify-center">
                                        <Scissors className="size-5 text-muted-foreground" />
                                    </div>
                                )}
                            </div>
                            <div className="overflow-hidden">
                                <h3 className="font-display font-black tracking-tight text-sm truncate">
                                    {coupon.business_name}
                                </h3>
                                <div className="flex items-center gap-1 text-[10px] text-muted-foreground truncate">
                                    <MapPin className="size-2.5" />
                                    {coupon.business_location}
                                </div>
                            </div>
                        </div>
                        <div className="bg-yellow-100 text-yellow-800 font-black text-[10px] uppercase tracking-widest px-2 py-1 rounded-md whitespace-nowrap">
                            {coupon.discount_type === "percentage"
                                ? `${parseFloat(coupon.discount_value)}% OFF`
                                : `$${parseFloat(coupon.discount_value)} OFF`}
                        </div>
                    </div>

                    <div className="p-4 flex flex-col flex-1">
                        <p className="text-xs text-muted-foreground mb-4 line-clamp-3">
                            {coupon.description}
                        </p>

                        <div className="mt-auto space-y-4">
                            {/* Coupon code */}
                            <div className="flex">
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        value={coupon.code}
                                        readOnly
                                        className="w-full border border-dashed border-primary/50 rounded-l-md py-1.5 px-3 text-[10px] bg-muted font-mono uppercase tracking-wider"
                                    />
                                </div>
                                <button
                                    className="bg-primary text-primary-foreground py-1.5 px-3 rounded-r-md flex items-center hover:bg-primary/90 transition-colors"
                                    onClick={(e) => handleCopyCode(coupon.code, e)}
                                    title="Copy Code"
                                >
                                    <Copy className="size-3.5" />
                                </button>
                            </div>

                            {/* Expiry and actions */}
                            <div className="flex items-center justify-between text-[10px] bg-muted/5 pt-2 border-t">
                                <div className="flex items-center gap-1 text-muted-foreground">
                                    <Calendar className="size-3 text-primary" />
                                    {coupon.end_date}
                                </div>
                                <Link
                                    href={route("daynews.coupons.show", { slug: coupon.id })}
                                    className="text-primary flex items-center font-black text-[10px] uppercase tracking-widest hover:underline"
                                >
                                    Details
                                    <ExternalLink className="size-2.5 ml-1" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default CouponsPreview;
