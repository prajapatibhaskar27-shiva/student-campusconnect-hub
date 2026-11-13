import {
  CampusEvent,
  CommunityPost,
  EventRegistration,
  ResourceItem,
  StudentProfile,
  StudyNote,
  TaskItem,
} from '../types';
import { getOffsetDateIso, getTodayIso } from '../utils/taskUrgency';

export const SEED_PROFILE: StudentProfile = {
  name: 'Aarav Sharma',
  course: 'B.Tech CSE · Artificial Intelligence',
  semester: 'Semester 5',
  email: 'aarav.sharma@campus.edu',
};

export const SEED_EVENTS: CampusEvent[] = [
  {
    id: 1,
    title: 'Buildathon 2026',
    category: 'Hackathon',
    date: '2026-11-21',
    time: '10:00 AM',
    place: 'Innovation Lab, Block B',
    description:
      'A 24-hour student engineering sprint to ship working software and hardware prototypes for real campus problems.',
    spotsLabel: '18 seats left',
    capacity: 120,
    registeredCount: 102,
    prizeOrTrack: 'Campus Automation · AI Tools · Open Web',
  },
  {
    id: 2,
    title: 'Applied AI & Evaluation Workshop',
    category: 'Workshop',
    date: '2026-11-25',
    time: '02:00 PM',
    place: 'Seminar Hall 2',
    description:
      'Hands-on session covering structured outputs, vector retrieval, and practical model evaluation workflows.',
    spotsLabel: 'Open registration',
    capacity: 80,
    registeredCount: 54,
    prizeOrTrack: 'Bring laptop · Python 3.11+',
  },
  {
    id: 3,
    title: 'Designing Your Tech Career',
    category: 'Talk',
    date: '2026-11-28',
    time: '11:30 AM',
    place: 'Main Auditorium',
    description:
      'Alumni engineers share portfolio teardowns, internship preparation strategies, and early-career lessons.',
    spotsLabel: 'Open registration',
    capacity: 220,
    registeredCount: 164,
    prizeOrTrack: 'Q&A + Resume Clinic',
  },
  {
    id: 4,
    title: 'Community Code Night',
    category: 'Community',
    date: '2026-12-02',
    time: '05:00 PM',
    place: 'CS Commons Lab',
    description:
      'Bring a side project, debug with peers, and demo what you built in a casual two-hour evening session.',
    spotsLabel: 'Bring your laptop',
    capacity: 60,
    registeredCount: 39,
    prizeOrTrack: 'Open Peer Demos',
  },
  {
    id: 5,
    title: 'Frontend Architecture Sprint',
    category: 'Workshop',
    date: '2026-12-06',
    time: '12:00 PM',
    place: 'Design Studio 104',
    description:
      'Build accessible component systems, responsive dashboards, and smooth micro-interactions in a guided 3-hour sprint.',
    spotsLabel: '12 seats left',
    capacity: 45,
    registeredCount: 33,
    prizeOrTrack: 'TypeScript + Tailwind',
  },
  {
    id: 6,
    title: 'Campus Innovation Fest',
    category: 'Hackathon',
    date: '2026-12-12',
    time: '09:00 AM',
    place: 'Central Pavilion',
    description:
      'Inter-departmental showcase for student-led research, sustainability prototypes, and developer tooling.',
    spotsLabel: 'Team entries open',
    capacity: 150,
    registeredCount: 88,
    prizeOrTrack: 'Hardware · EdTech · Sustainability',
  },
];

export const SEED_REGISTRATIONS: EventRegistration[] = [
  {
    eventId: 1,
    attendeeName: 'Aarav Sharma',
    email: 'aarav.sharma@campus.edu',
    mode: 'Team',
    teamName: 'NodeRunners',
    track: 'Campus Automation',
    registeredAt: '2026-11-10',
    ticketCode: 'CC-26-841B',
  },
];

export function createStarterTasks(): TaskItem[] {
  return [
    {
      id: 101,
      text: 'Finalize Buildathon API contract and pitch deck',
      course: 'Buildathon 2026',
      priority: 'High',
      due: getOffsetDateIso(3),
      done: false,
    },
    {
      id: 102,
      text: 'Submit HCI usability heuristic evaluation report',
      course: 'CS314',
      priority: 'Medium',
      due: getTodayIso(),
      done: false,
    },
    {
      id: 103,
      text: 'Complete 20 minutes of TypeScript generics practice',
      course: 'Self Study',
      priority: 'Low',
      due: getTodayIso(),
      done: true,
    },
  ];
}

export const SEED_TASKS: TaskItem[] = createStarterTasks();

