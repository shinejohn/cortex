// Components
import { Head, useForm } from "@inertiajs/react";
import { LoaderCircle } from "lucide-react";
import { FormEventHandler } from "react";

import TextLink from "@/components/text-link";
import { Button } from "@/components/ui/button";
import DowntownGuideAuthLayout from "@/layouts/downtown-guide-auth-layout";
import { SharedData } from "@/types";
import { route } from "ziggy-js";

interface VerifyEmailProps extends SharedData {
    status?: string;
}

export default function VerifyEmail({ status, auth }: VerifyEmailProps) {
    const { post, processing } = useForm({});

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route("verification.send"));
    };

    return (
        <DowntownGuideAuthLayout
            auth={auth}
            title="Verify email"
            description="Please verify your email address by clicking on the link we just emailed to you."
        >
            <Head title="Email verification" />

            {status === "verification-link-sent" && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    A new verification link has been sent to the email address you provided during registration.
                </div>
            )}

            <form onSubmit={submit} className="space-y-6 text-center">
                <Button disabled={processing} variant="secondary">
                    {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                    Resend verification email
                </Button>

                <TextLink href={route("logout")} method="post" className="mx-auto block text-sm">
                    Log out
                </TextLink>
            </form>
        </DowntownGuideAuthLayout>
    );
}
