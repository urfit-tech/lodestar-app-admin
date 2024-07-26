import { gql, useMutation, useQuery, useSubscription } from '@apollo/client'
import { Announcement } from '../types/announcement'
import hasura from '../hasura'
import dayjs from 'dayjs'
import { PeriodType } from '../types/general'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import { useMemo } from 'react'

export const useMemberAnnouncements = () => {
  const { authToken } = useAuth()
  const path = window.location.pathname
  const { currentMemberId } = useAuth()
  const { data, loading, error } = useSubscription<
    hasura.SubscribeMemberAnnouncement,
    hasura.SubscribeMemberAnnouncementVariables
  >(SubscribeMemberAnnouncement, {
    variables: { memberId: currentMemberId || '' },
    skip: !currentMemberId || !authToken,
  })

  const [upsertMemberAnnouncementStatus, { loading: upsertMemberAnnouncementStatusLoading }] = useMutation<
    hasura.UpsertMemberAnnouncementStatus,
    hasura.UpsertMemberAnnouncementStatusVariables
  >(UpsertMemberAnnouncementStatus)

  const announcements: Announcement[] = data?.announcement
  .filter(announcement => {
    const includesPath = announcement.announcement_pages.some(page => {
      const containsWildcard = (path: string) => path.includes('*');

      const matchesWildcardPattern = (currentPath: string, pattern: string) => {
        const regexPattern = new RegExp(`^.*${pattern.replace(/\*/g, '.*')}$`);
        return regexPattern.test(currentPath);
      };

      const matchesExactPath = (currentPath: string, exactPath: string) => {
        const pathWithoutAdmin = currentPath.replace(/^\/admin/, '');
        return pathWithoutAdmin === exactPath;
      };

      const pagePath = page.path;

      if (containsWildcard(pagePath)) {
        return matchesWildcardPattern(path, pagePath);
      }
      return matchesExactPath(path, pagePath);
    });

    return announcement.is_universal_display === true || includesPath;
  })
  .map(announcement => ({
    id: announcement.id,
    appId: announcement.app_id,
    title: announcement.title,
    content: announcement.content || '',
    remindPeriodType: (announcement.remind_period_type as PeriodType) || 'D', // Default to 24 hours
    remindPeriodAmount: announcement.remind_period_amount || 1, // Default to 24 hours
    startedAt: announcement.started_at ? dayjs(announcement.started_at).toDate() : null,
    endedAt: announcement.ended_at ? dayjs(announcement.ended_at).toDate() : null,
    publishedAt: announcement.published_at ? dayjs(announcement.published_at).toDate() : null,
    isUniversalDisplay: announcement.is_universal_display,
    createdAt: dayjs(announcement.created_at).toDate(),
    updatedAt: dayjs(announcement.updated_at).toDate(),
    announcementPages: announcement.announcement_pages.map(page => ({
      id: page.id,
      announcementId: page.announcement_id,
      path: page.path,
      createdAt: dayjs(page.created_at).toDate(),
      updatedAt: dayjs(page.updated_at).toDate(),
    })),
    memberAnnouncementStatus: announcement.member_announcement_status.map(status => ({
      id: status.id,
      announcementId: status.announcement_id,
      memberId: status.member_id,
      readAt: status.read_at ? dayjs(status.read_at).toDate() : null,
      remindAt: status.remind_at ? dayjs(status.remind_at).toDate() : null,
      isDismissed: status.is_dismissed,
      createdAt: dayjs(status.created_at).toDate(),
      updatedAt: dayjs(status.updated_at).toDate(),
    })),
  })) || [];


  return {
    loading,
    error,
    announcements,
    upsertMemberAnnouncementStatus,
    upsertMemberAnnouncementStatusLoading,
  }
}

