import { Link } from "@inertiajs/react";
import { Copy, MapPin, Calendar, ExternalLink, Scissors } from "lucide-react";
import React from "react";

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
                    className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow group"
                >
                    {/* Header with logo and discount */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
                        <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full overflow-hidden mr-3 bg-white border border-gray-200">
                                {coupon.image ? (
                                    <img
                                        src={coupon.image}
                                        alt={coupon.business_name}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <Scissors className="h-5 w-5 m-auto text-gray-400" />
                                )}
                            </div>
                            <div className="overflow-hidden">
                                <h3 className="font-bold text-gray-800 text-sm truncate">
                                    {coupon.business_name}
                                </h3>
                                <div className="flex items-center text-[10px] text-gray-500 truncate">
                                    <MapPin className="h-2.5 w-2.5 mr-1" />
                                    {coupon.business_location}
                                </div>
                            </div>
                        </div>
                        <div className="bg-yellow-100 text-yellow-800 font-bold text-xs px-2 py-1 rounded-md whitespace-nowrap">
                            {coupon.discount_type === 'percentage' ? `${parseFloat(coupon.discount_value)}% OFF` : `$${parseFloat(coupon.discount_value)} OFF`}
                        </div>
                    </div>

                    <div className="p-4 flex flex-col flex-1">
                        <p className="text-xs text-gray-600 mb-4 line-clamp-3">
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
                                        className="w-full border border-gray-300 rounded-l-md py-1.5 px-3 text-[10px] bg-gray-50 font-mono"
                                    />
                                </div>
                                <button
                                    className="bg-news-primary text-white py-1.5 px-3 rounded-r-md flex items-center hover:bg-news-primary-dark transition-colors"
                                    onClick={(e) => handleCopyCode(coupon.code, e)}
                                    title="Copy Code"
                                >
                                    <Copy className="h-3.5 w-3.5" />
                                </button>
                            </div>

                            {/* Expiry and actions */}
                            <div className="flex items-center justify-between text-[10px]">
                                <div className="flex items-center text-gray-500">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    {coupon.end_date}
                                </div>
                                <Link
                                    href={`/coupons/${coupon.id}`}
                                    className="text-news-primary flex items-center font-bold uppercase tracking-tight hover:underline"
                                >
                                    Details
                                    <ExternalLink className="h-2.5 w-2.5 ml-1" />
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
