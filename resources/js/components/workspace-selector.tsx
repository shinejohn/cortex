import { router } from "@inertiajs/react";
import axios from "axios";
import { CheckIcon, ChevronsUpDown, Loader2, PlusIcon, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { route } from "ziggy-js";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { SharedData } from "@/types";
import { CreateWorkspaceDialog } from "./workspace/create-workspace-dialog";

export function WorkspaceSelector({ workspaces }: { workspaces: SharedData["workspaces"] }) {
    const { state } = useSidebar();
    const [isLoading, setIsLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const hasWorkspaces = workspaces.all.length > 0;
    const currentWorkspace = workspaces.current;

    if (!hasWorkspaces) {
        return null;
    }

    const isCollapsed = state === "collapsed";

    const handleWorkspaceSwitch = async (workspaceId: string) => {
        if (workspaceId === currentWorkspace?.id || isLoading) {
            return;
        }

        setIsLoading(true);

        try {
            await axios.post(route("workspaces.switch"), {
                workspace_id: workspaceId,
            });
            toast.success("Workspace switched successfully");
            router.reload();
        } catch (error: any) {
            console.error("Failed to switch workspace:", error);
            const errorMessage = error.response?.data?.message || error.response?.data?.error || "Failed to switch workspace. Please try again.";
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <SidebarMenu>
                <SidebarMenuItem>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <SidebarMenuButton size="sm" className="ring-border bg-background rounded-lg ring-1 md:h-8" disabled={isLoading}>
                                <div className="flex aspect-square size-4 items-center justify-center rounded-lg">
                                    {currentWorkspace?.logo ? (
                                        <img src={currentWorkspace.logo} alt={currentWorkspace.name} className="size-4 rounded-lg border-2" />
                                    ) : (
                                        <Users className="size-4" />
                                    )}
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">{currentWorkspace?.name || "Select a workspace"}</span>
                                    {isLoading && <span className="text-xs text-muted-foreground">Switching...</span>}
                                </div>
                                {isLoading ? <Loader2 className="ml-auto size-4 animate-spin" /> : <ChevronsUpDown className="ml-auto size-4" />}
                            </SidebarMenuButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className="max-h-48 w-[--radix-dropdown-menu-trigger-width] min-w-56 overflow-auto rounded-lg"
                            side={isCollapsed ? "right" : "bottom"}
                            align="start"
                            sideOffset={4}
                        >
                            {workspaces.all.map((workspace) => (
                                <DropdownMenuItem
                                    key={workspace.id}
                                    onClick={() => handleWorkspaceSwitch(workspace.id)}
                                    disabled={isLoading || workspace.id === currentWorkspace?.id}
                                    className="cursor-pointer"
                                >
                                    <div className="flex w-full items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <img src={workspace.logo} alt={workspace.name} className="size-4 rounded-lg border-2" />
                                            <span className="truncate">{workspace.name}</span>
                                        </div>
                                        {currentWorkspace?.id === workspace.id ? (
                                            <CheckIcon className="h-4 w-4 text-green-600" />
                                        ) : isLoading ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : null}
                                    </div>
                                </DropdownMenuItem>
                            ))}

                            {workspaces.enabled && workspaces.canCreateWorkspaces && (
                                <DropdownMenuItem onClick={() => setOpen(true)}>
                                    <span className="flex items-center gap-2">
                                        <PlusIcon className="size-4" />
                                        Create Workspace
                                    </span>
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </SidebarMenuItem>
            </SidebarMenu>
            <CreateWorkspaceDialog open={open} onOpenChange={setOpen} />
        </>
    );
}
