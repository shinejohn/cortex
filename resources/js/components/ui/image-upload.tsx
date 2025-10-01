import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ImageIcon, Upload, X } from "lucide-react";
import React, { useCallback, useState } from "react";

interface ImageUploadProps {
    value?: File[];
    onChange: (files: File[]) => void;
    maxFiles?: number;
    maxSize?: number; // in MB
    accept?: string;
    label?: string;
    description?: string;
    className?: string;
}

export function ImageUpload({
    value = [],
    onChange,
    maxFiles = 5,
    maxSize = 5,
    accept = "image/*",
    label = "Upload Images",
    description = "Drag and drop images here, or click to select",
    className,
}: ImageUploadProps) {
    const [dragActive, setDragActive] = useState(false);
    const [previews, setPreviews] = useState<string[]>([]);

    const handleFiles = useCallback(
        (files: FileList | null) => {
            if (!files) return;

            const newFiles = Array.from(files).filter((file) => {
                // Check file type
                if (!file.type.startsWith("image/")) {
                    return false;
                }

                // Check file size
                if (file.size > maxSize * 1024 * 1024) {
                    return false;
                }

                return true;
            });

            // Limit number of files
            const totalFiles = [...value, ...newFiles].slice(0, maxFiles);
            onChange(totalFiles);

            // Generate previews
            const newPreviews: string[] = [];
            totalFiles.forEach((file) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    newPreviews.push(reader.result as string);
                    if (newPreviews.length === totalFiles.length) {
                        setPreviews(newPreviews);
                    }
                };
                reader.readAsDataURL(file);
            });
        },
        [value, onChange, maxFiles, maxSize],
    );

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setDragActive(false);

            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFiles(e.dataTransfer.files);
            }
        },
        [handleFiles],
    );

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            e.preventDefault();
            if (e.target.files && e.target.files[0]) {
                handleFiles(e.target.files);
            }
        },
        [handleFiles],
    );

    const removeImage = useCallback(
        (index: number) => {
            const newFiles = value.filter((_, i) => i !== index);
            onChange(newFiles);

            const newPreviews = previews.filter((_, i) => i !== index);
            setPreviews(newPreviews);
        },
        [value, previews, onChange],
    );

    return (
        <div className={cn("space-y-4", className)}>
            {label && <Label>{label}</Label>}

            <div
                className={cn(
                    "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors",
                    dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-muted-foreground/50",
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    multiple
                    accept={accept}
                    onChange={handleChange}
                    className="absolute inset-0 z-50 h-full w-full cursor-pointer opacity-0"
                    disabled={value.length >= maxFiles}
                />

                <div className="flex flex-col items-center justify-center gap-2 text-center">
                    <div className="rounded-full bg-muted p-3">
                        <Upload className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-medium">{description}</p>
                        <p className="text-xs text-muted-foreground">
                            Maximum {maxFiles} files, up to {maxSize}MB each
                        </p>
                    </div>
                </div>
            </div>

            {previews.length > 0 && (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                    {previews.map((preview, index) => (
                        <div key={index} className="group relative aspect-square overflow-hidden rounded-lg border bg-muted">
                            <img src={preview} alt={`Preview ${index + 1}`} className="h-full w-full object-cover" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute right-2 top-2 h-8 w-8"
                                    onClick={() => removeImage(index)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-1">
                                <p className="text-xs text-white">
                                    {(value[index].size / 1024 / 1024).toFixed(2)}
                                    MB
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {value.length > 0 && (
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                        {value.length} of {maxFiles} images uploaded
                    </span>
                    {value.length >= maxFiles && <span className="text-destructive">Maximum files reached</span>}
                </div>
            )}
        </div>
    );
}
