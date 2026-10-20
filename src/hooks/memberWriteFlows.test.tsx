import { useMutation, useQuery } from '@apollo/client'
import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals'
import { message } from 'antd'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import React from 'react'
import { render, unmountComponentAtNode } from 'react-dom'
import { act, Simulate } from 'react-dom/test-utils'
import MemberProfileBasicForm from '../components/member/MemberProfileBasicForm'
import MemberNoteAdminBlock from '../components/note/MemberNoteAdminBlock'
import { handleError } from '../helpers'
import { useUploadAttachments } from './data'
import { useMemberAdmin } from './member'

jest.mock('@apollo/client', () => ({
  ...require('@jest/globals').jest.requireActual('@apollo/client'),
  useQuery: require('@jest/globals').jest.fn(),
  useMutation: require('@jest/globals').jest.fn(),
}))
jest.mock('antd', () => ({
  ...require('@jest/globals').jest.requireActual('antd'),
  message: {
    success: require('@jest/globals').jest.fn(),
    warning: require('@jest/globals').jest.fn(),
    error: require('@jest/globals').jest.fn(),
  },
}))
jest.mock('lodestar-app-element/src/contexts/AuthContext', () => ({ useAuth: require('@jest/globals').jest.fn() }))
jest.mock('lodestar-app-element/src/contexts/AppContext', () => ({
  useApp: () => ({ enabledModules: {}, settings: {} }),
}))
jest.mock('react-intl', () => ({
  defineMessages: (messages: unknown) => messages,
  useIntl: () => ({ formatMessage: (descriptor: { id: string }) => descriptor.id }),
}))
jest.mock('use-query-params', () => ({
  StringParam: {},
  useQueryParam: () => [undefined, require('@jest/globals').jest.fn()],
}))
jest.mock('@chakra-ui/react', () => ({ IconButton: () => null }))
jest.mock('../helpers', () => ({
  handleError: require('@jest/globals').jest.fn(),
  notEmpty: (value: unknown) => value != null,
}))
jest.mock('./data', () => ({ useUploadAttachments: require('@jest/globals').jest.fn() }))
jest.mock('../components/form/CategorySelector', () => () => null)
jest.mock('../components/form/TagSelector', () => () => null)
jest.mock('../components/form/MemberSelector', () => ({
  AllMemberSelector: () => null,
  InhibitInputMemberSelector: () => null,
}))
jest.mock('../components/member/MemberNoteAdminItem', () => () => null)
jest.mock('../components/admin', () => ({ AdminBlock: ({ children }: any) => children }))
jest.mock('../components/admin/AdminBlock', () => ({ EmptyAdminBlock: ({ children }: any) => children }))
jest.mock('../components/member/MemberNoteAdminModal', () => {
  const React = require('react')
  return (props: any) => (
    <>
      {props.renderTrigger()}
      {props.visible && (
        <button
          data-testid="save-note"
          onClick={() =>
            props.onSubmit({
              type: 'inbound',
              status: 'answered',
              description: 'test note',
              attachments: [new File(['attachment'], 'note.txt')],
            })
          }
        >
          save note
        </button>
      )}
    </>
  )
})

const mockUseQuery = useQuery as ReturnType<typeof jest.fn>
const mockUseMutation = useMutation as ReturnType<typeof jest.fn>
const mockUseAuth = useAuth as ReturnType<typeof jest.fn>
const mockUseUploadAttachments = useUploadAttachments as ReturnType<typeof jest.fn>

const MemberForm = () => {
  const { memberAdmin } = useMemberAdmin('target')
  return <MemberProfileBasicForm memberAdmin={memberAdmin} />
}

let container: HTMLDivElement
let member: any
let permissions: Record<string, boolean>
let mutate: ReturnType<typeof jest.fn>
let upload: ReturnType<typeof jest.fn>
let refetchMember: ReturnType<typeof jest.fn>
let refetchNotes: ReturnType<typeof jest.fn>
const operationName = (document: any) => document.definitions[0].name.value

beforeEach(() => {
  jest.clearAllMocks()
  window.matchMedia = jest.fn().mockImplementation(() => ({
    matches: false,
    addListener: jest.fn(),
    removeListener: jest.fn(),
  })) as any
  container = document.createElement('div')
  document.body.appendChild(container)
  permissions = { MEMBER_ADMIN: true, MEMBER_EMAIL_EDIT: true, MEMBER_USERNAME_EDIT: true, MEMBER_NOTE_ADMIN: true }
  // This is the actual Hasura response for another member: extras may be hidden by select permissions.
  member = {
    id: 'target',
    role: 'general-member',
    name: 'Target',
    username: 'original',
    email: 'old@example.com',
    star: 0,
    created_at: '2026-10-20',
    member_tags: [],
    member_specialities: [],
    member_phones: [],
    member_notes: [],
    member_contracts: [],
    member_permission_extras: [],
    member_permission_groups: [],
    member_categories: [],
    order_logs: [],
  }
  refetchMember = jest.fn()
  refetchNotes = jest.fn()
  mutate = jest.fn().mockImplementation(() => Promise.resolve({ data: { update_member: { affected_rows: 1 } } }))
  upload = jest.fn().mockImplementation(() => Promise.resolve())
  mockUseAuth.mockImplementation(() => ({ currentUserRole: 'general-member', currentMemberId: 'staff', permissions }))
  mockUseQuery.mockImplementation((document: any) => {
    if (operationName(document) === 'GET_MEMBER_ADMIN')
      return { data: { member_by_pk: member }, refetch: refetchMember }
    if (operationName(document) === 'GET_MEMBER_NOTES_ADMIN')
      return {
        data: { member_note: [], member_note_aggregate: { aggregate: { count: 0 } } },
        refetch: refetchNotes,
      }
    return {}
  })
  mockUseMutation.mockImplementation(() => [mutate])
  mockUseUploadAttachments.mockReturnValue(upload)
})
afterEach(() => {
  act(() => {
    unmountComponentAtNode(container)
  })
  container.remove()
})

