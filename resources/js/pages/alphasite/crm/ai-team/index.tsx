import { Head, useForm, router } from "@inertiajs/react";
import { useState } from "react";
import { route } from "ziggy-js";
import AlphasiteCrmLayout from "@/layouts/alphasite-crm-layout";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Trash2, Briefcase, User, Sparkles, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Employee {
    id: string;
    name: string;
    role: string;
    status: string;
    avatar_url: string;
    personality_config: Record<string, any>;
    created_at: string;
}

interface Role {
    id: string;
    label: string;
    description: string;
}

interface Props {
    business: any;
    employees: Employee[];
    availableRoles: Role[];
    subscription: any;
}

export default function AiTeamIndex({ business, employees, availableRoles, subscription }: Props) {
    const [isHireModalOpen, setIsHireModalOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        role: "",
        personality_config: {},
    });

    const handleHire = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("alphasite.crm.ai-team.store") as string, {
            onSuccess: () => {
                setIsHireModalOpen(false);
                reset();
            },
        });
    };

    const confirmFire = (employee: Employee) => {
        if (confirm(`Are you sure you want to fire ${employee.name}? This cannot be undone.`)) {
            router.delete(route("alphasite.crm.ai-team.destroy", employee.id) as string);
        }
    };

    return (
        <AlphasiteCrmLayout business={business} title="AI Team" subscription={subscription}>
            <Head title={`AI Team | ${business.name}`} />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-display font-black tracking-tight text-foreground">AI Workforce</h1>
                    <p className="text-sm text-muted-foreground mt-1">Manage your autonomous agents.</p>
                </div>
                <Dialog open={isHireModalOpen} onOpenChange={setIsHireModalOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="size-4" /> Hire New Employee
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Hire AI Employee</DialogTitle>
                            <DialogDescription>
                                Add a new autonomous agent to your workforce.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleHire} className="space-y-4 pt-4">
                            <div className="grid w-full items-center gap-2">
                                <Label htmlFor="role">Select Role</Label>
                                <Select
                                    value={data.role}
                                    onValueChange={(value) => setData("role", value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choose a role..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableRoles.map(role => (
                                            <SelectItem key={role.id} value={role.id}>{role.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {data.role && (
                                    <p className="text-xs text-muted-foreground bg-muted p-2 rounded-md">
                                        {availableRoles.find(r => r.id === data.role)?.description}
                                    </p>
                                )}
                            </div>

                            <div className="grid w-full items-center gap-2">
                                <Label htmlFor="name">Employee Name</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData("name", e.target.value)}
                                    placeholder="e.g. Sarah"
                                    required
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <Button type="button" variant="outline" onClick={() => setIsHireModalOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? "Hiring..." : "Hire Employee"}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {employees.map((employee) => (
                    <Card key={employee.id} className="overflow-hidden">
                        <CardHeader className="flex flex-col items-center text-center pb-2">
                            <Avatar className="size-20 mb-4 border-2 border-border">
                                <AvatarImage src={employee.avatar_url} alt={employee.name} />
                                <AvatarFallback className="text-xl bg-muted">{employee.name[0]}</AvatarFallback>
                            </Avatar>
                            <h3 className="text-lg font-bold text-foreground">{employee.name}</h3>
                            <Badge variant="secondary" className="mt-2 mb-4">
                                {availableRoles.find(r => r.id === employee.role)?.label || employee.role}
                            </Badge>
                        </CardHeader>
                        <CardContent>
                            <div className="w-full text-left bg-muted/50 rounded-lg p-3 text-sm mb-4 border border-border/50">
                                <div className="flex items-center gap-2 mb-1">
                                    <Sparkles className="size-3 text-primary" />
                                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Personality</p>
                                </div>
                                <p className="text-foreground capitalize pl-5">
                                    {employee.personality_config?.tone || "Standard"} tone
                                </p>
                            </div>
                        </CardContent>
                        <CardFooter className="flex gap-2 bg-muted/30 p-4">
                            <Button variant="outline" className="w-full text-xs h-9" disabled title="Coming soon">
                                Assign Task
                            </Button>
                            <Button variant="destructive" size="icon" className="h-9 w-9 shrink-0" onClick={() => confirmFire(employee)} title="Fire Employee">
                                <Trash2 className="size-4" />
                            </Button>
                        </CardFooter>
                        <div className="bg-muted px-6 py-2 border-t border-border flex justify-between items-center text-[10px] text-muted-foreground uppercase tracking-wider">
                            <span className="flex items-center gap-1.5">
                                <span className={`size-1.5 rounded-full ${employee.status === 'active' ? 'bg-emerald-500' : 'bg-yellow-500'}`} />
                                {employee.status}
                            </span>
                            <span>Hired: {new Date(employee.created_at).toLocaleDateString()}</span>
                        </div>
                    </Card>
                ))}

                {employees.length === 0 && (
                    <div className="col-span-full py-16 text-center border-2 border-dashed border-muted rounded-xl bg-muted/10">
                        <div className="flex justify-center mb-4">
                            <div className="bg-background rounded-full p-4 shadow-sm">
                                <User className="size-8 text-muted-foreground/50" />
                            </div>
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-1">No Employees Found</h3>
                        <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6">
                            You haven't hired any AI employees yet. Build your autonomous workforce today.
                        </p>
                        <Button onClick={() => setIsHireModalOpen(true)}>
                            <Plus className="mr-2 size-4" /> Hire First Employee
                        </Button>
                    </div>
                )}
            </div>
        </AlphasiteCrmLayout>
    );
}
