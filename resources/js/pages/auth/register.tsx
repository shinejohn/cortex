import { Head, Link, useForm } from "@inertiajs/react";
import { LoaderCircle } from "lucide-react";
import { FormEventHandler } from "react";

import InputError from "@/components/input-error";
import SocialButton from "@/components/socialite/social-button";
import TextLink from "@/components/text-link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthLayout from "@/layouts/auth-layout";
import { SharedData } from "@/types";

type RegisterForm = {
    name: string;
    email: string;
    password: string;
    invitation?: string;
};

interface RegisterProps extends SharedData {
    providers: string[];
    invitation?: string;
}

export default function Register({
    providers,
    invitation,
    auth,
}: RegisterProps) {
    const { data, setData, post, processing, errors, reset } = useForm<
        Required<RegisterForm>
    >({
        name: "",
        email: "",
        password: "",
        invitation: invitation || "",
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route("register"), {
            onFinish: () => reset("password"),
        });
    };

    return (
        <AuthLayout
            title="Create an account"
            description="Enter your details below to create your account"
        >
            <Head title="Register" />
            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            type="text"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="name"
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                            disabled={processing}
                            placeholder="Full name"
                        />
                        <InputError message={errors.name} className="mt-2" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            tabIndex={2}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData("email", e.target.value)}
                            disabled={processing}
                            placeholder="email@example.com"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            required
                            tabIndex={3}
                            autoComplete="new-password"
                            value={data.password}
                            onChange={(e) =>
                                setData("password", e.target.value)
                            }
                            disabled={processing}
                            placeholder="Password"
                        />
                        <InputError message={errors.password} />
                    </div>

                    <Button
                        type="submit"
                        className="mt-2 w-full"
                        tabIndex={5}
                        disabled={processing}
                    >
                        {processing && (
                            <LoaderCircle className="h-4 w-4 animate-spin" />
                        )}
                        {invitation
                            ? "Create Account & Join Workspace"
                            : "Create account"}
                    </Button>
                </div>

                <div className="text-muted-foreground text-center text-sm">
                    Already have an account?{" "}
                    <TextLink
                        href={route("login", invitation ? { invitation } : {})}
                        tabIndex={6}
                    >
                        Log in
                    </TextLink>
                </div>
            </form>

            {(providers || auth.magicLinkEnabled) && (
                <>
                    <div className="before:bg-border after:bg-border flex items-center gap-3 before:h-px before:flex-1 after:h-px after:flex-1 my-4">
                        <span className="text-muted-foreground text-xs">
                            Or continue with
                        </span>
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
                                <SocialButton
                                    key={provider}
                                    provider={provider}
                                    invitation={invitation}
                                />
                            ))}
                        </div>
                    </div>
                </>
            )}
        </AuthLayout>
    );
}