export const SEED_NOTES: StudyNote[] = [
  {
    id: 201,
    title: 'Raft Consensus — Leader Election & Log Replication',
    subject: 'CS301 · Distributed Systems',
    content:
      'Key invariants: Election Safety (at most one leader per term), Leader Append-Only, Log Matching, and Leader Completeness. Randomized election timeouts (150ms–300ms) prevent split votes.',
    updatedAt: 'Today, 09:40 AM',
    pinned: true,
  },
];

export const SEED_RESOURCES: ResourceItem[] = [
  {
    id: 300,
    title: 'Campus Engineering Starter Kit',
    topic: 'Development',
    description: 'Curated campus templates, TypeScript lint presets, and hackathon pitch deck guidelines.',
    url: 'https://github.com/skills',
    format: 'Campus Guide',
  },
  {
    id: 301,
    title: 'MDN Web Docs',
    topic: 'Development',
    description: 'Authoritative reference for HTML, CSS, JavaScript, and modern Web APIs.',
    url: 'https://developer.mozilla.org/',
    format: 'Documentation',
  },
  {
    id: 302,
    title: 'JavaScript.info',
    topic: 'Development',
    description: 'Deep, practical chapters covering browser internals, async patterns, and DOM.',
    url: 'https://javascript.info/',
    format: 'Interactive Guide',
  },
  {
    id: 304,
    title: 'Google AI Education',
    topic: 'AI & Data',
    description: 'Foundational machine learning crash courses, responsible AI guides, and labs.',
    url: 'https://ai.google/education/',
    format: 'Course Pathway',
  },
  {
    id: 305,
    title: 'Kaggle Learn',
    topic: 'AI & Data',
    description: 'Focused micro-courses in Python, Pandas, SQL, and neural network evaluation.',
    url: 'https://www.kaggle.com/learn',
    format: 'Notebooks',
  },
  {
    id: 306,
    title: 'Figma Learn',
    topic: 'Design',
    description: 'Component architecture, auto-layout systems, and interactive prototyping.',
    url: 'https://help.figma.com/hc/en-us/categories/360002051613-Learn-design',
    format: 'Design Guide',
  },
  {
    id: 307,
    title: 'GitHub Skills',
    topic: 'Career',
    description: 'Hands-on repository workflows, pull requests, actions, and release hygiene.',
    url: 'https://skills.github.com/',
    format: 'Interactive Repo',
  },
  {
    id: 308,
    title: 'Google Career Certificates',
    topic: 'Career',
    description: 'Structured career readiness tracks in software, UX design, and data analytics.',
    url: 'https://grow.google/certificates/',
    format: 'Certification',
  },
];

export const SEED_POSTS: CommunityPost[] = [
  {
    id: 401,
    name: 'Meera Nair',
    course: 'CSE · Semester 5',
    topic: 'Team Search',
    text: 'Looking for a frontend or product designer for Buildathon 2026! We already have backend + ML covered and want to build an accessibility-first campus navigator.',
    time: '2 hours ago',
    likes: 7,
    replies: [
      {
        id: 1,
        author: 'Rohan Verma',
        content: 'Count me in for UI architecture and Figma prototyping — sent you a note!',
        time: '1 hour ago',
      },
    ],
  },
  {
    id: 402,
    name: 'Ananya Iyer',
    course: 'AI & Data · Semester 7',
    topic: 'Study Group',
    text: 'Hosting a Distributed Systems midterm prep table at the Library Quiet Mezzanine tomorrow at 4:30 PM. Bring Raft and Lamport clock questions!',
    time: 'Yesterday',
    likes: 5,
    replies: [],
  },
];

export const WEEKLY_STUDY_DATA = [
  { label: 'Mon', hours: 3.2, tasks: 2 },
  { label: 'Tue', hours: 4.5, tasks: 3 },
  { label: 'Wed', hours: 2.8, tasks: 1 },
  { label: 'Thu', hours: 6.1, tasks: 4 },
  { label: 'Fri', hours: 5.4, tasks: 3 },
  { label: 'Sat', hours: 4.0, tasks: 2 },
  { label: 'Sun', hours: 3.6, tasks: 2 },
];

export const SEMESTER_ACTIVITY_DATA = [
  { label: 'Aug', hours: 42, tasks: 14 },
  { label: 'Sep', hours: 58, tasks: 21 },
  { label: 'Oct', hours: 74, tasks: 28 },
  { label: 'Nov', hours: 65, tasks: 24 },
  { label: 'Dec', hours: 31, tasks: 11 },
];
