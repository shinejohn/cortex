import { Head, Link, router } from "@inertiajs/react";
import { useState } from "react";
import Layout from "@/layouts/layout";

/* ──────────────────────────────────────────────
   Type Definitions
   ────────────────────────────────────────────── */

interface Props {
    business: {
        id: string;
        name: string;
        slug: string;
        city?: string;
        state?: string;
        subscription_tier?: string;
    };
    planTier: string;
    currentServiceAreas: Array<{
        id: string;
        area_type: "city" | "county";
        status: string;
        monthly_price: number;
        billing_cycle: string;
        city?: { id: string; name: string; state: string };
        county?: { id: string; name: string; state: string };
        started_at?: string;
    }>;
    nearbyCities: Array<{
        id: string;
        name: string;
        state: string;
        distance_miles?: number;
    }>;
    availableCounties: Array<{
        id: string;
        name: string;
        state: string;
    }>;
    pricing: {
        monthly: number;
        annual: number;
    };
    monthlyTotal: number;
}

/* ──────────────────────────────────────────────
   Helper Components
   ────────────────────────────────────────────── */

function SectionCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return <div className={`bg-card rounded-lg shadow p-6 ${className}`}>{children}</div>;
}

function TierBadge({ tier }: { tier: string }) {
    const styles: Record<string, string> = {
        free: "bg-gray-100 text-gray-700",
        starter: "bg-blue-100 text-blue-700",
        professional: "bg-purple-100 text-purple-700",
        enterprise: "bg-yellow-100 text-yellow-700",
    };
    const badgeClass = styles[tier.toLowerCase()] || "bg-gray-100 text-gray-700";

    return (
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${badgeClass}`}>
            {tier}
        </span>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        active: "bg-green-100 text-green-700",
        pending: "bg-yellow-100 text-yellow-700",
        cancelled: "bg-red-100 text-red-700",
        expired: "bg-gray-100 text-gray-700",
    };
    const badgeClass = styles[status.toLowerCase()] || "bg-gray-100 text-gray-700";

    return (
        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${badgeClass}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
}

/* ──────────────────────────────────────────────
   Main Page Component
   ────────────────────────────────────────────── */

export default function ServiceAreas({
    business,
    planTier,
    currentServiceAreas,
    nearbyCities,
    availableCounties,
    pricing,
    monthlyTotal,
}: Props) {
    const [selectedCity, setSelectedCity] = useState("");
    const [cityBillingCycle, setCityBillingCycle] = useState<"monthly" | "annual">("monthly");
    const [selectedCounty, setSelectedCounty] = useState("");
    const [countyBillingCycle, setCountyBillingCycle] = useState<"monthly" | "annual">("monthly");
    const [submittingCity, setSubmittingCity] = useState(false);
    const [submittingCounty, setSubmittingCounty] = useState(false);
    const [cancellingId, setCancellingId] = useState<string | null>(null);

    const cityPrice = cityBillingCycle === "annual" ? pricing.annual : pricing.monthly;
    const countyPrice = countyBillingCycle === "annual" ? pricing.annual : pricing.monthly;

    const handleAddCity = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCity) return;

        setSubmittingCity(true);
        router.post(
            `/alphasite/business/${business.slug}/service-areas`,
            {
                area_type: "city",
                area_id: selectedCity,
                billing_cycle: cityBillingCycle,
            },
            {
                onFinish: () => {
                    setSubmittingCity(false);
                    setSelectedCity("");
                },
            }
        );
    };

    const handleAddCounty = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCounty) return;

        setSubmittingCounty(true);
        router.post(
            `/alphasite/business/${business.slug}/service-areas`,
            {
                area_type: "county",
                area_id: selectedCounty,
                billing_cycle: countyBillingCycle,
            },
            {
                onFinish: () => {
                    setSubmittingCounty(false);
                    setSelectedCounty("");
                },
            }
        );
    };

    const handleCancel = (id: string) => {
        if (!confirm("Are you sure you want to cancel this service area?")) return;

        setCancellingId(id);
        router.delete(`/alphasite/business/${business.slug}/service-areas/${id}`, {
            onFinish: () => setCancellingId(null),
        });
    };

    const getAreaName = (area: Props["currentServiceAreas"][0]): string => {
        if (area.area_type === "city" && area.city) {
            return `${area.city.name}, ${area.city.state}`;
        }
        if (area.area_type === "county" && area.county) {
            return `${area.county.name} County, ${area.county.state}`;
        }
        return "Unknown";
    };

    return (
        <Layout>
            <Head>
                <title>Service Areas - {business.name} - AlphaSite</title>
            </Head>

            <div className="min-h-screen bg-muted/50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* ═══════════════════════════════════
                        PAGE HEADER
                        ═══════════════════════════════════ */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-bold text-foreground">Service Areas</h1>
                            <TierBadge tier={planTier} />
                        </div>
                        <p className="text-muted-foreground">
                            Manage service areas for <strong>{business.name}</strong>
                            {business.city && business.state && (
                                <span> in {business.city}, {business.state}</span>
                            )}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* ─── Main Content ─── */}
                        <div className="lg:col-span-2 space-y-8">

                            {/* Current Service Areas Table */}
                            <SectionCard>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-foreground">
                                        Current Service Areas
                                    </h2>
                                    <div className="text-right">
                                        <div className="text-sm text-muted-foreground">Monthly Total</div>
                                        <div className="text-2xl font-bold text-primary">
                                            ${monthlyTotal.toFixed(2)}
                                        </div>
                                    </div>
                                </div>

                                {currentServiceAreas.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b text-left">
                                                    <th className="pb-3 text-sm font-medium text-muted-foreground">
                                                        Area
                                                    </th>
                                                    <th className="pb-3 text-sm font-medium text-muted-foreground">
                                                        Type
                                                    </th>
                                                    <th className="pb-3 text-sm font-medium text-muted-foreground">
                                                        Status
                                                    </th>
                                                    <th className="pb-3 text-sm font-medium text-muted-foreground text-right">
                                                        Monthly Price
                                                    </th>
                                                    <th className="pb-3 text-sm font-medium text-muted-foreground text-right">
                                                        Actions
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                {currentServiceAreas.map((area) => (
                                                    <tr key={area.id} className="hover:bg-muted/30 transition">
                                                        <td className="py-4">
                                                            <div className="font-medium text-foreground">
                                                                {getAreaName(area)}
                                                            </div>
                                                            {area.started_at && (
                                                                <div className="text-xs text-muted-foreground mt-1">
                                                                    Since {new Date(area.started_at).toLocaleDateString()}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="py-4">
                                                            <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground capitalize">
                                                                {area.area_type}
                                                            </span>
                                                        </td>
                                                        <td className="py-4">
                                                            <StatusBadge status={area.status} />
                                                        </td>
                                                        <td className="py-4 text-right font-medium text-foreground">
                                                            ${area.monthly_price.toFixed(2)}
                                                            <div className="text-xs text-muted-foreground">
                                                                {area.billing_cycle}
                                                            </div>
                                                        </td>
                                                        <td className="py-4 text-right">
                                                            {area.status !== "cancelled" && (
                                                                <button
                                                                    onClick={() => handleCancel(area.id)}
                                                                    disabled={cancellingId === area.id}
                                                                    className="text-sm text-red-600 hover:text-red-800 font-medium disabled:opacity-50 transition"
                                                                >
                                                                    {cancellingId === area.id ? "Cancelling..." : "Cancel"}
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <span className="text-4xl mb-4 block">📍</span>
                                        <h3 className="text-lg font-semibold text-foreground mb-2">
                                            No Service Areas Yet
                                        </h3>
                                        <p className="text-muted-foreground">
                                            Add cities or counties to expand your service area reach.
                                        </p>
                                    </div>
                                )}
                            </SectionCard>

                            {/* Add City Form */}
                            <SectionCard>
                                <h2 className="text-xl font-bold text-foreground mb-4">Add City</h2>
                                <p className="text-sm text-muted-foreground mb-6">
                                    Expand your reach by adding nearby cities to your service area.
                                </p>
                                <form onSubmit={handleAddCity} className="space-y-4">
                                    <div>
                                        <label
                                            htmlFor="city_select"
                                            className="block text-sm font-medium text-foreground mb-2"
                                        >
                                            Select City
                                        </label>
                                        <select
                                            id="city_select"
                                            value={selectedCity}
                                            onChange={(e) => setSelectedCity(e.target.value)}
                                            className="w-full border rounded-md px-3 py-2 bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        >
                                            <option value="">Choose a city...</option>
                                            {nearbyCities.map((city) => (
                                                <option key={city.id} value={city.id}>
                                                    {city.name}, {city.state}
                                                    {city.distance_miles != null && ` (${city.distance_miles.toFixed(1)} mi)`}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            Billing Cycle
                                        </label>
                                        <div className="flex gap-4">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="city_billing"
                                                    value="monthly"
                                                    checked={cityBillingCycle === "monthly"}
                                                    onChange={() => setCityBillingCycle("monthly")}
                                                    className="text-primary"
                                                />
                                                <span className="text-sm text-foreground">
                                                    Monthly - ${pricing.monthly.toFixed(2)}/mo
                                                </span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="city_billing"
                                                    value="annual"
                                                    checked={cityBillingCycle === "annual"}
                                                    onChange={() => setCityBillingCycle("annual")}
                                                    className="text-primary"
                                                />
                                                <span className="text-sm text-foreground">
                                                    Annual - ${pricing.annual.toFixed(2)}/mo
                                                    <span className="text-green-600 ml-1 font-medium">
                                                        (Save ${((pricing.monthly - pricing.annual) * 12).toFixed(0)}/yr)
                                                    </span>
                                                </span>
                                            </label>
                                        </div>
                                    </div>

                                    {selectedCity && (
                                        <div className="bg-muted/50 rounded-lg p-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground">Price Preview</span>
                                                <span className="text-lg font-bold text-primary">
                                                    ${cityPrice.toFixed(2)}/mo
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={!selectedCity || submittingCity}
                                        className="w-full bg-primary text-white py-2.5 px-4 rounded-md font-medium hover:bg-primary/90 disabled:opacity-50 transition"
                                    >
                                        {submittingCity ? "Adding City..." : "Add City Service Area"}
                                    </button>
                                </form>
                            </SectionCard>

                            {/* Add County Form */}
                            <SectionCard>
                                <h2 className="text-xl font-bold text-foreground mb-4">Add County</h2>
                                <p className="text-sm text-muted-foreground mb-6">
                                    Cover an entire county to maximize your visibility across multiple cities.
                                </p>
                                <form onSubmit={handleAddCounty} className="space-y-4">
                                    <div>
                                        <label
                                            htmlFor="county_select"
                                            className="block text-sm font-medium text-foreground mb-2"
                                        >
                                            Select County
                                        </label>
                                        <select
                                            id="county_select"
                                            value={selectedCounty}
                                            onChange={(e) => setSelectedCounty(e.target.value)}
                                            className="w-full border rounded-md px-3 py-2 bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        >
                                            <option value="">Choose a county...</option>
                                            {availableCounties.map((county) => (
                                                <option key={county.id} value={county.id}>
                                                    {county.name} County, {county.state}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            Billing Cycle
                                        </label>
                                        <div className="flex gap-4">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="county_billing"
                                                    value="monthly"
                                                    checked={countyBillingCycle === "monthly"}
                                                    onChange={() => setCountyBillingCycle("monthly")}
                                                    className="text-primary"
                                                />
                                                <span className="text-sm text-foreground">
                                                    Monthly - ${pricing.monthly.toFixed(2)}/mo
                                                </span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="county_billing"
                                                    value="annual"
                                                    checked={countyBillingCycle === "annual"}
                                                    onChange={() => setCountyBillingCycle("annual")}
                                                    className="text-primary"
                                                />
                                                <span className="text-sm text-foreground">
                                                    Annual - ${pricing.annual.toFixed(2)}/mo
                                                    <span className="text-green-600 ml-1 font-medium">
                                                        (Save ${((pricing.monthly - pricing.annual) * 12).toFixed(0)}/yr)
                                                    </span>
                                                </span>
                                            </label>
                                        </div>
                                    </div>

                                    {selectedCounty && (
                                        <div className="bg-muted/50 rounded-lg p-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground">Price Preview</span>
                                                <span className="text-lg font-bold text-primary">
                                                    ${countyPrice.toFixed(2)}/mo
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={!selectedCounty || submittingCounty}
                                        className="w-full bg-primary text-white py-2.5 px-4 rounded-md font-medium hover:bg-primary/90 disabled:opacity-50 transition"
                                    >
                                        {submittingCounty ? "Adding County..." : "Add County Service Area"}
                                    </button>
                                </form>
                            </SectionCard>
                        </div>

                        {/* ─── Sidebar ─── */}
                        <div className="lg:col-span-1 space-y-6">

                            {/* Pricing Info */}
                            <SectionCard>
                                <h3 className="text-lg font-semibold mb-4">Pricing</h3>
                                <div className="space-y-4">
                                    <div className="border rounded-lg p-4">
                                        <div className="text-sm font-medium text-muted-foreground mb-1">
                                            Monthly Plan
                                        </div>
                                        <div className="text-2xl font-bold text-foreground">
                                            ${pricing.monthly.toFixed(2)}
                                            <span className="text-sm font-normal text-muted-foreground">/mo</span>
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-1">
                                            Per community, cancel anytime
                                        </div>
                                    </div>
                                    <div className="border-2 border-primary rounded-lg p-4 relative">
                                        <span className="absolute -top-2.5 left-3 bg-primary text-white text-xs px-2 py-0.5 rounded font-medium">
                                            Best Value
                                        </span>
                                        <div className="text-sm font-medium text-muted-foreground mb-1">
                                            Annual Plan
                                        </div>
                                        <div className="text-2xl font-bold text-foreground">
                                            ${pricing.annual.toFixed(2)}
                                            <span className="text-sm font-normal text-muted-foreground">/mo</span>
                                        </div>
                                        <div className="text-xs text-green-600 font-medium mt-1">
                                            Save ${((pricing.monthly - pricing.annual) * 12).toFixed(0)} per year
                                        </div>
                                    </div>
                                </div>
                            </SectionCard>

                            {/* Account Summary */}
                            <SectionCard>
                                <h3 className="text-lg font-semibold mb-4">Account Summary</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Business</span>
                                        <span className="text-sm font-medium text-foreground">{business.name}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Plan</span>
                                        <TierBadge tier={planTier} />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Active Areas</span>
                                        <span className="text-sm font-medium text-foreground">
                                            {currentServiceAreas.filter((a) => a.status === "active").length}
                                        </span>
                                    </div>
                                    <div className="border-t pt-3 flex items-center justify-between">
                                        <span className="text-sm font-medium text-foreground">Monthly Total</span>
                                        <span className="text-lg font-bold text-primary">
                                            ${monthlyTotal.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </SectionCard>

                            {/* Help Section */}
                            <SectionCard>
                                <h3 className="text-lg font-semibold mb-4">Need Help?</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Service areas let your business appear in search results and category pages
                                    for additional communities beyond your home city.
                                </p>
                                <ul className="space-y-2 text-sm text-muted-foreground">
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary flex-shrink-0 mt-0.5">*</span>
                                        Add cities to target specific communities
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary flex-shrink-0 mt-0.5">*</span>
                                        Add counties to cover all cities within a county
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary flex-shrink-0 mt-0.5">*</span>
                                        Annual billing saves you money over monthly
                                    </li>
                                </ul>
                            </SectionCard>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
