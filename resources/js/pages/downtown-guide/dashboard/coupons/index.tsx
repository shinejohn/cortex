import DowntownGuideLayout from "@/layouts/downtown-guide-layout";
import { Head, Link } from "@inertiajs/react";
import { Auth } from "@/types";
import { Button } from "@/components/ui/button";
import { route } from "ziggy-js";

interface Coupon {
    id: string;
    title: string;
    code: string;
    discount_type: string;
    discount_value: number;
    usage_count: number;
    status: string;
}

interface CouponsIndexProps {
    auth: Auth;
    coupons: {
        data: Coupon[];
    };
    business: any;
}

export default function CouponsIndex({ auth, coupons, business }: CouponsIndexProps) {
    return (
        <DowntownGuideLayout
            auth={auth}
            seo={{
                title: "Manage Coupons",
                description: "Manage your business coupons and deals",
            }}
        >
            <Head title="Manage Coupons" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold">Coupons & Deals</h2>
                                <Link href={route('downtown-guide.dashboard.coupons.create')}>
                                    <Button>Create New Coupon</Button>
                                </Link>
                            </div>

                            {coupons.data.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usage</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {coupons.data.map((coupon) => (
                                                <tr key={coupon.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">{coupon.title}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                                            {coupon.code}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` :
                                                            coupon.discount_type === 'fixed' ? `$${coupon.discount_value}` : 'Special Offer'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {coupon.usage_count}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${coupon.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                            }`}>
                                                            {coupon.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <Link href={route('downtown-guide.dashboard.coupons.edit', coupon.id)} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</Link>
                                                        {/* Delete button could go here */}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-gray-50 rounded-lg">
                                    <p className="text-gray-500 mb-4">You haven't created any coupons yet.</p>
                                    <Link href={route('downtown-guide.dashboard.coupons.create')}>
                                        <Button variant="outline">Get Started</Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DowntownGuideLayout>
    );
}
