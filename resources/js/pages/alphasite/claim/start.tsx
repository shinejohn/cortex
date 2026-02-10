import { Head, useForm } from "@inertiajs/react";
import { ShieldCheck, Phone, Mail, KeyRound } from "lucide-react";
import Layout from "@/layouts/layout";

interface Props {
    business: {
        id: string;
        name: string;
        slug: string;
        address?: string;
        city?: string;
        state?: string;
        phone?: string;
        email?: string;
    };
}

export default function ClaimStart({ business }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        verification_method: "phone", // or "email"
        verification_code: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/claim/${business.slug}/verify`);
    };

    return (
        <Layout>
            <Head>
                <title>Claim {business.name} - AlphaSite</title>
            </Head>

            <div className="min-h-screen bg-muted/30 py-12 lg:py-16">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/10 mb-4">
                            <ShieldCheck className="h-8 w-8 text-primary" />
                        </div>
                        <h1 className="font-display text-3xl font-black tracking-tight text-foreground">Claim Your Business</h1>
                        <p className="text-muted-foreground mt-2">
                            Verify ownership of <strong className="text-foreground">{business.name}</strong> to claim and manage your business page.
                        </p>
                    </div>

                    <div className="bg-card rounded-2xl border-none shadow-sm p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-3">Verification Method</label>
                                <div className="space-y-3">
                                    <label
                                        className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                            data.verification_method === "phone"
                                                ? "border-primary bg-primary/5"
                                                : "border-muted hover:border-primary/30"
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="verification_method"
                                            value="phone"
                                            checked={data.verification_method === "phone"}
                                            onChange={(e) => setData("verification_method", e.target.value)}
                                            className="sr-only"
                                        />
                                        <div className={`flex items-center justify-center h-10 w-10 rounded-lg ${
                                            data.verification_method === "phone" ? "bg-primary/10" : "bg-muted"
                                        }`}>
                                            <Phone className={`h-5 w-5 ${data.verification_method === "phone" ? "text-primary" : "text-muted-foreground"}`} />
                                        </div>
                                        <div>
                                            <span className="font-medium text-foreground">Phone Verification</span>
                                            <p className="text-sm text-muted-foreground">{business.phone || "Not available"}</p>
                                        </div>
                                    </label>
                                    <label
                                        className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                            data.verification_method === "email"
                                                ? "border-primary bg-primary/5"
                                                : "border-muted hover:border-primary/30"
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="verification_method"
                                            value="email"
                                            checked={data.verification_method === "email"}
                                            onChange={(e) => setData("verification_method", e.target.value)}
                                            className="sr-only"
                                        />
                                        <div className={`flex items-center justify-center h-10 w-10 rounded-lg ${
                                            data.verification_method === "email" ? "bg-primary/10" : "bg-muted"
                                        }`}>
                                            <Mail className={`h-5 w-5 ${data.verification_method === "email" ? "text-primary" : "text-muted-foreground"}`} />
                                        </div>
                                        <div>
                                            <span className="font-medium text-foreground">Email Verification</span>
                                            <p className="text-sm text-muted-foreground">{business.email || "Not available"}</p>
                                        </div>
                                    </label>
                                </div>
                                {errors.verification_method && <p className="mt-2 text-sm text-destructive">{errors.verification_method}</p>}
                            </div>

                            <div>
                                <label htmlFor="verification_code" className="block text-sm font-medium text-foreground mb-2">
                                    <span className="flex items-center gap-1.5">
                                        <KeyRound className="h-4 w-4 text-muted-foreground" />
                                        Verification Code
                                    </span>
                                </label>
                                <input
                                    type="text"
                                    id="verification_code"
                                    value={data.verification_code}
                                    onChange={(e) => setData("verification_code", e.target.value)}
                                    className="w-full border rounded-xl px-4 py-3 text-center text-lg tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                                    placeholder="Enter verification code"
                                />
                                {errors.verification_code && <p className="mt-2 text-sm text-destructive">{errors.verification_code}</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full bg-primary text-primary-foreground py-3 px-4 rounded-xl font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                            >
                                <ShieldCheck className="h-5 w-5" />
                                {processing ? "Verifying..." : "Verify & Claim"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
