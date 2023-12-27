import axios from "axios";
import { useState, useEffect, useCallback } from "react";
import {
  ActivityCollectionState,
  ActivityDisplayProps,
  FetchActivityDisplayProps,
  ActivityBasicCondition,
  FetchActivitiesResponse,
} from "./activitiyCollectionType";
import { useAuth } from "lodestar-app-element/src/contexts/AuthContext";

enum LoadingState {
  Idle,
  InitialLoading,
  LoadingMore,
  None,
}

const fetchActivitiesApi = (
  authToken: string | null,
  basicCondition: ActivityBasicCondition,
  categoryId: string | null,
  limit: number,
  offset: number,
) => {
  return axios
    .get<FetchActivitiesResponse>(
      `${process.env.REACT_APP_LODESTAR_SERVER_ENDPOINT}/activity/activity_collection`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        params: {
          basicCondition,
          categoryId,
          limit,
          offset,
        },
      },
    )
    .then((response) => {
      response.data.activities = response.data.activities || [];
      return response.data;
    });
};

const useActivityCollection = (
  basicCondition: ActivityBasicCondition,
  categoryId: string | null,
) => {
  const { authToken } = useAuth(); 
  const [activityCollection, setActivityCollection] =
    useState<ActivityCollectionState>({
      activities: [],
      totalCount: 0,
    });
  const [error, setError] = useState<Error | null>(null);
  const [currentTabActivityCount, setCurrentTabActivityCount] =
    useState<number>(0);
  const [offset, setOffset] = useState<number>(0);
  const [loadingState, setLoadingState] = useState<LoadingState>(
    LoadingState.Idle,
  );

  const limit = 20;

  const transformDate = (dateString: string | null): Date | null =>
    dateString ? new Date(dateString) : null;

  const transformActivity = (
    activity: FetchActivityDisplayProps,
  ): ActivityDisplayProps => ({
    ...activity,
    publishedAt: transformDate(activity.publishedAt),
    startedAt: transformDate(activity.startedAt),
    endedAt: transformDate(activity.endedAt),
    createdAt: transformDate(activity.createdAt),
  });

  useEffect(() => {
    setOffset(0);
    setLoadingState(LoadingState.InitialLoading);
  }, [basicCondition, categoryId]);

  const fetchActivities = useCallback(
    async (isLoadMoreCall = false, newOffset = 0) => {
      setLoadingState(
        isLoadMoreCall ? LoadingState.LoadingMore : LoadingState.InitialLoading,
      );

      try {
        const data = await fetchActivitiesApi(
          authToken,
          basicCondition,
          categoryId,
          limit,
          newOffset,
        );

        const tranformActivityData = data.activities.map(transformActivity);

        setActivityCollection((prevState) => {
          let updatedActivities;

          if (isLoadMoreCall) {
            const combinedActivities = [
              ...prevState.activities,
              ...tranformActivityData,
            ];
            updatedActivities = Array.from(
              new Map(
                combinedActivities.map((activity) => [activity.id, activity]),
              ).values(),
            ) as ActivityDisplayProps[];
          } else {
            updatedActivities = tranformActivityData;
          }

          updatedActivities.sort((a, b) => {
            const timeA = a.createdAt
              ? new Date(a.createdAt).getTime()
              : Number.MAX_SAFE_INTEGER;
            const timeB = b.createdAt
              ? new Date(b.createdAt).getTime()
              : Number.MAX_SAFE_INTEGER;
            return timeB - timeA;
          });

          return {
            activities: updatedActivities,
            totalCount: data.totalCount,
          };
        });

        if (!isLoadMoreCall && !categoryId) {
          setCurrentTabActivityCount(data.totalCount);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred"),
        );
      } finally {
        setLoadingState(LoadingState.Idle);
      }
    },
    [basicCondition, categoryId, offset, limit],
  );

  useEffect(() => {
    if (
      loadingState === LoadingState.InitialLoading ||
      loadingState === LoadingState.Idle
    ) {
      fetchActivities()
        .catch((error) => {
          setError(
            error instanceof Error
              ? error
              : new Error("An unknown error occurred"),
          );
        })
        .finally(() => {
          setLoadingState(LoadingState.Idle);
        });
    }
  }, [basicCondition, categoryId, offset, limit, fetchActivities]);

  const loadMoreActivities =
    activityCollection.activities.length !== activityCollection.totalCount
      ? () => {
          return new Promise<void>((resolve, reject) => {
            const newOffset = offset + limit;
            setLoadingState(LoadingState.LoadingMore);
            setOffset(newOffset);
            fetchActivities(true, newOffset)
              .then(() => {
                resolve();
              })
              .catch((error) => {
                setError(
                  error instanceof Error
                    ? error
                    : new Error("An unknown error occurred"),
                );
                reject(error);
              })
              .finally(() => {
                setLoadingState(LoadingState.Idle);
              });
          });
        }
      : undefined;

  return {
    loadingActivities: loadingState === LoadingState.InitialLoading,
    errorActivities: error,
    activities: activityCollection.activities,
    currentTabActivityCount,
    loadMoreActivities,
  };
};

export default useActivityCollection;
