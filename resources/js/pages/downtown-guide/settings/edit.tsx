import DowntownGuideLayout from "@/layouts/downtown-guide-layout";
import { Head, useForm, usePage } from "@inertiajs/react";
import { Auth } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { FormEventHandler } from "react";

interface SettingsEditProps {
    auth: Auth;
    mustVerifyEmail: boolean;
    status: string;
}

export default function SettingsEdit({ auth, mustVerifyEmail, status }: SettingsEditProps) {
    return (
        <DowntownGuideLayout
            auth={auth}
            seo={{
                title: "Account Settings",
                description: "Manage your account settings",
            }}
        >
            <Head title="Account Settings" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                        <section className="max-w-xl">
                            <header>
                                <h2 className="text-lg font-medium text-gray-900">Profile Information</h2>
                                <p className="mt-1 text-sm text-gray-600">
                                    Update your account's profile information and email address.
                                </p>
                            </header>

                            <UpdateProfileInformationForm
                                mustVerifyEmail={mustVerifyEmail}
                                status={status}
                                className="mt-6 space-y-6"
                                user={auth.user}
                            />
                        </section>
                    </div>

                    <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                        <section className="max-w-xl">
                            <header>
                                <h2 className="text-lg font-medium text-gray-900">Update Password</h2>
                                <p className="mt-1 text-sm text-gray-600">
                                    Ensure your account is using a long, random password to stay secure.
                                </p>
                            </header>

                            <UpdatePasswordForm className="mt-6 space-y-6" />
                        </section>
                    </div>

                    <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                        <section className="max-w-xl">
                            <header>
                                <h2 className="text-lg font-medium text-gray-900">Delete Account</h2>
                                <p className="mt-1 text-sm text-gray-600">
                                    Once your account is deleted, all of its resources and data will be permanently deleted.
                                </p>
                            </header>

                            {/* Delete account form would go here */}
                            <div className="mt-6">
                                <Button variant="destructive" disabled>Delete Account (Contact Support)</Button>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </DowntownGuideLayout>
    );
}

function UpdateProfileInformationForm({ mustVerifyEmail, status, className, user }: { mustVerifyEmail: boolean, status: string, className?: string, user: any }) {
    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        name: user.name,
        email: user.email,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        patch(route('downtown-guide.settings.update'));
    };

    return (
        <form onSubmit={submit} className={className}>
            <div>
                <Label htmlFor="name">Name</Label>
                <Input
                    id="name"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    required
                    autoComplete="name"
                />
                {errors.name && <div className="text-red-500 text-sm mt-1">{errors.name}</div>}
            </div>

            <div>
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    type="email"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    required
                    autoComplete="username"
                />
                {errors.email && <div className="text-red-500 text-sm mt-1">{errors.email}</div>}
            </div>

            <div className="flex items-center gap-4">
                <Button disabled={processing}>Save</Button>
                {recentlySuccessful && <p className="text-sm text-gray-600">Saved.</p>}
            </div>
        </form>
    );
}

function UpdatePasswordForm({ className }: { className?: string }) {
    const { data, setData, put, errors, processing, recentlySuccessful, reset } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('downtown-guide.settings.password.update'), {
            onSuccess: () => reset(),
        });
    };

    return (
        <form onSubmit={submit} className={className}>
            <div>
                <Label htmlFor="current_password">Current Password</Label>
                <Input
                    id="current_password"
                    type="password"
                    value={data.current_password}
                    onChange={(e) => setData('current_password', e.target.value)}
                    autoComplete="current-password"
                />
                {errors.current_password && <div className="text-red-500 text-sm mt-1">{errors.current_password}</div>}
            </div>

            <div>
                <Label htmlFor="password">New Password</Label>
                <Input
                    id="password"
                    type="password"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    autoComplete="new-password"
                />
                {errors.password && <div className="text-red-500 text-sm mt-1">{errors.password}</div>}
            </div>

            <div>
                <Label htmlFor="password_confirmation">Confirm Password</Label>
                <Input
                    id="password_confirmation"
                    type="password"
                    value={data.password_confirmation}
                    onChange={(e) => setData('password_confirmation', e.target.value)}
                    autoComplete="new-password"
                />
                {errors.password_confirmation && <div className="text-red-500 text-sm mt-1">{errors.password_confirmation}</div>}
            </div>

            <div className="flex items-center gap-4">
                <Button disabled={processing}>Save</Button>
                {recentlySuccessful && <p className="text-sm text-gray-600">Saved.</p>}
            </div>
        </form>
    );
}
