export enum IssueStatus {
  NEW = 'New',
  IN_PROGRESS = 'In Progress',
  CUSTOMS = 'At Customs',
  DELIVERY = 'Delivery',
  DONE = 'Done',
  STUCK = 'Stuck'
}

export interface ResponsiblePerson {
  id: string;
  name: string;
  avatar: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  status: IssueStatus;
  createdAt: string; // ISO Date string
  updatedAt: string; // ISO Date string
  responsibleId: string;
  aiAnalysis?: string;
}

export const MOCK_PEOPLE: ResponsiblePerson[] = [
  { id: '1', name: 'Alexander Ivanov', avatar: 'https://picsum.photos/id/1005/50/50' },
  { id: '2', name: 'Elena Petrova', avatar: 'https://picsum.photos/id/1011/50/50' },
  { id: '3', name: 'Dmitry Smirnov', avatar: 'https://picsum.photos/id/1012/50/50' },
  { id: '4', name: 'Maria Sidorova', avatar: 'https://picsum.photos/id/1025/50/50' },
];