export const useAnnouncements = () => {
  const { data, loading, error } = useQuery<hasura.GetAllAnnouncement>(GetAllAnnouncement)

  const announcements: Announcement[] =
    data?.announcement.map(announcement => ({
      id: announcement.id,
      appId: announcement.app_id,
      title: announcement.title,
      content: announcement.content || '',
      remindPeriodType: (announcement.remind_period_type as PeriodType) || 'D', // Default to 24 hours
      remindPeriodAmount: announcement.remind_period_amount || 1, // Default to 24 hours
      startedAt: announcement.started_at ? dayjs(announcement.started_at).toDate() : null,
      endedAt: announcement.ended_at ? dayjs(announcement.ended_at).toDate() : null,
      publishedAt: announcement.published_at ? dayjs(announcement.published_at).toDate() : null,
      isUniversalDisplay: announcement.is_universal_display,
      createdAt: dayjs(announcement.created_at).toDate(),
      updatedAt: dayjs(announcement.updated_at).toDate(),
      announcementPages: announcement.announcement_pages.map(page => ({
        id: page.id,
        announcementId: page.announcement_id,
        path: page.path,
        createdAt: dayjs(page.created_at).toDate(),
        updatedAt: dayjs(page.updated_at).toDate(),
      })),
      memberAnnouncementStatus: announcement.member_announcement_status.map(status => ({
        id: status.id,
        announcementId: status.announcement_id,
        memberId: status.member_id,
        readAt: status.read_at ? dayjs(status.read_at).toDate() : null,
        remindAt: status.remind_at ? dayjs(status.remind_at).toDate() : null,
        isDismissed: status.is_dismissed,
        createdAt: dayjs(status.created_at).toDate(),
        updatedAt: dayjs(status.updated_at).toDate(),
      })),
    })) || []

  const [insertAnnouncements, { loading: insertAnnouncementsLoading }] = useMutation<
    hasura.InsertAnnouncements,
    hasura.InsertAnnouncementsVariables
  >(InsertAnnouncements)

  return {
    loading,
    error,
    announcements,
    insertAnnouncements,
    insertAnnouncementsLoading,
  }
}

export const useAnnouncement = (announcementId: string) => {
  const { authToken } = useAuth()

  const { data, loading, error, refetch } = useQuery<hasura.GetAnnouncementById, hasura.GetAnnouncementByIdVariables>(
    GetAnnouncementById,
    { variables: { id: announcementId }, skip: !announcementId || !authToken },
  )

  const announcement: Announcement | null = useMemo(() => {
    if (loading || error || !data || !data?.announcement_by_pk) {
      return null
    }

    const a = data.announcement_by_pk
    return {
      id: a.id,
      appId: a.app_id,
      title: a.title,
      content: a.content || '',
      remindPeriodType: (a.remind_period_type as PeriodType) || 'D', // Default to 24 hours
      remindPeriodAmount: a.remind_period_amount || 1, // Default to 24 hours
      startedAt: a.started_at ? dayjs(a.started_at).toDate() : null,
      endedAt: a.ended_at ? dayjs(a.ended_at).toDate() : null,
      publishedAt: a.published_at ? dayjs(a.published_at).toDate() : null,
      isUniversalDisplay: a.is_universal_display,
      createdAt: dayjs(a.created_at).toDate(),
      updatedAt: dayjs(a.updated_at).toDate(),
      announcementPages: a.announcement_pages.map(page => ({
        id: page.id,
        announcementId: page.announcement_id,
        path: page.path,
        createdAt: dayjs(page.created_at).toDate(),
        updatedAt: dayjs(page.updated_at).toDate(),
      })),
      memberAnnouncementStatus: a.member_announcement_status.map(status => ({
        id: status.id,
        announcementId: status.announcement_id,
        memberId: status.member_id,
        readAt: status.read_at ? dayjs(status.read_at).toDate() : null,
        remindAt: status.remind_at ? dayjs(status.remind_at).toDate() : null,
        isDismissed: status.is_dismissed,
        createdAt: dayjs(status.created_at).toDate(),
        updatedAt: dayjs(status.updated_at).toDate(),
        member: status.member
          ? {
              id: status.member.id,
              name: status.member.name,
              email: status.member.email,
            }
          : undefined,
      })),
    }
  }, [data, error, loading])

  const [updateAnnouncement, { loading: updateAnnouncementLoading }] = useMutation<
    hasura.UpdateAnnouncement,
    hasura.UpdateAnnouncementVariables
  >(UpdateAnnouncement, { variables: { id: announcementId } })

  const [upsertAnnouncementPages, { loading: upsertAnnouncementPagesLoading }] = useMutation<
    hasura.UpsertAnnouncementPages,
    hasura.UpsertAnnouncementPagesVariables
  >(UpsertAnnouncementPages)

  return {
    loading,
    error,
    announcement,
    updateAnnouncement,
    updateAnnouncementLoading,
    refetch,
    upsertAnnouncementPages,
    upsertAnnouncementPagesLoading,
  }
}

