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
