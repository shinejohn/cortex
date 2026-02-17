import DowntownGuideLayout from "@/layouts/downtown-guide-layout";
import { Head, Link } from "@inertiajs/react";
import { Auth } from "@/types";
import { route } from "ziggy-js";
import { Store, Ticket, Award, Trophy, MapPin, Users } from "lucide-react";

interface DashboardProps {
    auth: Auth;
    user: any;
}

export default function Dashboard({ auth, user }: DashboardProps) {
    const tools = [
        {
            title: "Business Profile",
            description: "Manage your business information, hours, and contact details.",
            icon: Store,
            href: route('downtown-guide.dashboard.business.edit'),
            color: "text-blue-600",
            bgColor: "bg-blue-100",
        },
        {
            title: "Coupons & Deals",
            description: "Create and manage special offers to attract customers.",
            icon: Ticket,
            href: route('downtown-guide.dashboard.coupons.index'),
            color: "text-green-600",
            bgColor: "bg-green-100",
        },
        {
            title: "Loyalty Program",
            description: "Setup and manage your customer loyalty rewards.",
            icon: Award,
            href: route('downtown-guide.dashboard.loyalty.index'),
            color: "text-purple-600",
            bgColor: "bg-purple-100",
        },
        {
            title: "Awards & Accolades",
            description: "Showcase any awards your business has received.",
            icon: Trophy,
            href: route('downtown-guide.dashboard.achievements.index'),
            color: "text-yellow-600",
            bgColor: "bg-yellow-100",
        },
        // Future placeholders
        {
            title: "Location Features",
            description: "Manage map placement (Coming Soon).",
            icon: MapPin,
            href: "#",
            color: "text-gray-400",
            bgColor: "bg-gray-100",
        },
        {
            title: "Community",
            description: "Engage with local events (Coming Soon).",
            icon: Users,
            href: "#",
            color: "text-gray-400",
            bgColor: "bg-gray-100",
        },
    ];

    return (
        <DowntownGuideLayout
            auth={auth}
            seo={{
                title: "Dashboard",
                description: "Your Downtown Guide Dashboard",
            }}
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-8">
                        <div className="p-6 text-gray-900">
                            <h1 className="text-2xl font-bold mb-2">Welcome back, {user.name}!</h1>
                            <p className="text-gray-600">Manage your downtown business presence from here.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tools.map((tool, index) => (
                            <Link
                                key={index}
                                href={tool.href}
                                className="block group"
                            >
                                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 h-full border border-transparent hover:border-gray-200 transition-all hover:shadow-md">
                                    <div className="flex items-start space-x-4">
                                        <div className={`p-3 rounded-lg ${tool.bgColor} ${tool.color}`}>
                                            <tool.icon className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                                {tool.title}
                                            </h3>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {tool.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </DowntownGuideLayout>
    );
}
