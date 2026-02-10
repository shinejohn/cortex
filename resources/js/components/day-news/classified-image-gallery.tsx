import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { type ClassifiedImage } from "@/types/classified";
import { ChevronLeft, ChevronRight, ImageOff, X } from "lucide-react";
import { useState } from "react";

interface Props {
    images: ClassifiedImage[];
    title: string;
}

export function ClassifiedImageGallery({ images, title }: Props) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);

    if (images.length === 0) {
        return (
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                    <ImageOff className="size-12 mx-auto mb-2" />
                    <p>No images</p>
                </div>
            </div>
        );
    }

    const currentImage = images[selectedIndex];

    const goToPrevious = () => {
        setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const goToNext = () => {
        setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowLeft") goToPrevious();
        if (e.key === "ArrowRight") goToNext();
        if (e.key === "Escape") setLightboxOpen(false);
    };

    return (
        <div className="space-y-3">
            {/* Main image */}
            <div
                className="relative aspect-video bg-muted rounded-lg overflow-hidden cursor-pointer group"
                onClick={() => setLightboxOpen(true)}
            >
                <img
                    src={currentImage.url}
                    alt={`${title} - Image ${selectedIndex + 1}`}
                    className="size-full object-contain"
                />
                {images.length > 1 && (
                    <>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                goToPrevious();
                            }}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <ChevronLeft className="size-5" />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                goToNext();
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <ChevronRight className="size-5" />
                        </button>
                        <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                            {selectedIndex + 1} / {images.length}
                        </div>
                    </>
                )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {images.map((image, index) => (
                        <button
                            key={image.id}
                            onClick={() => setSelectedIndex(index)}
                            className={cn(
                                "flex-shrink-0 size-16 rounded-md overflow-hidden border-2 transition-all",
                                index === selectedIndex ? "border-primary" : "border-transparent hover:border-muted-foreground/50",
                            )}
                        >
                            <img src={image.url} alt={`${title} - Thumbnail ${index + 1}`} className="size-full object-cover" />
                        </button>
                    ))}
                </div>
            )}

            {/* Lightbox */}
            <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
                <DialogContent
                    className="max-w-[90vw] max-h-[90vh] p-0 bg-black border-none"
                    onKeyDown={handleKeyDown}
                >
                    <button
                        onClick={() => setLightboxOpen(false)}
                        className="absolute right-4 top-4 z-50 bg-black/50 text-white rounded-full p-2 hover:bg-black/70"
                    >
                        <X className="size-5" />
                    </button>
                    <div className="relative size-full flex items-center justify-center">
                        <img
                            src={currentImage.url}
                            alt={`${title} - Image ${selectedIndex + 1}`}
                            className="max-w-full max-h-[85vh] object-contain"
                        />
                        {images.length > 1 && (
                            <>
                                <button
                                    onClick={goToPrevious}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-3 hover:bg-black/70"
                                >
                                    <ChevronLeft className="size-6" />
                                </button>
                                <button
                                    onClick={goToNext}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-3 hover:bg-black/70"
                                >
                                    <ChevronRight className="size-6" />
                                </button>
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-sm px-3 py-1 rounded">
                                    {selectedIndex + 1} / {images.length}
                                </div>
                            </>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
