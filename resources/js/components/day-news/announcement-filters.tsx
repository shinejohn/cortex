import React from "react";
import { cn } from "@/lib/utils";
import {
    Cake,
    Heart,
    Baby,
    GraduationCap,
    Gem,
    PartyPopper,
    Megaphone,
    Calendar,
    Users,
    Activity,
    School,
    Construction,
    MapPin,
    Ghost,
    Cross,
} from "lucide-react";

interface AnnouncementFiltersProps {
    activeType: string;
    onTypeChange: (type: string) => void;
}

const types = [
    { id: "all", label: "All News", icon: Activity },
    { id: "memorial", label: "Memorials", icon: Cross },
    { id: "obituary", label: "Obituaries", icon: Ghost },
    { id: "birth", label: "Births", icon: Baby },
    { id: "wedding", label: "Weddings", icon: Gem },
    { id: "engagement", label: "Engagements", icon: Heart },
    { id: "graduation", label: "Graduations", icon: GraduationCap },
    { id: "anniversary", label: "Anniversaries", icon: Cake },
    { id: "celebration", label: "Celebrations", icon: PartyPopper },
    { id: "community_event", label: "Community", icon: Users },
    { id: "public_notice", label: "Public Notices", icon: Megaphone },
    { id: "emergency_alert", label: "Emergencies", icon: Megaphone },
];

export function AnnouncementFilters({ activeType, onTypeChange }: AnnouncementFiltersProps) {
    return (
        <div className="group relative">
            <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar">
                {types.map((type) => (
                    <button
                        key={type.id}
                        onClick={() => onTypeChange(type.id)}
                        className={cn(
                            "flex items-center gap-2 whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-bold transition-all border shrink-0",
                            activeType === type.id
                                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                : "bg-white text-muted-foreground hover:bg-muted/50 border-transparent hover:border-muted"
                        )}
                    >
                        <type.icon className={cn("size-4", activeType === type.id ? "text-primary-foreground" : "text-primary")} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{type.label}</span>
                    </button>
                ))}
            </div>

            {/* Fade effect for horizontal scroll */}
            <div className="absolute right-0 top-0 h-[calc(100%-16px)] w-20 bg-gradient-to-l from-background to-transparent pointer-events-none" />
        </div>
    );
}
