import axios from 'axios';
import { useState, useEffect, useCallback } from 'react';
import { ActivityAdminProps } from '../../types/activity';

interface ActivityDisplayProps {
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
}

type FetchActivityDisplayProps = Pick<ActivityDisplayProps, 'id' | 'title' | 'coverUrl' | 'includeSessionTypes' | 'participantsCount' | 'isPrivate'> & {
  publishedAt: string | null;
  startedAt: string | null;
  endedAt: string | null;
}

type ActivityBasicCondition = {
  organizerId?: string | null;
  isPrivate?: boolean;
  publishedAtNotNull?: boolean;
  activityEndedAfterNow?: boolean;
  appId: string;
};

interface FetchActivitiesResponse {
  activities: FetchActivityDisplayProps[];
  totalCount: number;
}

const fetchActivitiesApi = (
  basicCondition: ActivityBasicCondition, 
  categoryId: string | null, 
  limit: number, 
  offset: number
) => {
  return axios.post<FetchActivitiesResponse>('https://175d-143-244-40-17.ngrok-free.app/activity_collection', {
    basicCondition,
    categoryId,
    limit,
    offset,
  }).then(response => {
    response.data.activities = response.data.activities || [];
    return response.data;
  });
};

const useActivityCollection = (basicCondition: ActivityBasicCondition, categoryId: string | null) => {
  const [activities, setActivities] = useState<ActivityDisplayProps[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [currentTabActivityCount, setCurrentTabActivityCount] = useState<number>(0);
  const [offset, setOffset] = useState<number>(0);

  const limit = 20;

  const transformDate = (dateString: string | null): Date | null => 
  dateString ? new Date(dateString) : null;

  const transformActivity = (activity: FetchActivityDisplayProps): ActivityDisplayProps => ({
      ...activity,
      publishedAt: transformDate(activity.publishedAt),
      startedAt: transformDate(activity.startedAt),
      endedAt: transformDate(activity.endedAt)
  })


  const fetchActivities = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchActivitiesApi(basicCondition, categoryId, limit, offset);

      const tranformActivityData = data.activities.map(transformActivity)

      setActivities(prevActivities => {

        const combinedActivities = [...prevActivities, ...tranformActivityData];

        const uniqueActivities = Array.from(new Set(combinedActivities.map(a => a.id)))
        .map(id => combinedActivities.find(a => a.id === id))
        .filter(a => a !== undefined) as ActivityDisplayProps[];
      
        return uniqueActivities;
      });
      setCurrentTabActivityCount(data.totalCount);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
    } finally {
      setLoading(false);
    }
  }, [basicCondition, categoryId, offset, limit]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const loadMoreActivities = useCallback(() => {
    setOffset(prevOffset => prevOffset + limit);
  }, [limit]);

  return { loadingActivities: loading, errorActivities: error, activities, currentTabActivityCount, loadMoreActivities };
};

export default useActivityCollection;
