export interface ActivityDisplayProps {
  id: string;
  coverUrl: string | null;
  title: string;
  publishedAt: Date | null;
  includeSessionTypes: ('offline' | 'online')[];
  participantsCount: {
    online: number;
    offline: number;
  };
  startedAt: Date | null;
  endedAt: Date | null;
  isPrivate: boolean;
  createdAt: Date | null;
}

export type FetchActivityDisplayProps = Pick<ActivityDisplayProps, 'id' | 'title' | 'coverUrl' | 'includeSessionTypes' | 'participantsCount' | 'isPrivate'> & {
  publishedAt: string | null;
  startedAt: string | null;
  endedAt: string | null;
  createdAt: string | null;
}

export type ActivityBasicCondition = {
  organizerId?: string | null;
  appId: string;
  scenario: 'holding' | 'finished' | 'draft' | 'privateHolding';
};

export interface FetchActivitiesResponse {
  activities: FetchActivityDisplayProps[];
  totalCount: number;
}

export interface ActivityCollectionState {
  activities: ActivityDisplayProps[];
  totalCount: number;
}