const GetAnnouncementById = gql`
  query GetAnnouncementById($id: uuid!) {
    announcement_by_pk(id: $id) {
      id
      app_id
      title
      content
      remind_period_type
      remind_period_amount
      started_at
      ended_at
      published_at
      is_universal_display
      created_at
      updated_at
      announcement_pages {
        id
        announcement_id
        path
        created_at
        updated_at
      }
      member_announcement_status {
        id
        announcement_id
        member_id
        read_at
        remind_at
        is_dismissed
        created_at
        updated_at
        member {
          id
          name
          email
        }
      }
    }
  }
`

const GetAllAnnouncement = gql`
  query GetAllAnnouncement {
    announcement(order_by: { created_at: asc }) {
      id
      app_id
      title
      content
      remind_period_type
      remind_period_amount
      started_at
      ended_at
      published_at
      is_universal_display
      created_at
      updated_at
      announcement_pages {
        id
        announcement_id
        path
        created_at
        updated_at
      }
      member_announcement_status {
        id
        announcement_id
        member_id
        read_at
        remind_at
        is_dismissed
        created_at
        updated_at
        member {
          id
          name
          email
        }
      }
    }
  }
`

const SubscribeMemberAnnouncement = gql`
  subscription SubscribeMemberAnnouncement($memberId: String!) {
    announcement(
      where: {
        _and: [
          { published_at: { _is_null: false } }
          { _or: [{ ended_at: { _is_null: true } }, { ended_at: { _gte: "now()" } }] }
          { _or: [{ started_at: { _is_null: true } }, { started_at: { _lte: "now()" } }] }
        ]
      }
      order_by: { created_at: asc }
    ) {
      id
      app_id
      title
      content
      remind_period_type
      remind_period_amount
      started_at
      ended_at
      published_at
      is_universal_display
      created_at
      updated_at
      announcement_pages {
        id
        announcement_id
        path
        created_at
        updated_at
      }
      member_announcement_status(where: { member_id: { _eq: $memberId } }) {
        id
        announcement_id
        member_id
        read_at
        remind_at
        is_dismissed
        created_at
        updated_at
      }
    }
  }
`

const UpsertMemberAnnouncementStatus = gql`
  mutation UpsertMemberAnnouncementStatus(
    $memberId: String!
    $announcementId: uuid!
    $isDismissed: Boolean
    $remindAt: timestamptz
  ) {
    insert_member_announcement_status(
      objects: {
        announcement_id: $announcementId
        member_id: $memberId
        is_dismissed: $isDismissed
        remind_at: $remindAt
        read_at: "now()"
      }
      on_conflict: {
        constraint: member_announcement_status_announcement_id_member_id_key
        update_columns: [is_dismissed, read_at, remind_at]
      }
    ) {
      affected_rows
    }
  }
`

const InsertAnnouncements = gql`
  mutation InsertAnnouncements($data: [announcement_insert_input!]!) {
    insert_announcement(objects: $data) {
      returning {
        id
      }
    }
  }
`

const UpdateAnnouncement = gql`
  mutation UpdateAnnouncement($id: uuid!, $data: announcement_set_input) {
    update_announcement_by_pk(pk_columns: { id: $id }, _set: $data) {
      id
    }
  }
`

const UpsertAnnouncementPages = gql`
  mutation UpsertAnnouncementPages($id: uuid!, $data: [announcement_page_insert_input!]!) {
    delete_announcement_page(where: { announcement_id: { _eq: $id } }) {
      affected_rows
    }
    insert_announcement_page(
      objects: $data
      on_conflict: { constraint: announcement_page_path_announcement_id_key, update_columns: [path] }
    ) {
      affected_rows
    }
  }
`
