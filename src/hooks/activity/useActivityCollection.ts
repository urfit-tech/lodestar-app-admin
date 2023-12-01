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

interface BasicCondition {
}

interface FetchActivitiesResponse {
  activities: ActivityAdminProps[];
  totalCount: number;
}

const fetchActivitiesApi = async (
  basicCondition: BasicCondition,
  categoryId: string | null,
  limit: number,
  offset: number
): Promise<FetchActivitiesResponse> => {
  try {
    const response = await axios.post<FetchActivitiesResponse>('http://localhost:3000/activity_collection', {
      basicCondition,
      categoryId,
      limit,
      offset,
    });
    console.log(response.data)
    return response.data;
  } catch (error) {
    console.error('Error fetching activities:', error);
    throw error;
  }
};

const useActivityCollection = (
  basicCondition: BasicCondition,
  categoryId: string | null
) => {
  const [activities, setActivities] = useState<ActivityDisplayProps[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [currentTabActivityCount, setCurrentTabActivityCount] = useState<number>(0);
  const [offset, setOffset] = useState<number>(0);

  const limit = 20;

  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchActivitiesApi(basicCondition, categoryId, limit, offset);
      const transformedActivities = data.activities.map(activity => {
        const onlineCount = activity.tickets.reduce((acc, ticket) => acc + (ticket.enrollmentsCount ?? 0), 0);
        const offlineCount = activity.sessions.reduce((acc, session) => acc + (session.enrollmentsCount.offline ?? 0), 0);
        const includeSessionTypes = activity.sessions.flatMap(session => 
          session.location ? ['offline'] : (session.onlineLink ? ['online'] : [])
        ).filter((v, i, a) => a.indexOf(v) === i);
      
        return {
          id: activity.id,
          coverUrl: activity.coverUrl || null,
          title: activity.title || '',
          publishedAt: activity.publishedAt ? new Date(activity.publishedAt) : null,
          isPrivate: activity.isPrivate !== undefined ? activity.isPrivate : false, 
          participantsCount: {
            online: onlineCount,
            offline: offlineCount
          },
          includeSessionTypes: includeSessionTypes as ('offline' | 'online')[],
          startedAt: activity.sessions.length > 0 ? new Date(activity.sessions[0].startedAt) : null,
          endedAt: activity.sessions.length > 0 ? new Date(activity.sessions[0].endedAt) : null,
        };
      });
      setActivities(prevActivities => {
        const updatedActivities = [...prevActivities, ...transformedActivities];
      
        const activitiesMap = new Map();
        for (const activity of updatedActivities) {
          activitiesMap.set(activity.id, activity);
        }
      
        return Array.from(activitiesMap.values());
      });
      setCurrentTabActivityCount(data.totalCount);
    } catch (err) {
      if (err instanceof Error) {
        setError(err); 
      } else {
        setError(new Error('An unknown error occurred'));
      }
    } finally {
      setLoading(false);
    }
  }, [categoryId, offset, limit]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const loadMoreActivities = () => {
    setOffset(prevOffset => prevOffset + limit);
  };

  return {
    loadingActivities: loading,
    errorActivities: error,
    activities,
    currentTabActivityCount,
    loadMoreActivities,
  };
};

export default useActivityCollection;
