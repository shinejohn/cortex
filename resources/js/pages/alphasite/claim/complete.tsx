import { Head, useForm } from "@inertiajs/react";
import Layout from "@/layouts/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { route } from "ziggy-js";

interface Props {
    business: {
        id: string;
        name: string;
        slug: string;
    };
    subscriptionTiers: Record<
        string,
        { name: string; price: number }
    >;
}

export default function ClaimComplete({
    business,
    subscriptionTiers,
}: Props) {
    const { data, setData, post, processing, errors } = useForm({
        tier: "standard",
        billing_cycle: "monthly",
    });

    const handleCheckout = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("alphasite.claim.checkout", business.slug), {
            preserveScroll: true,
        });
    };

    const tiers = Object.entries(subscriptionTiers).filter(
        ([k]) => k !== "basic"
    );

    return (
        <Layout>
            <Head>
                <title>Choose Plan - Claim {business.name} | AlphaSite</title>
            </Head>

            <div className="min-h-screen bg-muted/50 py-12">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Card>
                        <CardContent className="p-8">
                            <h1 className="text-3xl font-bold mb-2">
                                Choose Your Plan
                            </h1>
                            <p className="text-muted-foreground mb-6">
                                Select a subscription to unlock AI-powered
                                features for <strong>{business.name}</strong>.
                            </p>

                            <form onSubmit={handleCheckout} className="space-y-6">
                                <div className="space-y-4">
                                    <Label>Billing</Label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="billing_cycle"
                                                value="monthly"
                                                checked={
                                                    data.billing_cycle ===
                                                    "monthly"
                                                }
                                                onChange={() =>
                                                    setData(
                                                        "billing_cycle",
                                                        "monthly"
                                                    )
                                                }
                                                className="sr-only"
                                            />
                                            <span className="px-4 py-2 rounded-lg border hover:bg-muted/50">
                                                Monthly
                                            </span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="billing_cycle"
                                                value="annual"
                                                checked={
                                                    data.billing_cycle ===
                                                    "annual"
                                                }
                                                onChange={() =>
                                                    setData(
                                                        "billing_cycle",
                                                        "annual"
                                                    )
                                                }
                                                className="sr-only"
                                            />
                                            <span className="px-4 py-2 rounded-lg border hover:bg-muted/50">
                                                Annual (2 months free)
                                            </span>
                                        </label>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <Label>Plan</Label>
                                    <div className="grid gap-3">
                                        {tiers.map(([key, tier]) => (
                                            <label
                                                key={key}
                                                className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors ${
                                                    data.tier === key
                                                        ? "border-primary bg-primary/5"
                                                        : "hover:bg-muted/50"
                                                }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="tier"
                                                    value={key}
                                                    checked={data.tier === key}
                                                    onChange={() =>
                                                        setData("tier", key)
                                                    }
                                                    className="sr-only"
                                                />
                                                <div>
                                                    <p className="font-medium">
                                                        {tier.name}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        ${tier.price}/mo
                                                    </p>
                                                </div>
                                                <span className="text-lg font-semibold">
                                                    ${tier.price}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full"
                                >
                                    {processing
                                        ? "Redirecting to checkout..."
                                        : "Continue to checkout"}
                                </Button>
                            </form>

                            <p className="mt-6 text-sm text-muted-foreground text-center">
                                You'll be redirected to Stripe to complete
                                payment. Your 90-day trial includes basic AI
                                features.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Layout>
    );
}
