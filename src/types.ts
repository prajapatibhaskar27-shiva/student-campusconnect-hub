export type SectionId = 'overview' | 'events' | 'tasks' | 'resources' | 'community';

export type EventCategory = 'Hackathon' | 'Workshop' | 'Talk' | 'Community';

export interface CampusEvent {
  id: number;
  title: string;
  category: EventCategory;
  date: string; // YYYY-MM-DD
  time: string;
  place: string;
  description: string;
  spotsLabel: string;
  capacity: number;
  registeredCount: number;
  prizeOrTrack?: string;
}

export interface EventRegistration {
  eventId: number;
  attendeeName: string;
  email: string;
  mode: 'Solo' | 'Team';
  teamName: string;
  track: string;
  registeredAt: string;
  ticketCode: string;
}

export type TaskPriority = 'High' | 'Medium' | 'Low';

export interface TaskItem {
  id: number;
  text: string;
  course: string;
  priority: TaskPriority;
  due: string; // YYYY-MM-DD or ''
  done: boolean;
}

export type ResourceTopic = 'Development' | 'AI & Data' | 'Design' | 'Career';

export interface ResourceItem {
  id: number;
  title: string;
  topic: ResourceTopic;
  description: string;
  url: string;
  format: string;
}

export interface StudyNote {
  id: number;
  title: string;
  subject: string;
  content: string;
  updatedAt: string;
  pinned: boolean;
}

export interface PostReply {
  id: number;
  author: string;
  content: string;
  time: string;
}

export interface CommunityPost {
  id: number;
  name: string;
  course: string;
  topic: 'General' | 'Team Search' | 'Project Showcase' | 'Study Group';
  text: string;
  time: string;
  likes: number;
  replies: PostReply[];
}

export interface StudentProfile {
  name: string;
  course: string;
  semester: string;
  email: string;
}
