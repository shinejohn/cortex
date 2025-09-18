import { cn } from "@/lib/utils";
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon, ClockIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Input } from "../ui/input";
import { Separator } from "../ui/separator";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import CategoryFilter from "./category-filter";

type DateSelectorProps = {
    onDateChange: (date: Date) => void;
    currentView: "daily" | "weekly" | "monthly";
    setCurrentView: (view: "daily" | "weekly" | "monthly") => void;
    onCategoryChange?: (category: string) => void;
    selectedCategory?: string;
};

const DateSelector = ({ onDateChange, currentView, setCurrentView, onCategoryChange, selectedCategory = "All" }: DateSelectorProps) => {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    useEffect(() => {
        onDateChange(selectedDate);
    }, [selectedDate, onDateChange]);

    const formatDate = (date: Date): string => {
        return date.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
        });
    };

    const handlePreviousDay = () => {
        const prevDay = new Date(selectedDate);
        prevDay.setDate(selectedDate.getDate() - 1);
        setSelectedDate(prevDay);
    };

    const handleNextDay = () => {
        const nextDay = new Date(selectedDate);
        nextDay.setDate(selectedDate.getDate() + 1);
        setSelectedDate(nextDay);
    };

    const handleViewChange = (view: "daily" | "weekly" | "monthly") => {
        setCurrentView(view);
        // You might want to adjust the selected date based on view
        // For example, if switching to weekly, you might want to set to the start of the week
    };

    const handleDateSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value) {
            setSelectedDate(new Date(e.target.value));
            setShowDatePicker(false);
        }
    };

    const isToday = (date: Date): boolean => {
        const today = new Date();
        return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
    };

    return (
        <div className="py-4 bg-muted/30">
            {/* Date and View Selection Section */}
            <div className="max-w-7xl mx-auto px-3 sm:px-4">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
                    {/* Date Display and Navigation */}
                    <div className="flex items-center gap-4">
                        <DropdownMenu open={showDatePicker} onOpenChange={setShowDatePicker}>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="flex items-center gap-2 text-lg font-semibold text-foreground hover:text-primary p-0 h-auto"
                                >
                                    <CalendarIcon className="h-5 w-5 text-primary" />
                                    {isToday(selectedDate) ? (
                                        <Badge variant="secondary" className="text-sm font-medium">
                                            Today
                                        </Badge>
                                    ) : (
                                        <span>{formatDate(selectedDate)}</span>
                                    )}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-auto p-4">
                                <Input type="date" value={selectedDate.toISOString().split("T")[0]} onChange={handleDateSelect} className="w-full" />
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {currentView === "daily" && (
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handlePreviousDay}
                                    className="h-8 w-8 rounded-full hover:bg-accent"
                                    aria-label="Previous day"
                                >
                                    <ChevronLeftIcon className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleNextDay}
                                    className="h-8 w-8 rounded-full hover:bg-accent"
                                    aria-label="Next day"
                                >
                                    <ChevronRightIcon className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* View Toggle Buttons */}
                    <ToggleGroup
                        type="single"
                        value={currentView}
                        onValueChange={(value) => {
                            if (value) handleViewChange(value as "daily" | "weekly" | "monthly");
                        }}
                        variant="outline"
                        size="sm"
                        className="bg-background/80 backdrop-blur-sm border border-border/50"
                    >
                        <ToggleGroupItem value="daily" className="text-sm font-medium">
                            Daily
                        </ToggleGroupItem>
                        <ToggleGroupItem value="weekly" className="text-sm font-medium">
                            Next 7 Days
                        </ToggleGroupItem>
                        <ToggleGroupItem value="monthly" className="text-sm font-medium">
                            This Month
                        </ToggleGroupItem>
                    </ToggleGroup>
                </div>

                {/* Daily View Navigation Footer */}
                {currentView === "daily" && (
                    <div className="flex justify-center sm:justify-between items-center py-2 border-t border-border/50">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handlePreviousDay}
                            className="flex items-center gap-1 text-muted-foreground hover:text-primary"
                        >
                            <ChevronLeftIcon className="h-4 w-4" />
                            <span className="hidden sm:inline">Yesterday</span>
                        </Button>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedDate(new Date())}
                            className="flex items-center gap-1 text-muted-foreground hover:text-primary"
                        >
                            <ClockIcon className="h-4 w-4" />
                            Today
                        </Button>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleNextDay}
                            className="flex items-center gap-1 text-muted-foreground hover:text-primary"
                        >
                            <span className="hidden sm:inline">Tomorrow</span>
                            <ChevronRightIcon className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>

            {/* Event Categories Filter */}
            {onCategoryChange && selectedCategory && <CategoryFilter selectedCategory={selectedCategory} onCategoryChange={onCategoryChange} />}
        </div>
    );
};

export default DateSelector;
