import { Head, Link, useForm } from "@inertiajs/react";
import { LoaderCircle } from "lucide-react";
import { FormEventHandler } from "react";

import InputError from "@/components/input-error";
import SocialButton from "@/components/socialite/social-button";
import TextLink from "@/components/text-link";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import DowntownGuideAuthLayout from "@/layouts/downtown-guide-auth-layout";
import { SharedData } from "@/types";
import { route } from "ziggy-js";

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
    invitation?: string;
};

interface LoginProps extends SharedData {
    status?: string;
    canResetPassword: boolean;
    providers: string[];
    invitation?: string;
}

export default function Login({ status, canResetPassword, providers, invitation, auth }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<Required<LoginForm>>({
        email: "",
        password: "",
        remember: false,
        invitation: invitation || "",
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route("login"), {
            onFinish: () => reset("password"),
        });
    };

    return (
        <DowntownGuideAuthLayout
            auth={auth}
            title="Log in to your account"
            description="Enter your email and password below to log in"
        >
            <Head title="Log in" />

            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData("email", e.target.value)}
                            placeholder="email@example.com"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <div className="flex items-center">
                            <Label htmlFor="password">Password</Label>
                            {canResetPassword && (
                                <TextLink href={route("password.request")} className="ml-auto text-sm" tabIndex={5}>
                                    Forgot password?
                                </TextLink>
                            )}
                        </div>
                        <Input
                            id="password"
                            type="password"
                            required
                            tabIndex={2}
                            autoComplete="current-password"
                            value={data.password}
                            onChange={(e) => setData("password", e.target.value)}
                            placeholder="Password"
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="flex items-center space-x-3">
                        <Checkbox
                            id="remember"
                            name="remember"
                            checked={data.remember}
                            onClick={() => setData("remember", !data.remember)}
                            tabIndex={3}
                        />
                        <Label htmlFor="remember">Remember me</Label>
                    </div>

                    <Button type="submit" className="mt-4 w-full" tabIndex={4} disabled={processing}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        {invitation ? "Log in & Join Workspace" : "Log in"}
                    </Button>
                </div>

                <div className="text-muted-foreground text-center text-sm">
                    Don't have an account?{" "}
                    <TextLink href={route("register", invitation ? { invitation } : {})} tabIndex={5}>
                        Sign up
                    </TextLink>
                </div>
            </form>

            {(providers || auth.magicLinkEnabled) && (
                <>
                    <div className="before:bg-border after:bg-border flex items-center gap-3 before:h-px before:flex-1 after:h-px after:flex-1 my-4">
                        <span className="text-muted-foreground text-xs">Or continue with</span>
                    </div>

                    <div className="flex flex-col gap-2">
                        {auth.magicLinkEnabled && (
                            <Link href={route("magiclink", { invitation })}>
                                <Button variant="outline" className="w-full">
                                    Magic Link
                                </Button>
                            </Link>
                        )}

                        <div className="flex gap-2">
                            {providers?.map((provider) => (
                                <SocialButton key={provider} provider={provider} invitation={invitation} />
                            ))}
                        </div>
                    </div>
                </>
            )}

            {status && <div className="mb-4 text-center text-sm font-medium text-green-600">{status}</div>}
        </DowntownGuideAuthLayout>
    );
}