async function saveProfile() {
  await act(async () => {
    Simulate.click(container.querySelector('button.ant-btn-primary') as HTMLButtonElement)
  })
}

describe('member write flows with actual hooks and components', () => {
  test.each(['email', 'username'])(
    'legal cross-member %s editing remains available with a permission-filtered query result',
    async field => {
      act(() => {
        render(<MemberForm />, container)
      })
      const email = container.querySelector('input[id="email"]') as HTMLInputElement
      const username = container.querySelector('input[id="username"]') as HTMLInputElement
      expect(email.disabled).toBe(false)
      expect(username.disabled).toBe(false)
      act(() => {
        Simulate.change(field === 'email' ? email : username, {
          target: { value: field === 'email' ? 'new@example.com' : 'new-username' },
        } as any)
      })
      await saveProfile()
      const identity = (mutate.mock.calls[0][0] as any).variables.identity
      expect(identity[field]).toBe(field === 'email' ? 'new@example.com' : 'new-username')
      expect(identity).not.toHaveProperty(field === 'email' ? 'username' : 'email')
    },
  )
  test('unchanged login identifiers are omitted when saving other basic data', async () => {
    act(() => {
      render(<MemberForm />, container)
    })
    const name = container.querySelector('input[id="name"]') as HTMLInputElement
    act(() => {
      Simulate.change(name, { target: { value: 'New name' } } as any)
    })
    await saveProfile()
    expect((mutate.mock.calls[0][0] as any).variables.identity).toMatchObject({ name: 'New name' })
    expect((mutate.mock.calls[0][0] as any).variables.identity).not.toHaveProperty('email')
    expect((mutate.mock.calls[0][0] as any).variables.identity).not.toHaveProperty('username')
  })
  test('missing EDIT permission keeps the corresponding identity field read-only', () => {
    permissions.MEMBER_EMAIL_EDIT = false
    act(() => {
      render(<MemberForm />, container)
    })
    expect((container.querySelector('input[id="email"]') as HTMLInputElement).disabled).toBe(true)
    expect((container.querySelector('input[id="username"]') as HTMLInputElement).disabled).toBe(false)
  })
  test.each(['creator', 'extra', 'group'])('known protected target stays read-only: %s', kind => {
    if (kind === 'creator') member.role = 'content-creator'
    if (kind === 'extra') member.member_permission_extras = [{ permission_id: 'BACKSTAGE_ENTER' }]
    if (kind === 'group') member.member_permission_groups = [{ permission_group: { id: 'staff-group', name: 'Staff' } }]
    act(() => {
      render(<MemberForm />, container)
    })
    expect((container.querySelector('input[id="email"]') as HTMLInputElement).disabled).toBe(true)
    expect((container.querySelector('input[id="username"]') as HTMLInputElement).disabled).toBe(true)
  })
  test('a hidden staff target is still rejected by the server and never shown as saved', async () => {
    const rejection = new Error('member: not allowed to change login identifiers of this member')
    mutate.mockImplementation(() => Promise.reject(rejection))
    act(() => {
      render(<MemberForm />, container)
    })
    const email = container.querySelector('input[id="email"]') as HTMLInputElement
    act(() => {
      Simulate.change(email, { target: { value: 'new@example.com' } } as any)
    })
    await saveProfile()
    expect((mutate.mock.calls[0][0] as any).variables.identity.email).toBe('new@example.com')
    expect(handleError).toHaveBeenCalledWith(rejection)
    expect(message.success).not.toHaveBeenCalled()
  })
  test.each([0, null])(
    'a committed note still saves attachments and finishes the UI when member update is %p',
    async rows => {
      // MEMBER_ADMIN can insert a note for an app-owner; member update filters out that target.
      member.role = 'app-owner'
      mutate.mockImplementation(() =>
        Promise.resolve({
          data: {
            insert_member_note_one: { id: 'created-note' },
            update_member: rows === null ? null : { affected_rows: rows },
          },
        }),
      )
      act(() => {
        render(<MemberNoteAdminBlock memberId="target" />, container)
      })
      act(() => {
        Simulate.click(container.querySelector('button.ant-btn-primary') as HTMLButtonElement)
      })
      await act(async () => {
        Simulate.click(container.querySelector('[data-testid="save-note"]') as HTMLButtonElement)
      })
      expect(upload).toHaveBeenCalledWith('MemberNote', 'created-note', [expect.any(File)])
      expect(refetchMember).toHaveBeenCalled()
      expect(refetchNotes).toHaveBeenCalled()
      expect(message.warning).toHaveBeenCalled()
      expect(handleError).not.toHaveBeenCalled()

      expect(container.querySelector('[data-testid="save-note"]')).toBeNull()
      expect(mutate).toHaveBeenCalledTimes(1)
    },
  )
  test('a rejected note insert does not upload attachments or report partial success', async () => {
    const rejection = new Error('insert permission denied')
    mutate.mockImplementation(() => Promise.reject(rejection))
    act(() => {
      render(<MemberNoteAdminBlock memberId="target" />, container)
    })
    act(() => {
      Simulate.click(container.querySelector('button.ant-btn-primary') as HTMLButtonElement)
    })
    await act(async () => {
      Simulate.click(container.querySelector('[data-testid="save-note"]') as HTMLButtonElement)
    })
    expect(upload).not.toHaveBeenCalled()
    expect(refetchNotes).not.toHaveBeenCalled()
    expect(message.warning).not.toHaveBeenCalled()
    expect(handleError).toHaveBeenCalledWith(rejection)
  })
})
