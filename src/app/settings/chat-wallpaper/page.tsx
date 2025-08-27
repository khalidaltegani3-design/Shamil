
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ImageIcon, Palette, Trash2 } from 'lucide-react';
import Image from 'next/image';

export default function ChatWallpaperSettingsPage() {
  const router = useRouter();

  const wallpapers = [
      { id: '1', url: 'https://placehold.co/400x800.png', hint: 'abstract pattern' },
      { id: '2', url: 'https://placehold.co/400x800.png', hint: 'mountain landscape' },
      { id: '3', url: 'https://placehold.co/400x800.png', hint: 'forest path' },
      { id: '4', url: 'https://placehold.co/400x800.png', hint: 'beach sunset' },
      { id: '5', url: 'https://placehold.co/400x800.png', hint: 'city skyline' },
      { id: '6', url: 'https://placehold.co/400x800.png', hint: 'minimalist texture' },
  ];

  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      <header className="flex items-center gap-3 p-3 border-b h-16 flex-shrink-0 bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <Button onClick={() => router.back()} variant="ghost" size="icon">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Chat Wallpaper</h1>
      </header>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex items-center gap-4 mb-6">
            <Button variant="outline" className="flex-1 h-24 flex-col gap-2">
                <ImageIcon className="h-6 w-6"/>
                <span>My Photos</span>
            </Button>
             <Button variant="outline" className="flex-1 h-24 flex-col gap-2">
                <Palette className="h-6 w-6"/>
                <span>Solid Colors</span>
            </Button>
             <Button variant="outline" className="flex-1 h-24 flex-col gap-2 text-destructive">
                <Trash2 className="h-6 w-6"/>
                <span>Remove</span>
            </Button>
        </div>

        <h3 className="font-semibold text-muted-foreground mb-3 px-1">Bright</h3>
        <div className="grid grid-cols-3 gap-2">
            {wallpapers.map(wallpaper => (
                <button key={wallpaper.id} className="aspect-[9/16] rounded-lg overflow-hidden relative group">
                    <Image 
                        src={wallpaper.url}
                        alt="Wallpaper thumbnail"
                        fill
                        className="object-cover"
                        data-ai-hint={wallpaper.hint}
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                </button>
            ))}
        </div>
      </div>
    </div>
  );
}
