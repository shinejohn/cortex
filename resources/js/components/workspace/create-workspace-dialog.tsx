import { useForm } from "@inertiajs/react";
import { Loader2, FolderPlus } from "lucide-react";
import { useCallback } from "react";
import { ResponsiveDialog } from "../responsive-dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export const CreateWorkspaceDialog = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
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
                <div className="space-y-2">
                    <Input
                        type="text"
                        placeholder="Workspace Name"
                        name="name"
                        value={data.name}
                        onChange={(e) => setData("name", e.target.value)}
                        autoFocus
                        required
                        className="bg-muted/30 border-border/50 focus:bg-background"
                    />
                    {errors.name && (
                        <p className="text-sm text-destructive">{errors.name}</p>
                    )}
                </div>
                <Button
                    type="submit"
                    disabled={processing || !data.name}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                >
                    {processing ? (
                        <Loader2 className="size-4 animate-spin" />
                    ) : (
                        <span className="inline-flex items-center gap-2">
                            <FolderPlus className="size-4" />
                            Create
                        </span>
                    )}
                </Button>
            </form>
        </ResponsiveDialog>
    );
};
