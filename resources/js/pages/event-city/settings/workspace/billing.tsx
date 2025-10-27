import { Head } from "@inertiajs/react";
import axios from "axios";
import { CheckCircle2, CreditCard, ExternalLink, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import HeadingSmall from "@/components/heading-small";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AppLayout from "@/layouts/app-layout";
import WorkspaceSettingsLayout from "@/layouts/settings/workspace-layout";
import { type BreadcrumbItem } from "@/types";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: "Workspace settings",
        href: "/settings/workspace",
    },
    {
        title: "Billing & Payouts",
        href: "/settings/workspace/billing",
    },
];

interface Workspace {
    id: string;
    name: string;
    stripe_connect_id: string | null;
    stripe_charges_enabled: boolean;
    stripe_payouts_enabled: boolean;
    stripe_admin_approved: boolean;
    can_accept_payments: boolean;
}

interface Props {
    workspace: Workspace;
    canManage: boolean;
}

export default function WorkspaceBilling({ workspace, canManage }: Props) {
    const [isConnecting, setIsConnecting] = useState(false);

    const handleConnectStripe = async () => {
        setIsConnecting(true);
        try {
            const { data } = await axios.post(route("settings.workspace.billing.connect-stripe"));

            // Open Stripe Connect in a new tab
            window.open(data.url, "_blank");
            toast.success("Opening Stripe Connect in a new tab. Complete the setup there and return here.");
        } catch (error) {
            console.error("Failed to connect Stripe:", error);
            if (axios.isAxiosError(error) && error.response?.data?.error) {
                toast.error(error.response.data.error);
            } else {
                toast.error("Failed to start Stripe Connect onboarding");
            }
        } finally {
            setIsConnecting(false);
        }
    };

    const handleOpenStripeDashboard = async () => {
        try {
            const { data } = await axios.get(route("settings.workspace.billing.stripe-dashboard"));

            if (data.url) {
                window.open(data.url, "_blank");
            }
        } catch (error) {
            console.error("Failed to open Stripe dashboard:", error);
            if (axios.isAxiosError(error) && error.response?.data?.error) {
                toast.error(error.response.data.error);
            } else {
                toast.error("Failed to open Stripe dashboard");
            }
        }
    };

    const isStripeConnected = !!workspace.stripe_connect_id;
    const isFullySetup = workspace.can_accept_payments;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Billing & Payouts" />

            <WorkspaceSettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Billing & Payouts" description="Manage payment settings for your workspace" />

                    {/* Status Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5" />
                                Payment Status
                            </CardTitle>
                            <CardDescription>Current status of your payment processing capabilities</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {!isStripeConnected && (
                                <Alert>
                                    <XCircle className="h-4 w-4" />
                                    <AlertTitle>Payments Not Configured</AlertTitle>
                                    <AlertDescription>
                                        Connect your Stripe account to start accepting payments for your stores, events, and other features.
                                    </AlertDescription>
                                </Alert>
                            )}

                            {isStripeConnected &&
                                !isFullySetup &&
                                workspace.stripe_charges_enabled &&
                                workspace.stripe_payouts_enabled &&
                                !workspace.stripe_admin_approved && (
                                    <Alert className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950">
                                        <AlertTitle className="text-amber-800 dark:text-amber-200">Pending Admin Approval</AlertTitle>
                                        <AlertDescription className="text-amber-700 dark:text-amber-300">
                                            Your Stripe onboarding is complete. Waiting for admin approval to enable payment processing.
                                        </AlertDescription>
                                    </Alert>
                                )}

                            {isStripeConnected && !isFullySetup && (!workspace.stripe_charges_enabled || !workspace.stripe_payouts_enabled) && (
                                <Alert>
                                    <AlertTitle>Setup Incomplete</AlertTitle>
                                    <AlertDescription>
                                        Your Stripe account is connected but you need to complete the onboarding process to start accepting payments.
                                    </AlertDescription>
                                </Alert>
                            )}

                            {isFullySetup && (
                                <Alert className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
                                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                                    <AlertTitle className="text-green-800 dark:text-green-200">Payments Active</AlertTitle>
                                    <AlertDescription className="text-green-700 dark:text-green-300">
                                        Your workspace is fully set up to accept payments. You can now monetize your stores, events, and more.
                                    </AlertDescription>
                                </Alert>
                            )}

                            <div className="grid gap-3 pt-2">
                                <div className="flex items-center justify-between rounded-lg border p-3">
                                    <div className="space-y-0.5">
                                        <div className="text-sm font-medium">Stripe Account</div>
                                        <div className="text-xs text-muted-foreground">{isStripeConnected ? "Connected" : "Not connected"}</div>
                                    </div>
                                    <div>
                                        {isStripeConnected ? (
                                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                                        ) : (
                                            <XCircle className="h-5 w-5 text-neutral-400" />
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between rounded-lg border p-3">
                                    <div className="space-y-0.5">
                                        <div className="text-sm font-medium">Charge Payments</div>
                                        <div className="text-xs text-muted-foreground">
                                            {workspace.stripe_charges_enabled ? "Enabled" : "Not enabled"}
                                        </div>
                                    </div>
                                    <div>
                                        {workspace.stripe_charges_enabled ? (
                                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                                        ) : (
                                            <XCircle className="h-5 w-5 text-neutral-400" />
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between rounded-lg border p-3">
                                    <div className="space-y-0.5">
                                        <div className="text-sm font-medium">Receive Payouts</div>
                                        <div className="text-xs text-muted-foreground">
                                            {workspace.stripe_payouts_enabled ? "Enabled" : "Not enabled"}
                                        </div>
                                    </div>
                                    <div>
                                        {workspace.stripe_payouts_enabled ? (
                                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                                        ) : (
                                            <XCircle className="h-5 w-5 text-neutral-400" />
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between rounded-lg border p-3">
                                    <div className="space-y-0.5">
                                        <div className="text-sm font-medium">Admin Approval</div>
                                        <div className="text-xs text-muted-foreground">
                                            {workspace.stripe_admin_approved ? "Approved" : "Pending"}
                                        </div>
                                    </div>
                                    <div>
                                        {workspace.stripe_admin_approved ? (
                                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                                        ) : (
                                            <XCircle className="h-5 w-5 text-amber-500" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    {canManage && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Actions</CardTitle>
                                <CardDescription>Manage your Stripe Connect integration</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {!isFullySetup && (
                                    <Button onClick={handleConnectStripe} className="w-full sm:w-auto" disabled={isConnecting}>
                                        {isConnecting ? "Connecting..." : isStripeConnected ? "Complete Stripe Setup" : "Connect Stripe Account"}
                                    </Button>
                                )}

                                {isStripeConnected && isFullySetup && (
                                    <Button onClick={handleOpenStripeDashboard} variant="outline" className="w-full sm:w-auto">
                                        <ExternalLink className="mr-2 h-4 w-4" />
                                        Open Stripe Dashboard
                                    </Button>
                                )}

                                <div className="pt-2">
                                    <p className="text-sm text-muted-foreground">
                                        {!isStripeConnected &&
                                            "Connect your Stripe account to enable payment processing across all workspace features."}
                                        {isStripeConnected && !isFullySetup && "Complete your Stripe onboarding to activate payment processing."}
                                        {isFullySetup &&
                                            "You can view transactions, manage payouts, and update your account details in the Stripe Dashboard."}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {!canManage && (
                        <Alert>
                            <AlertDescription>
                                You don't have permission to manage billing settings. Please contact a workspace admin.
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Info Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>About Stripe Connect</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm text-muted-foreground">
                            <p>
                                Stripe Connect allows your workspace to accept payments across multiple features including stores, events, venues, and
                                calendars.
                            </p>
                            <p>Benefits include:</p>
                            <ul className="list-inside list-disc space-y-1 pl-2">
                                <li>Unified payment processing for all workspace monetization features</li>
                                <li>Secure payment handling with PCI compliance</li>
                                <li>Automatic payouts to your bank account</li>
                                <li>Detailed reporting and analytics</li>
                                <li>Support for multiple currencies</li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </WorkspaceSettingsLayout>
        </AppLayout>
    );
}
