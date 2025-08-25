import type { User, Chat, Message, Status, Call } from './types';

export const users: User[] = [
  { id: 'user-1', name: 'You', avatarUrl: 'https://placehold.co/100x100.png', isOnline: true },
  { id: 'user-2', name: 'Alice', avatarUrl: 'https://placehold.co/100x100.png', isOnline: false },
  { id: 'user-3', name: 'Bob', avatarUrl: 'https://placehold.co/100x100.png', isOnline: true },
  { id: 'user-4', name: 'Charlie', avatarUrl: 'https://placehold.co/100x100.png', isOnline: true },
  { id: 'user-5', name: 'David', avatarUrl: 'https://placehold.co/100x100.png', isOnline: false },
];

const messages: Message[] = [
    {
      id: 'msg-1',
      sender: users[1],
      content: 'Hey, how is the project going?',
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      reactions: [],
    },
    {
      id: 'msg-2',
      sender: users[0],
      content: 'It\'s going well! Almost done with the UI part.',
      timestamp: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
      reactions: [{ emoji: '👍', user: users[1] }],
    },
    {
      id: 'msg-3',
      sender: users[1],
      content: 'Great to hear! Let me know if you need any help.',
      timestamp: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
      reactions: [],
    },
     {
      id: 'msg-4',
      sender: users[0],
      content: 'Sure, thanks!',
      timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
      reactions: [],
      quotedMessage: {
        id: 'msg-3',
        sender: users[1],
        content: 'Great to hear! Let me know if you need any help.',
        timestamp: new Date(Date.now() - 1000 * 60 * 3).toISOString()
      }
    },
  ];

const groupMessages: Message[] = [
    {
        id: 'g-msg-1',
        sender: users[2],
        content: 'Hey team, meeting at 3 PM today.',
        timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
        reactions: [],
    },
    {
        id: 'g-msg-2',
        sender: users[3],
        content: 'Got it. Will be there.',
        timestamp: new Date(Date.now() - 1000 * 60 * 19).toISOString(),
        reactions: [],
    },
    {
        id: 'g-msg-3',
        sender: users[0],
        content: 'I might be 5 minutes late, finishing up a task.',
        timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
        reactions: [{ emoji: '👍', user: users[2] }],
    },
];

export const chats: Chat[] = [
  {
    id: 'chat-1',
    type: 'private',
    name: 'Alice',
    members: [users[0], users[1]],
    messages: messages,
  },
  {
    id: 'chat-2',
    type: 'group',
    name: 'Project Team',
    avatarUrl: 'https://placehold.co/100x100.png',
    members: [users[0], users[2], users[3]],
    messages: groupMessages,
  },
  {
    id: 'chat-3',
    type: 'private',
    name: 'David',
    members: [users[0], users[4]],
    messages: [
        {
            id: 'd-msg-1',
            sender: users[4],
            content: 'Can you check the latest designs?',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
            reactions: [],
        },
    ],
  },
  {
    id: 'chat-4',
    type: 'private',
    name: 'Bob',
    members: [users[0], users[2]],
    messages: [
        {
            id: 'b-msg-1',
            sender: users[2],
            content: 'Weekend plans?',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
            reactions: [],
        }
    ]
  }
];

export const statuses: Status[] = [
  {
    id: 'status-1',
    user: users[1],
    imageUrl: 'https://placehold.co/1080x1920.png',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    caption: 'Beautiful sunset today!',
  },
  {
    id: 'status-2',
    user: users[2],
    imageUrl: 'https://placehold.co/1080x1920.png',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    caption: 'Coding on a Saturday night.',
  },
  {
    id: 'status-3',
    user: users[3],
    imageUrl: 'https://placehold.co/1080x1920.png',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    caption: 'Exploring the city.',
  }
];

export const calls: Call[] = [
  {
    id: 'call-1',
    user: users[2],
    type: 'incoming',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    duration: '5m 23s',
  },
  {
    id: 'call-2',
    user: users[4],
    type: 'outgoing',
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    duration: '12m 45s',
  },
  {
    id: 'call-3',
    user: users[3],
    type: 'missed',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    duration: '0m 0s',
  },
    {
    id: 'call-4',
    user: users[1],
    type: 'incoming',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString(),
    duration: '2m 10s',
  },
];
