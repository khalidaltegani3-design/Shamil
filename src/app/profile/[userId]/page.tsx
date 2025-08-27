
"use client"

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { users, videos as allVideos, type User, type Video } from '@/lib/mock-data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Grid3x3, Heart, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function ProfilePage() {
    const router = useRouter();
    const params = useParams();
    const userId = params.userId as string;

    const [user, setUser] = useState<User | null>(null);
    const [userVideos, setUserVideos] = useState<Video[]>([]);

    useEffect(() => {
        if (userId) {
            const foundUser = users.find(u => u.id === userId);
            setUser(foundUser || null);
            
            const videosByUser = allVideos.filter(v => v.user.id === userId);
            setUserVideos(videosByUser);
        }
    }, [userId]);

    if (!user) {
        return (
            <div className="flex flex-col h-full bg-background text-foreground">
                <header className="flex items-center gap-3 p-3 border-b h-16 flex-shrink-0 bg-card/80 backdrop-blur-sm sticky top-0 z-10">
                    <Button onClick={() => router.back()} variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-xl font-bold">Profile not found</h1>
                </header>
                <div className="flex-1 flex items-center justify-center">
                    <p>User could not be found.</p>
                </div>
            </div>
        );
    }
    
    const totalLikes = userVideos.reduce((acc, video) => acc + video.likes, 0);

    return (
        <div className="flex flex-col h-full bg-background text-foreground">
            <header className="flex items-center gap-3 p-3 border-b h-16 flex-shrink-0 bg-card/80 backdrop-blur-sm sticky top-0 z-10">
                <Button onClick={() => router.back()} variant="ghost" size="icon">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-xl font-bold">{user.name}</h1>
            </header>

            <div className="flex-1 overflow-y-auto">
                <div className="p-4 space-y-6">
                    <div className="flex flex-col items-center space-y-4">
                        <Avatar className="h-24 w-24 border-4 border-primary">
                            <AvatarImage src={user.avatarUrl} alt={user.name} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <h2 className="text-2xl font-bold">@{user.name}</h2>
                         <Button>Follow</Button>
                    </div>

                    <div className="flex justify-around bg-muted/50 p-3 rounded-lg">
                        <div className="text-center">
                            <p className="text-xl font-bold">{userVideos.length}</p>
                            <p className="text-sm text-muted-foreground">Videos</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xl font-bold">{totalLikes.toLocaleString()}</p>
                            <p className="text-sm text-muted-foreground">Likes</p>
                        </div>
                    </div>
                </div>

                <div className="p-1">
                    <div className="flex items-center justify-center p-2 border-b">
                        <Grid3x3 className="h-6 w-6" />
                    </div>
                    <div className="grid grid-cols-3 gap-0.5">
                        {userVideos.map(video => (
                           <Link href="/view" key={video.id}>
                             <div className="relative aspect-square bg-muted overflow-hidden group">
                                <Image
                                    src={`https://placehold.co/300x300.png`} // Placeholder, as videos don't have thumbnails
                                    alt={video.caption}
                                    fill
                                    className="object-cover transition-transform group-hover:scale-105"
                                    data-ai-hint="video thumbnail"
                                />
                                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="flex items-center gap-2 text-white font-bold">
                                        <Heart className="h-5 w-5 fill-white"/>
                                        <span>{video.likes.toLocaleString()}</span>
                                    </div>
                                </div>
                             </div>
                           </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
