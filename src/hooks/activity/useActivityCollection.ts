import axios from 'axios';
import { useState, useEffect, useCallback } from 'react';
enum LoadingState {
  Idle,
  InitialLoading,
  LoadingMore,
  None
}
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
  createdAt: Date | null
}

type FetchActivityDisplayProps = Pick<ActivityDisplayProps, 'id' | 'title' | 'coverUrl' | 'includeSessionTypes' | 'participantsCount' | 'isPrivate'> & {
  publishedAt: string | null;
  startedAt: string | null;
  endedAt: string | null;
  createdAt: string | null
}

type ActivityBasicCondition = {
  organizerId?: string | null;
  appId: string;
  scenario: 'holding' | 'finished' | 'draft' | 'privateHolding';
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
  return axios.get<FetchActivitiesResponse>(`${process.env.REACT_APP_LODESTAR_SERVER_ENDPOINT}/activity/activity_collection`, {
    params: {
      basicCondition,
      categoryId,
      limit,
      offset,
    }
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
  const [isLoadMore, setIsLoadMore] = useState<boolean>(false);
  const [showLoadMoreButton , setShowLoadMoreButton] = useState<boolean>(false)
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true); // 新添加的状态变量
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.Idle);

  const limit = 20;

  const transformDate = (dateString: string | null): Date | null => 
  dateString ? new Date(dateString) : null;

  const transformActivity = (activity: FetchActivityDisplayProps): ActivityDisplayProps => ({
      ...activity,
      publishedAt: transformDate(activity.publishedAt),
      startedAt: transformDate(activity.startedAt),
      endedAt: transformDate(activity.endedAt),
      createdAt: transformDate(activity.createdAt),
  })

  useEffect(() => {
    setOffset(0);
    setLoadingState(LoadingState.InitialLoading);
  }, [basicCondition, categoryId]);


  const fetchActivities = useCallback(async (isLoadMoreCall = false, newOffset = 0) => {
    console.log("#R########2")
    console.log(limit, newOffset)
    try {
      const data = await fetchActivitiesApi(basicCondition, categoryId, limit, newOffset);

      console.log('tranformActivityData', data )

      const tranformActivityData = data.activities.map(transformActivity)
    

      setActivities(prevActivities => {
        let updatedActivities;
      
        if (isLoadMoreCall) {
          const combinedActivities = [...prevActivities, ...tranformActivityData];
          updatedActivities = Array.from(new Set(combinedActivities.map(a => a.id)))
            .map(id => combinedActivities.find(a => a.id === id))
            .filter(a => a !== undefined) as ActivityDisplayProps[];
        } else {
          updatedActivities = tranformActivityData;
        }
      
        updatedActivities.sort((a, b) => {
          const timeA = a.createdAt ? new Date(a.createdAt).getTime() : Number.MAX_SAFE_INTEGER;
          const timeB = b.createdAt ? new Date(b.createdAt).getTime() : Number.MAX_SAFE_INTEGER;
          return timeB - timeA;
        });

        setShowLoadMoreButton(updatedActivities.length !== data.totalCount);
      
        return updatedActivities;
      });
      
      if (!isLoadMore && !categoryId) {
        setCurrentTabActivityCount(() => {
          console.log(data.totalCount)
          return data.totalCount
        });
      }
  
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
    } finally {
      setLoading(false);
      setIsLoadMore(false);
    }
  }, [basicCondition, categoryId, offset, limit]);

  useEffect(() => {
    if ((loadingState === LoadingState.InitialLoading)|| (loadingState === LoadingState.Idle)) {
      setLoading(true);
      fetchActivities()
        .then(() => setLoading(false))
        .catch(error => {
          setError(error instanceof Error ? error : new Error('An unknown error occurred'));
          setLoading(false);
          setIsLoadMore(false);
        });
    }
  }, [basicCondition, categoryId, offset, limit]);

  const loadMoreActivities = showLoadMoreButton ? () => {
    return new Promise<void>((resolve, reject) => {
      const newOffset = offset + limit;
      setIsLoadMore(true);
      setLoadingState(LoadingState.LoadingMore);
      setOffset(newOffset);
      fetchActivities(true, newOffset) 
        .then(() => {
          setIsLoadMore(false);
          resolve();
        })
        .catch(error => {
          setError(error instanceof Error ? error : new Error('An unknown error occurred'));
          setIsLoadMore(false);
          reject(error);
        });
    });
  } : undefined;

  return { 
    loadingActivities: loading, 
    errorActivities: error, 
    activities, 
    currentTabActivityCount, 
    loadMoreActivities ,
    showLoadMoreButton

  };
};

export default useActivityCollection;
