
"use client"

import React, { useRef, useEffect, useState } from 'react';
import { videos as initialVideos, type Video, users, chats as initialChats, type Chat, type Message } from '@/lib/mock-data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Send, Music, Camera, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface Comment {
    id: string;
    user: { name: string; avatarUrl: string };
    text: string;
    timestamp: string;
}

const ShareDialog = ({
  open,
  onOpenChange,
  chats,
  onShare,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chats: Chat[];
  onShare: (selectedChatIds: string[]) => void;
}) => {
  const [selectedChats, setSelectedChats] = useState<string[]>([]);
  const { toast } = useToast();

  const handleSelectChat = (chatId: string) => {
    setSelectedChats(prev =>
      prev.includes(chatId)
        ? prev.filter(id => id !== chatId)
        : [...prev, chatId]
    );
  };

  const handleSend = () => {
    if (selectedChats.length === 0) {
        toast({
            variant: "destructive",
            title: "No selection",
            description: "Please select at least one chat to share with.",
        });
        return;
    }
    onShare(selectedChats);
    onOpenChange(false);
    setSelectedChats([]);
  }

  const getChatDisplayInfo = (chat: Chat) => {
    if (chat.type === 'group') {
      return {
        avatarUrl: chat.avatarUrl,
        name: chat.name,
      };
    } else {
      const otherUser = chat.members.find(member => member.id !== users[0].id);
      return {
        avatarUrl: otherUser?.avatarUrl,
        name: otherUser?.name || 'Unknown User',
      };
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="h-[70vh] flex flex-col p-0 rounded-2xl">
            <DialogHeader className="p-4 border-b">
                <DialogTitle>Share with...</DialogTitle>
                 <DialogDescription className="sr-only">Select chats to share the video with.</DialogDescription>
            </DialogHeader>
            <ScrollArea className="flex-1 px-4">
                <div className="space-y-2">
                    {chats.map(chat => {
                        const { name, avatarUrl } = getChatDisplayInfo(chat);
                        return (
                            <div key={chat.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-accent">
                               <Checkbox 
                                id={`chat-${chat.id}`} 
                                checked={selectedChats.includes(chat.id)}
                                onCheckedChange={() => handleSelectChat(chat.id)}
                               />
                               <Label htmlFor={`chat-${chat.id}`} className="flex-1 flex items-center gap-3 cursor-pointer">
                                 <Avatar className="h-10 w-10">
                                    <AvatarImage src={avatarUrl} data-ai-hint="avatar chat" />
                                    <AvatarFallback>{name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span className="font-medium">{name}</span>
                               </Label>
                            </div>
                        )
                    })}
                </div>
            </ScrollArea>
            <DialogFooter className="p-4 border-t">
                <Button onClick={handleSend} className="w-full" disabled={selectedChats.length === 0}>
                   <Send className="mr-2 h-4 w-4" /> Send
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
  )

}


const VideoCard = ({ 
    video, 
    onLike, 
    onComment,
    onShare,
}: { 
    video: Video, 
    onLike: (videoId: string) => void,
    onComment: (videoId: string, commentText: string) => void,
    onShare: (videoId: string, chatIds: string[]) => void,
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isLiked, setIsLiked] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [showShareDialog, setShowShareDialog] = useState(false);
    const [newComment, setNewComment] = useState("");
    const { toast } = useToast();

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        videoRef.current?.play().catch(error => console.error("Video play failed:", error));
                    } else {
                        videoRef.current?.pause();
                    }
                });
            },
            { threshold: 0.5 }
        );

        const currentVideoRef = videoRef.current;
        if (currentVideoRef) {
            observer.observe(currentVideoRef);
        }

        return () => {
            if (currentVideoRef) {
                observer.unobserve(currentVideoRef);
            }
        };
    }, []);

    const handleLike = () => {
        onLike(video.id);
        setIsLiked(!isLiked);
    };

    const handleCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newComment.trim()) {
            onComment(video.id, newComment);
            setNewComment("");
            toast({ title: "Comment posted!" });
        }
    };

    const handleShare = (selectedChatIds: string[]) => {
        onShare(video.id, selectedChatIds);
    }

    const handleExternalShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Check out this video!',
                    text: video.caption,
                    url: window.location.href, // Or a direct link to the video
                });
                toast({ title: 'Video shared successfully!' });
            } catch (error) {
                console.error('Error sharing:', error);
                toast({ variant: 'destructive', title: 'Could not share video.' });
            }
        } else {
            toast({ variant: 'destructive', title: 'Web Share API not supported in your browser.' });
        }
    };
    
    // Ensure comments is an array
    const comments = Array.isArray(video.commentsData) ? video.commentsData : [];

    return (
        <div className="h-full w-full snap-start flex-shrink-0 relative bg-black">
            <video
                ref={videoRef}
                src={video.videoUrl}
                loop
                muted
                playsInline
                className="h-full w-full object-cover"
                onClick={() => videoRef.current?.paused ? videoRef.current?.play() : videoRef.current?.pause()}
            ></video>
            
            <div className="absolute bottom-20 right-2 p-2 flex flex-col items-center space-y-4 z-10 text-white">
                 <Link href={`/profile/${video.user.id}`}>
                    <Avatar className="h-12 w-12 border-2 border-white">
                        <AvatarImage src={video.user.avatarUrl} data-ai-hint="avatar user"/>
                        <AvatarFallback>{video.user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                </Link>
                <Link href="/create">
                    <Button variant="ghost" size="icon" className="text-white hover:bg-transparent hover:text-white flex flex-col h-auto">
                        <Camera className="h-8 w-8" />
                    </Button>
                </Link>
                <Button variant="ghost" size="icon" className="text-white bg-transparent hover:bg-transparent focus:bg-transparent hover:text-white flex flex-col h-auto" onClick={handleLike}>
                    <Heart className={`h-8 w-8 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                    <span className="text-xs font-semibold">{video.likes.toLocaleString()}</span>
                </Button>
                <Button variant="ghost" size="icon" className="text-white hover:bg-transparent hover:text-white flex flex-col h-auto" onClick={() => setShowComments(true)}>
                    <MessageCircle className="h-8 w-8" />
                    <span className="text-xs font-semibold">{video.comments.toLocaleString()}</span>
                </Button>
                <Button variant="ghost" size="icon" className="text-white hover:bg-transparent hover:text-white flex flex-col h-auto" onClick={() => setShowShareDialog(true)}>
                    <Send className="h-8 w-8" />
                    <span className="text-xs font-semibold">{video.shares.toLocaleString()}</span>
                </Button>
                 <Button variant="ghost" size="icon" className="text-white hover:bg-transparent hover:text-white flex flex-col h-auto" onClick={handleExternalShare}>
                    <MoreHorizontal className="h-8 w-8" />
                </Button>
            </div>

            <div className="absolute bottom-20 left-0 p-4 bg-gradient-to-t from-black/50 to-transparent w-full text-white">
                <div className="flex items-end">
                    <div className="flex-1 space-y-1.5 pr-16">
                      <h3 className="font-bold text-base">@{video.user.name}</h3>
                        <p className="text-sm">{video.caption}</p>
                        <div className="flex items-center gap-2 text-sm">
                            <Music className="h-4 w-4" />
                            <p>Original Audio - {video.user.name}</p>
                        </div>
                    </div>
                </div>
            </div>

            <Dialog open={showComments} onOpenChange={setShowComments}>
                <DialogContent className="h-[80vh] flex flex-col p-0 rounded-2xl">
                    <DialogHeader className="p-4 border-b">
                        <DialogTitle className="text-center">Comments</DialogTitle>
                         <DialogDescription className="sr-only">A list of comments for the video.</DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="flex-1 p-4">
                        <div className="space-y-4">
                            {comments.length > 0 ? comments.map(comment => (
                                <div key={comment.id} className="flex items-start gap-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={comment.user.avatarUrl} data-ai-hint="avatar comment"/>
                                        <AvatarFallback>{comment.user.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <p className="font-semibold text-sm">{comment.user.name}</p>
                                        <p className="text-sm">{comment.text}</p>
                                        <p className="text-xs text-muted-foreground mt-1">{new Date(comment.timestamp).toLocaleTimeString()}</p>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-center text-muted-foreground py-8">No comments yet. Be the first to comment!</p>
                            )}
                        </div>
                    </ScrollArea>
                    <DialogFooter className="p-4 border-t">
                        <form onSubmit={handleCommentSubmit} className="w-full flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={users[0].avatarUrl} data-ai-hint="avatar current user"/>
                                <AvatarFallback>Y</AvatarFallback>
                            </Avatar>
                            <Input 
                                placeholder="Add a comment..." 
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                className="flex-1"
                            />
                            <Button type="submit" size="icon" disabled={!newComment.trim()}>
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <ShareDialog 
                open={showShareDialog}
                onOpenChange={setShowShareDialog}
                chats={initialChats}
                onShare={handleShare}
            />
        </div>
    );
};


export default function ViewPage() {
    const [videos, setVideos] = useState<Video[]>(initialVideos);
    const { toast } = useToast();

    const handleLike = (videoId: string) => {
        setVideos(prevVideos => prevVideos.map(v => {
            if (v.id === videoId) {
                // In a real app, you'd check if the user already liked it.
                // For this demo, we'll just increment.
                return { ...v, likes: v.likes + 1 };
            }
            return v;
        }));
    };

    const handleComment = (videoId: string, commentText: string) => {
        setVideos(prevVideos => prevVideos.map(v => {
            if (v.id === videoId) {
                const newComment: Comment = {
                    id: `comment-${Date.now()}`,
                    user: users[0],
                    text: commentText,
                    timestamp: new Date().toISOString()
                };
                 const existingComments = Array.isArray(v.commentsData) ? v.commentsData : [];
                return { 
                    ...v, 
                    comments: v.comments + 1,
                    commentsData: [...existingComments, newComment]
                };
            }
            return v;
        }));
    };

    const handleShare = (videoId: string, chatIds: string[]) => {
        setVideos(prevVideos => prevVideos.map(v => {
            if (v.id === videoId) {
                return { ...v, shares: v.shares + chatIds.length };
            }
            return v;
        }));

        toast({
            title: "Video Shared!",
            description: `Successfully shared the video to ${chatIds.length} chat(s).`
        })

        // Here you would typically also update the chat data in your backend/state management
        // to add the video as a message. This is omitted for simplicity in this mock UI.
        console.log("Sharing video", videoId, "to chats", chatIds);
    };

    return (
        <div className="h-full w-full bg-black snap-y snap-mandatory overflow-y-auto">
           {videos.map(video => (
               <div key={video.id} className="h-full w-full snap-start flex-shrink-0">
                   <VideoCard 
                        video={video} 
                        onLike={handleLike}
                        onComment={handleComment}
                        onShare={handleShare}
                    />
               </div>
           ))}
        </div>
    );
}
