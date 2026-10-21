import { useApolloClient, useMutation, useQuery } from '@apollo/client'
import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals'
import { message } from 'antd'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import React from 'react'
import { render, unmountComponentAtNode } from 'react-dom'
import { act, Simulate } from 'react-dom/test-utils'
import MemberCreationModal from '../components/member/MemberCreationModal'
import MemberProfileBasicForm from '../components/member/MemberProfileBasicForm'
import MemberNoteAdminBlock from '../components/note/MemberNoteAdminBlock'
import { handleError } from '../helpers'
import { useUploadAttachments } from './data'
import { useMemberAdmin } from './member'

jest.mock('@apollo/client', () => ({
  ...require('@jest/globals').jest.requireActual('@apollo/client'),
  useApolloClient: require('@jest/globals').jest.fn(),
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
jest.mock('../components/admin/AdminModal', () => {
  const React = require('react')
  return ({ children, renderFooter }: any) => (
    <>
      {children}
      {renderFooter({ setVisible: () => undefined })}
    </>
  )
})
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
              attachments: [new globalThis.File(['attachment'], 'note.txt')],
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
  ;(useApolloClient as ReturnType<typeof jest.fn>).mockReturnValue({ query: jest.fn() })
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

describe('member creation phone round trip', () => {
  const fill = (field: string, value: string) => {
    act(() => {
      Simulate.change(container.querySelector(`input[id="${field}"]`) as HTMLInputElement, { target: { value } } as any)
    })
  }
  const openCreation = () => {
    permissions.MEMBER_PHONE_ADMIN = true
    mutate.mockImplementation(({ variables }: any) =>
      Promise.resolve({
        data: variables.phone
          ? { insert_member_phone_one: { id: 'created-phone' } }
          : variables.identity
          ? { update_member: { affected_rows: 1 } }
          : { insert_member: { affected_rows: 1 } },
      }),
    )
    act(() => {
      render(<MemberCreationModal />, container)
    })
    fill('username', 'QA_PR763')
    fill('email', 'qa.pr763@example.invalid')
  }

  test.each<[string, string | null, string, string]>([
    ['+12025550173', 'US', '2025550173', '+12025550173'],
    ['0912345678', 'TW', '0912345678', '+886912345678'],
    ['+886 912-345-678', 'TW', '0912345678', '+886912345678'],
    ['+80012345678', null, '+80012345678', '+80012345678'],
    ['+870773111632', null, '+870773111632', '+870773111632'],
    ['+881612345678', null, '+881612345678', '+881612345678'],
  ])(
    'creates %s with country metadata, then saves a name without rewriting the phone',
    async (input, country, national, international) => {
      openCreation()
      fill('phone', input)
      await saveProfile()
      expect(mutate).toHaveBeenCalledTimes(2)
      const memberVariables = (mutate.mock.calls[0][0] as any).variables
      const phone = (mutate.mock.calls[1][0] as any).variables.phone
      expect(phone).toEqual({
        member_id: memberVariables.id,
        phone: national,
        country_code: country,
        international_phone: international,
        is_primary: true,
      })
      member.member_phones = [{ id: 'created-phone', ...phone, is_valid: true }]
      act(() => {
        render(<MemberForm />, container)
      })
      fill('name', 'QA name updated')
      mutate.mockClear()
      await saveProfile()
      expect(mutate).toHaveBeenCalledTimes(1)
      const saved = (mutate.mock.calls[0][0] as any).variables
      expect(saved.identity.name).toBe('QA name updated')
      expect(saved.updatePhones).toBe(false)
      expect(saved.phones).toEqual([])
      expect(handleError).not.toHaveBeenCalled()
    },
  )

  test('unchanged legacy phone without a country does not block name edits', async () => {
    permissions.MEMBER_PHONE_ADMIN = true
    member.member_phones = [{ id: 'legacy', phone: '+12025550173', country_code: null, is_valid: true }]
    act(() => {
      render(<MemberForm />, container)
    })
    fill('name', 'Legacy name updated')
    await saveProfile()
    expect(mutate).toHaveBeenCalledTimes(1)
    expect((mutate.mock.calls[0][0] as any).variables).toMatchObject({
      identity: { name: 'Legacy name updated' },
      updatePhones: false,
      phones: [],
    })
  })

  test('rejects invalid phone before creating the member', async () => {
    openCreation()
    fill('phone', 'not-a-phone')
    await saveProfile()
    expect(mutate).not.toHaveBeenCalled()
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
    })
    expect(container.textContent).toContain('請輸入有效電話')
  })

  test('phone denial preserves the successful member creation and reports partial success', async () => {
    openCreation()
    mutate.mockImplementation(({ variables }: any) =>
      variables.phone
        ? Promise.reject(new Error('permission denied'))
        : Promise.resolve({ data: { insert_member: { affected_rows: 1 } } }),
    )
    fill('phone', '+12025550173')
    await saveProfile()
    expect(mutate).toHaveBeenCalledTimes(2)
    expect(message.warning).toHaveBeenCalledWith(expect.stringContaining('會員已建立，但電話未儲存'), 10)
    expect(message.success).toHaveBeenCalled()
    expect(handleError).not.toHaveBeenCalled()
  })

  test('creating without a phone does not insert an empty phone row', async () => {
    openCreation()
    await saveProfile()
    expect(mutate).toHaveBeenCalledTimes(1)
    expect(message.success).toHaveBeenCalled()
  })
})

test('phone fields are read-only without phone permission; member creation still works', async () => {
  permissions = { MEMBER_CREATE: true }
  mutate.mockImplementation(() => Promise.resolve({ data: { insert_member: { affected_rows: 1 } } }))
  act(() => {
    render(<MemberCreationModal />, container)
  })
  expect((container.querySelector('input[id="phone"]') as HTMLInputElement).disabled).toBe(true)
  expect((container.querySelector('input[id="countryCode"]') as HTMLInputElement).disabled).toBe(true)
  act(() => {
    Simulate.change(
      container.querySelector('input[id="username"]') as HTMLInputElement,
      { target: { value: 'QA' } } as any,
    )
    Simulate.change(
      container.querySelector('input[id="email"]') as HTMLInputElement,
      { target: { value: 'qa@example.invalid' } } as any,
    )
  })
  await saveProfile()
  expect(mutate).toHaveBeenCalledTimes(1)
})

test('editing a phone still validates and writes its ISO country and E.164 number', async () => {
  permissions.MEMBER_PHONE_ADMIN = true
  member.member_phones = [{ id: 'phone', phone: '2025550173', country_code: 'US', is_valid: true }]
  act(() => {
    render(<MemberForm />, container)
  })
  const input = Array.from(container.querySelectorAll('input')).find(
    input => input.value === '2025550173',
  ) as HTMLInputElement
  act(() => {
    Simulate.change(input, { target: { value: 'invalid' } } as any)
  })
  await saveProfile()
  expect(mutate).not.toHaveBeenCalled()
  act(() => {
    Simulate.change(input, { target: { value: '2025550174' } } as any)
  })
  await saveProfile()
  expect((mutate.mock.calls[0][0] as any).variables).toMatchObject({
    updatePhones: true,
    phones: [{ phone: '2025550174', country_code: 'US', international_phone: '+12025550174' }],
  })
})

describe('multiple phone metadata preservation', () => {
  test.each([
    ['2025550173', 'US', '+12025550173'],
    ['+80012345678', null, '+80012345678'],
    ['+12025550173', null, null],
  ])('editing a second phone preserves untouched %s metadata', async (phone, country, international) => {
    permissions.MEMBER_PHONE_ADMIN = true
    member.member_phones = [
      {
        id: 'first',
        phone,
        country_code: country,
        international_phone: international,
        is_valid: false,
        is_primary: true,
      },
      {
        id: 'second',
        phone: '0912345678',
        country_code: 'TW',
        international_phone: '+886912345678',
        is_valid: true,
        is_primary: false,
      },
    ]
    act(() => {
      render(<MemberForm />, container)
    })
    const input = Array.from(container.querySelectorAll('input')).find(input => input.value === '0912345678')!
    act(() => {
      Simulate.change(input, { target: { value: '0912345679' } } as any)
    })
    await saveProfile()
    expect(mutate).toHaveBeenCalledTimes(1)
    expect((mutate.mock.calls[0][0] as any).variables).toMatchObject({
      updatePhones: true,
      phones: [
        { phone, country_code: country, international_phone: international, is_valid: false, is_primary: true },
        { phone: '0912345679', country_code: 'TW', international_phone: '+886912345679', is_valid: true },
      ],
    })
  })
  test('editing an existing US national phone retains its selected country', async () => {
    permissions.MEMBER_PHONE_ADMIN = true
    member.member_phones = [
      { id: 'us', phone: '2025550173', country_code: 'US', international_phone: '+12025550173', is_valid: true },
    ]
    act(() => {
      render(<MemberForm />, container)
    })
    const input = Array.from(container.querySelectorAll('input')).find(input => input.value === '2025550173')!
    act(() => {
      Simulate.change(input, { target: { value: '2025550174' } } as any)
    })
    await saveProfile()
    expect((mutate.mock.calls[0][0] as any).variables.phones).toEqual([
      expect.objectContaining({ phone: '2025550174', country_code: 'US', international_phone: '+12025550174' }),
    ])
  })
})

test('editing a geographic phone to a non-geographic number clears ISO and retains E.164', async () => {
  permissions.MEMBER_PHONE_ADMIN = true
  member.member_phones = [
    { id: 'phone', phone: '2025550173', country_code: 'US', international_phone: '+12025550173', is_valid: true },
  ]
  act(() => {
    render(<MemberForm />, container)
  })
  const input = Array.from(container.querySelectorAll('input')).find(input => input.value === '2025550173')!
  act(() => {
    Simulate.change(input, { target: { value: '+80012345678' } } as any)
  })
  await saveProfile()
  expect((mutate.mock.calls[0][0] as any).variables.phones).toEqual([
    expect.objectContaining({ phone: '+80012345678', country_code: null, international_phone: '+80012345678' }),
  ])
})
test('a member with no phone can save a name without inserting the empty TW placeholder', async () => {
  permissions.MEMBER_PHONE_ADMIN = true
  act(() => {
    render(<MemberForm />, container)
  })
  act(() => {
    Simulate.change(container.querySelector('input[id="name"]')!, { target: { value: 'Updated name' } } as any)
  })
  await saveProfile()
  expect((mutate.mock.calls[0][0] as any).variables).toMatchObject({ updatePhones: false, phones: [] })
})
