import { useState } from 'react';
import { Play, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface MediaItem {
  url: string;
  type?: 'image' | 'video';
  is_primary?: boolean;
}

interface PropertyMediaGridProps {
  media: MediaItem[];
  title?: string;
  className?: string;
}

// Détermine si un fichier est une vidéo basé sur l'URL
const isVideoUrl = (url: string): boolean => {
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];
  return videoExtensions.some(ext => url.toLowerCase().includes(ext));
};

export const PropertyMediaGrid = ({ media, title = 'Property', className = '' }: PropertyMediaGridProps) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (!media || media.length === 0) return null;

  // Normalize media items
  const normalizedMedia = media.map(item => ({
    url: item.url,
    type: item.type || (isVideoUrl(item.url) ? 'video' : 'image'),
    is_primary: item.is_primary,
  }));

  const displayMedia = normalizedMedia.slice(0, 5);
  const remainingCount = normalizedMedia.length - 5;

  const handlePrev = () => {
    setSelectedIndex(prev => 
      prev !== null ? (prev > 0 ? prev - 1 : normalizedMedia.length - 1) : null
    );
  };

  const handleNext = () => {
    setSelectedIndex(prev => 
      prev !== null ? (prev < normalizedMedia.length - 1 ? prev + 1 : 0) : null
    );
  };

  const renderMediaItem = (item: typeof normalizedMedia[0], index: number, extraClass = '') => {
    if (item.type === 'video') {
      return (
        <div 
          className={`relative cursor-pointer group overflow-hidden ${extraClass}`}
          onClick={() => setSelectedIndex(index)}
        >
          <video
            src={item.url}
            className="h-full w-full object-cover"
            muted
            preload="metadata"
            playsInline
          />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-colors">
            <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
              <Play className="h-6 w-6 text-primary ml-1" />
            </div>
          </div>
        </div>
      );
    }

    return (
      <img
        src={item.url}
        alt={`${title} ${index + 1}`}
        loading="lazy"
        className={`h-full w-full object-cover cursor-pointer hover:opacity-90 transition-opacity ${extraClass}`}
        onClick={() => setSelectedIndex(index)}
      />
    );
  };

  // Layout pour 1 image
  if (displayMedia.length === 1) {
    return (
      <>
        <div className={`aspect-video rounded-lg overflow-hidden ${className}`}>
          {renderMediaItem(displayMedia[0], 0)}
        </div>
        <MediaDialog 
          media={normalizedMedia}
          selectedIndex={selectedIndex}
          onClose={() => setSelectedIndex(null)}
          onPrev={handlePrev}
          onNext={handleNext}
        />
      </>
    );
  }

  // Layout pour 2 images
  if (displayMedia.length === 2) {
    return (
      <>
        <div className={`grid grid-cols-2 gap-1 rounded-lg overflow-hidden ${className}`}>
          {displayMedia.map((item, index) => (
            <div key={index} className="aspect-square">
              {renderMediaItem(item, index)}
            </div>
          ))}
        </div>
        <MediaDialog 
          media={normalizedMedia}
          selectedIndex={selectedIndex}
          onClose={() => setSelectedIndex(null)}
          onPrev={handlePrev}
          onNext={handleNext}
        />
      </>
    );
  }

  // Layout pour 3 images: 1 grande à gauche, 2 petites à droite
  if (displayMedia.length === 3) {
    return (
      <>
        <div className={`grid grid-cols-2 gap-1 rounded-xl overflow-hidden aspect-[4/3] ${className}`}>
          <div className="row-span-2">
            {renderMediaItem(displayMedia[0], 0, 'h-full')}
          </div>
          <div className="grid grid-rows-2 gap-1">
            {displayMedia.slice(1, 3).map((item, index) => (
              <div key={index + 1} className="overflow-hidden">
                {renderMediaItem(item, index + 1)}
              </div>
            ))}
          </div>
        </div>
        <MediaDialog 
          media={normalizedMedia}
          selectedIndex={selectedIndex}
          onClose={() => setSelectedIndex(null)}
          onPrev={handlePrev}
          onNext={handleNext}
        />
      </>
    );
  }

  // Layout pour 4 images: grille 2x2
  if (displayMedia.length === 4) {
    return (
      <>
        <div className={`grid grid-cols-2 grid-rows-2 gap-1 rounded-xl overflow-hidden aspect-[4/3] ${className}`}>
          {displayMedia.map((item, index) => (
            <div key={index} className="overflow-hidden">
              {renderMediaItem(item, index)}
            </div>
          ))}
        </div>
        <MediaDialog 
          media={normalizedMedia}
          selectedIndex={selectedIndex}
          onClose={() => setSelectedIndex(null)}
          onPrev={handlePrev}
          onNext={handleNext}
        />
      </>
    );
  }

  // Layout style collage (5+ images) - 2 en haut, 3 en bas
  return (
    <>
      <div className={`grid grid-rows-2 gap-1 rounded-xl overflow-hidden aspect-[4/3] ${className}`}>
        {/* Row 1: 2 images */}
        <div className="grid grid-cols-2 gap-1">
          {displayMedia.slice(0, 2).map((item, index) => (
            <div key={index} className="relative overflow-hidden">
              {renderMediaItem(item, index)}
            </div>
          ))}
        </div>
        
        {/* Row 2: 3 images */}
        <div className="grid grid-cols-3 gap-1">
          {displayMedia.slice(2, 5).map((item, index) => (
            <div key={index + 2} className="relative overflow-hidden">
              {renderMediaItem(item, index + 2)}
              {/* Overlay +X sur la dernière image si plus de 5 médias */}
              {index === 2 && remainingCount > 0 && (
                <div 
                  className="absolute inset-0 bg-black/60 flex items-center justify-center cursor-pointer"
                  onClick={() => setSelectedIndex(4)}
                >
                  <span className="text-white text-2xl font-bold">+{remainingCount}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <MediaDialog 
        media={normalizedMedia}
        selectedIndex={selectedIndex}
        onClose={() => setSelectedIndex(null)}
        onPrev={handlePrev}
        onNext={handleNext}
      />
    </>
  );
};

// Dialog pour afficher les médias en plein écran
interface MediaDialogProps {
  media: { url: string; type: string }[];
  selectedIndex: number | null;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

const MediaDialog = ({ media, selectedIndex, onClose, onPrev, onNext }: MediaDialogProps) => {
  if (selectedIndex === null) return null;

  const currentItem = media[selectedIndex];

  return (
    <Dialog open={selectedIndex !== null} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-5xl p-0 bg-black/95 border-0">
        <div className="relative w-full h-[80vh] flex items-center justify-center">
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
          </Button>

          {/* Navigation */}
          {media.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 z-10 text-white hover:bg-white/20 h-12 w-12"
                onClick={onPrev}
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 z-10 text-white hover:bg-white/20 h-12 w-12"
                onClick={onNext}
              >
                <ChevronRight className="h-8 w-8" />
              </Button>
            </>
          )}

          {/* Media content */}
          {currentItem.type === 'video' ? (
            <video
              src={currentItem.url}
              controls
              autoPlay
              className="max-w-full max-h-full"
            />
          ) : (
            <img
              src={currentItem.url}
              alt={`Media ${selectedIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />
          )}

          {/* Counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1 rounded-full">
            {selectedIndex + 1} / {media.length}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
