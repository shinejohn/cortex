// Components
import { Head, useForm } from "@inertiajs/react";
import { LoaderCircle } from "lucide-react";
import { FormEventHandler } from "react";

import InputError from "@/components/input-error";
import TextLink from "@/components/text-link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthLayout from "@/layouts/auth-layout";
import { Auth } from "@/types";

export default function MagicLink({
    status,
    error,
    auth,
    invitation,
}: {
    status?: string;
    error?: string;
    auth: Auth;
    invitation?: string;
}) {
    const { data, setData, post, processing, errors, reset } = useForm<Required<{ email: string }>>({
        email: "",
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route("magiclink.generate", invitation ? { invitation } : {}), {
            onFinish: () => reset("email"),
        });
    };

    return (
        <AuthLayout title="Magic Link" description="Enter your email to receive a magic link to login">
            <Head title="Magic Link" />

            {status && <div className="mb-4 text-center text-sm font-medium text-green-600">{status}</div>}
            {error && <div className="mb-4 text-center text-sm font-medium text-red-600">{error}</div>}

            <div className="space-y-6">
                <form onSubmit={submit}>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            autoComplete="email"
                            value={data.email}
                            autoFocus
                            onChange={(e) => setData("email", e.target.value)}
                            placeholder="email@example.com"
                        />

                        <InputError message={errors.email} />
                    </div>

                    <div className="my-6 flex items-center justify-start">
                        <Button className="w-full" disabled={processing}>
                            {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                            Send Magic Link
                        </Button>
                    </div>
                </form>

                {auth.passwordEnabled && (
                    <div className="text-muted-foreground space-x-1 text-center text-sm">
                        <span>Or, return to</span>
                        <TextLink href={route("login", invitation ? { invitation } : {})}>log in</TextLink>
                        or <TextLink href={route("register")}>sign up</TextLink>
                        <br />
                    </div>
                )}
            </div>
        </AuthLayout>
    );
}
