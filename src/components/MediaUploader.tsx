import { useState, useRef, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { X, Upload, Image, Video, Loader2, GripVertical } from 'lucide-react';

interface MediaItem {
  id?: string;
  url: string;
  type: 'image' | 'video';
  is_primary: boolean;
  file?: File;
  uploading?: boolean;
}

interface MediaUploaderProps {
  propertyId?: string;
  initialMedia?: MediaItem[];
  onMediaChange: (media: MediaItem[]) => void;
  maxItems?: number;
}

export const MediaUploader = ({
  propertyId,
  initialMedia = [],
  onMediaChange,
  maxItems = 20,
}: MediaUploaderProps) => {
  const [media, setMedia] = useState<MediaItem[]>(initialMedia);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = maxItems - media.length;
    if (remainingSlots <= 0) {
      toast({
        title: 'Limite atteinte',
        description: `Maximum ${maxItems} fichiers autorisés`,
        variant: 'destructive',
      });
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    
    // Validate files
    const validFiles = filesToUpload.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024; // 100MB for video, 10MB for image
      
      if (!isImage && !isVideo) {
        toast({
          title: 'Type de fichier non supporté',
          description: `${file.name} n'est pas une image ou vidéo valide`,
          variant: 'destructive',
        });
        return false;
      }
      
      if (file.size > maxSize) {
        toast({
          title: 'Fichier trop volumineux',
          description: `${file.name} dépasse la limite de ${isVideo ? '100MB' : '10MB'}`,
          variant: 'destructive',
        });
        return false;
      }
      
      return true;
    });

    if (validFiles.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    const newMedia: MediaItem[] = [];
    
    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      const isVideo = file.type.startsWith('video/');
      
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user?.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { error: uploadError, data } = await supabase.storage
          .from('property-images')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('property-images')
          .getPublicUrl(fileName);

        newMedia.push({
          url: urlData.publicUrl,
          type: isVideo ? 'video' : 'image',
          is_primary: media.length === 0 && i === 0,
        });

        setUploadProgress(((i + 1) / validFiles.length) * 100);
      } catch (error: any) {
        console.error('Upload error:', error);
        toast({
          title: 'Erreur d\'upload',
          description: `Échec de l'upload de ${file.name}`,
          variant: 'destructive',
        });
      }
    }

    const updatedMedia = [...media, ...newMedia];
    setMedia(updatedMedia);
    onMediaChange(updatedMedia);
    setUploading(false);
    setUploadProgress(0);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemove = (index: number) => {
    const updatedMedia = media.filter((_, i) => i !== index);
    
    // If we removed the primary, set first as primary
    if (media[index].is_primary && updatedMedia.length > 0) {
      updatedMedia[0].is_primary = true;
    }
    
    setMedia(updatedMedia);
    onMediaChange(updatedMedia);
  };

  const handleSetPrimary = (index: number) => {
    const updatedMedia = media.map((m, i) => ({
      ...m,
      is_primary: i === index,
    }));
    setMedia(updatedMedia);
    onMediaChange(updatedMedia);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Photos et vidéos ({media.length}/{maxItems})</Label>
        <Badge variant="outline">
          {media.filter(m => m.type === 'image').length} photos, {media.filter(m => m.type === 'video').length} vidéos
        </Badge>
      </div>

      {/* Upload area */}
      <div 
        className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <Input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        {uploading ? (
          <div className="space-y-2">
            <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Upload en cours...</p>
            <Progress value={uploadProgress} className="w-48 mx-auto" />
          </div>
        ) : (
          <>
            <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="font-medium">Cliquez ou glissez vos fichiers</p>
            <p className="text-sm text-muted-foreground">
              Images (max 10MB) et vidéos (max 100MB)
            </p>
          </>
        )}
      </div>

      {/* Media grid */}
      {media.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {media.map((item, index) => (
            <div
              key={index}
              className={`relative group rounded-lg overflow-hidden border-2 ${
                item.is_primary ? 'border-primary' : 'border-transparent'
              }`}
            >
              {item.type === 'video' ? (
                <video
                  src={item.url}
                  className="w-full h-32 object-cover"
                  muted
                />
              ) : (
                <img
                  src={item.url}
                  alt=""
                  className="w-full h-32 object-cover"
                />
              )}
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {!item.is_primary && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSetPrimary(index);
                    }}
                  >
                    Principal
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(index);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Badges */}
              <div className="absolute top-2 left-2 flex gap-1">
                {item.type === 'video' && (
                  <Badge className="bg-black/70">
                    <Video className="h-3 w-3 mr-1" />
                    Vidéo
                  </Badge>
                )}
                {item.is_primary && (
                  <Badge className="bg-primary">Principal</Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
