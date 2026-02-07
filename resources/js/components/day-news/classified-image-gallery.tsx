import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { type ClassifiedImage } from "@/types/classified";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useState } from "react";

interface Props {
    images: ClassifiedImage[];
    title: string;
}

export function ClassifiedImageGallery({ images, title }: Props) {
    const [currentImage, setCurrentImage] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    if (images.length === 0) return null;

    const nextImage = () => setCurrentImage((prev) => (prev + 1) % images.length);
    const prevImage = () => setCurrentImage((prev) => (prev - 1 + images.length) % images.length);

    return (
        <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
                <img
                    src={images[currentImage].url}
                    alt={`${title} - Image ${currentImage + 1}`}
                    className="h-full w-full object-contain cursor-pointer"
                    onClick={() => setIsOpen(true)}
                />

                {images.length > 1 && (
                    <>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
                            onClick={(e) => {
                                e.stopPropagation();
                                prevImage();
                            }}
                        >
                            <ChevronLeft className="h-6 w-6" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
                            onClick={(e) => {
                                e.stopPropagation();
                                nextImage();
                            }}
                        >
                            <ChevronRight className="h-6 w-6" />
                        </Button>
                    </>
                )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {images.map((image, index) => (
                        <button
                            key={image.id}
                            className={`relative aspect-square h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border-2 ${index === currentImage ? "border-primary" : "border-transparent"
                                }`}
                            onClick={() => setCurrentImage(index)}
                        >
                            <img
                                src={image.url}
                                alt={`${title} - Thumbnail ${index + 1}`}
                                className="h-full w-full object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}

            {/* Lightbox Modal */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-4xl p-0 bg-black/90 border-none">
                    <div className="relative flex h-[80vh] items-center justify-center">
                        <img
                            src={images[currentImage].url}
                            alt={`${title} - Fullscreen`}
                            className="max-h-full max-w-full object-contain"
                        />
                        <button
                            className="absolute right-4 top-4 text-white hover:text-gray-300"
                            onClick={() => setIsOpen(false)}
                        >
                            <X className="h-8 w-8" />
                        </button>

                        {images.length > 1 && (
                            <>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 h-12 w-12 rounded-full"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        prevImage();
                                    }}
                                >
                                    <ChevronLeft className="h-8 w-8" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 h-12 w-12 rounded-full"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        nextImage();
                                    }}
                                >
                                    <ChevronRight className="h-8 w-8" />
                                </Button>
                            </>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
