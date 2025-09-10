import { useForm } from "@inertiajs/react";
import { Loader2 } from "lucide-react";
import { useCallback } from "react";
import { ResponsiveDialog } from "../responsive-dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export const CreateWorkspaceDialog = ({
    open,
    onOpenChange,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) => {
    const { data, setData, post, processing, errors } = useForm({
        name: "",
    });

    const onClose = useCallback(() => {
        setData("name", "");
        onOpenChange(false);
    }, [setData, onOpenChange]);

    const handleSubmit = useCallback(
        (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            if (processing) return;

            post(route("workspaces.store"), {
                onSuccess: onClose,
            });
        },
        [post, processing, onClose],
    );

    return (
        <ResponsiveDialog title="Create Workspace" open={open} onOpenChange={onClose}>
            <form className="flex flex-col gap-4" onSubmit={handleSubmit} autoComplete="off">
                <Input
                    type="text"
                    placeholder="Workspace Name"
                    name="name"
                    value={data.name}
                    onChange={(e) => setData("name", e.target.value)}
                    autoFocus
                    required
                />
                {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                <Button type="submit" disabled={processing || !data.name}>
                    {processing ? <Loader2 className="size-4 animate-spin" /> : "Create"}
                </Button>
            </form>
        </ResponsiveDialog>
    );
};
