export interface User {
  id: string;
  name: string;
  avatarUrl: string;
  isOnline?: boolean;
}

export interface Reaction {
  emoji: string;
  user: User;
}

export interface Message {
  id: string;
  sender: User;
  content: string;
  timestamp: string;
  reactions?: Reaction[];
  quotedMessage?: Message;
}

export interface Chat {
  id: string;
  type: 'private' | 'group';
  name: string;
  avatarUrl?: string; // For group chats
  members: User[];
  messages: Message[];
}

export interface Status {
  id: string;
  user: User;
  imageUrl: string;
  timestamp: string;
  caption: string;
}

export interface Call {
  id: string;
  user: User;
  type: 'incoming' | 'outgoing' | 'missed';
  timestamp: string;
  duration: string;
}

export interface Video {
  id: string;
  user: User;
  videoUrl: string;
  caption: string;
  likes: number;
  comments: number;
  shares: number;
}
