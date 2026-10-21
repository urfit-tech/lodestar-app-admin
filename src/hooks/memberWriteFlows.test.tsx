import { useApolloClient, useMutation, useQuery } from '@apollo/client'
import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals'
import { message } from 'antd'
import { print } from 'graphql'
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
  mutate = jest.fn().mockImplementation(({ variables }: any) =>
    Promise.resolve({
      data: {
        update_member: { affected_rows: 1 },
        delete_member_phone: { affected_rows: variables?.deletedPhoneIds?.length ?? 0 },
        insert_member_phone: { affected_rows: variables?.phones?.length ?? 0 },
        stage_phone_updates: variables?.stagedPhoneUpdates?.map(() => ({ affected_rows: 1 })) ?? [],
        update_member_phone_many: variables?.phoneUpdates?.map(() => ({ affected_rows: 1 })) ?? [],
      },
    }),
  )
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

  test.each([
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
    phones: [],
    phoneUpdates: [{ _set: { phone: '2025550174', country_code: 'US', international_phone: '+12025550174' } }],
  })
})

describe('multiple phone metadata preservation', () => {
  test.each([
    ['2025550173', 'US', '+12025550173'],
    ['+80012345678', null, '+80012345678'],
    ['+12025550173', null, null],
    ['+12025550173,123', null, null],
    ['2025550173,123,456', 'US', null],
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
      deletedPhoneIds: [],
      phones: [],
      phoneUpdates: [
        {
          where: { id: { _eq: 'second' }, member_id: { _eq: 'target' } },
          _set: { phone: '0912345679', country_code: 'TW', international_phone: '+886912345679', is_valid: true },
        },
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
    expect((mutate.mock.calls[0][0] as any).variables.phoneUpdates.map((row: any) => row._set)).toEqual([
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
  expect((mutate.mock.calls[0][0] as any).variables.phoneUpdates.map((row: any) => row._set)).toEqual([
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

test('clearing a required existing phone does not silently delete it', async () => {
  permissions.MEMBER_PHONE_ADMIN = true
  member.member_phones = [{ id: 'phone', phone: '2025550173', country_code: 'US', is_valid: true }]
  act(() => {
    render(<MemberForm />, container)
  })
  const input = Array.from(container.querySelectorAll('input')).find(input => input.value === '2025550173')!
  act(() => {
    Simulate.change(input, { target: { value: '' } } as any)
  })
  await saveProfile()
  expect(mutate).not.toHaveBeenCalled()
})

describe('phone row identity and opaque metadata', () => {
  const trackedPhone = () => ({
    id: 'tracked',
    phone: '2025550173',
    country_code: 'US',
    international_phone: '+12025550173',
    is_valid: false,
    is_primary: true,
    extension_number: '123',
    manager_id: 'sales',
    created_at: '2020-01-01',
    updated_at: '2021-01-01',
    last_manager_assigned_at: '2022-01-01',
    followed_at: '2023-01-01',
    closed_at: '2023-02-01',
    completed_at: '2023-03-01',
    recycled_at: '2023-04-01',
    excluded_at: '2023-05-01',
  })
  test('editing a primary phone updates its original row without overwriting business metadata', async () => {
    permissions.MEMBER_PHONE_ADMIN = true
    member.member_phones = [trackedPhone()]
    act(() => {
      render(<MemberForm />, container)
    })
    act(() => {
      Simulate.change(container.querySelector('input[value="2025550173"]')!, { target: { value: '2025550174' } } as any)
    })
    await saveProfile()
    const variables = (mutate.mock.calls[0][0] as any).variables
    expect(variables.deletedPhoneIds).toEqual([])
    expect(variables.phones).toEqual([])
    expect(variables.phoneUpdates).toEqual([
      {
        where: { id: { _eq: 'tracked' }, member_id: { _eq: 'target' } },
        _set: { phone: '2025550174', country_code: 'US', international_phone: '+12025550174', is_valid: true },
      },
    ])
    // SQL _set leaves all unmentioned fields on the existing row, including fields this role cannot select.
    const saved = { ...trackedPhone(), ...variables.phoneUpdates[0]._set }
    expect(saved).toEqual({
      ...trackedPhone(),
      phone: '2025550174',
      international_phone: '+12025550174',
      is_valid: true,
    })
    const document = mockUseMutation.mock.calls.find(
      ([doc]: any) => operationName(doc) === 'UPDATE_MEMBER_PROFILE_BASIC',
    )![0]
    const query = print(document as any)
    expect(query.replace(/\s/g, '')).toContain(
      'delete_member_phone(where:{member_id:{_eq:$memberId},id:{_in:$deletedPhoneIds}})',
    )
    expect(query).toContain('update_member_phone_many(updates: $phoneUpdates)')
  })
  test('removing a row and editing the remaining row retains its ID despite the shifted index', async () => {
    permissions.MEMBER_PHONE_ADMIN = true
    member.member_phones = [
      trackedPhone(),
      { id: 'removed', phone: '0912345678', country_code: 'TW', is_valid: true },
      { id: 'remaining', phone: '0912345679', country_code: 'TW', is_valid: true },
    ]
    act(() => {
      render(<MemberForm />, container)
    })
    act(() => {
      Simulate.click(
        container
          .querySelector('input[value="0912345678"]')!
          .closest('.position-relative')!
          .querySelector('.anticon-close')!,
      )
    })
    act(() => {
      Simulate.change(container.querySelector('input[value="0912345679"]')!, { target: { value: '0912345680' } } as any)
    })
    await saveProfile()
    const variables = (mutate.mock.calls[0][0] as any).variables
    expect(variables.deletedPhoneIds).toEqual(['removed'])
    expect(variables.phones).toEqual([])
    expect(variables.phoneUpdates).toHaveLength(1)
    expect(variables.phoneUpdates[0].where).toEqual({ id: { _eq: 'remaining' }, member_id: { _eq: 'target' } })
  })
  test('adding a phone does not delete or update existing rows', async () => {
    permissions.MEMBER_PHONE_ADMIN = true
    member.member_phones = [trackedPhone()]
    act(() => {
      render(<MemberForm />, container)
    })
    act(() => {
      Simulate.click(container.querySelector('.anticon-plus')!.closest('button')!)
    })
    const inputs = container.querySelectorAll('.position-relative input')
    act(() => {
      Simulate.change(inputs[inputs.length - 1], { target: { value: '0912345678' } } as any)
    })
    await saveProfile()
    const variables = (mutate.mock.calls[0][0] as any).variables
    expect(variables.deletedPhoneIds).toEqual([])
    expect(variables.phoneUpdates).toEqual([])
    expect(variables.phones).toEqual([
      {
        id: expect.any(String),
        member_id: 'target',
        phone: '0912345678',
        country_code: 'TW',
        international_phone: '+886912345678',
        is_valid: true,
      },
    ])
    act(() => {
      Simulate.change(container.querySelector('input[id="name"]')!, { target: { value: 'After adding phone' } } as any)
    })
    await saveProfile()
    expect((mutate.mock.calls[1][0] as any).variables).toMatchObject({
      updatePhones: false,
      phones: [],
      phoneUpdates: [],
      deletedPhoneIds: [],
    })
    act(() => {
      Simulate.change(container.querySelector('input[value="0912345678"]')!, { target: { value: '0912345679' } } as any)
    })
    await saveProfile()
    const edited = (mutate.mock.calls[2][0] as any).variables
    expect(edited.phones).toEqual([])
    expect(edited.phoneUpdates[0].where.id).toEqual({ _eq: variables.phones[0].id })
    act(() => {
      Simulate.click(
        container
          .querySelector('input[value="0912345679"]')!
          .closest('.position-relative')!
          .querySelector('.anticon-close')!,
      )
    })
    await saveProfile()
    expect((mutate.mock.calls[3][0] as any).variables).toMatchObject({
      deletedPhoneIds: [variables.phones[0].id],
      phones: [],
      phoneUpdates: [],
    })
  })
  test.each([null, [], [{ affected_rows: 0 }], [null]])(
    'missing or zero phone update response is not reported as success: %j',
    async response => {
      permissions.MEMBER_PHONE_ADMIN = true
      member.member_phones = [trackedPhone()]
      mutate.mockImplementation(() =>
        Promise.resolve({
          data: {
            update_member: { affected_rows: 1 },
            delete_member_phone: { affected_rows: 0 },
            insert_member_phone: { affected_rows: 0 },
            update_member_phone_many: response,
          },
        }),
      )
      act(() => {
        render(<MemberForm />, container)
      })
      act(() => {
        Simulate.change(container.querySelector('input[value="2025550173"]')!, {
          target: { value: '2025550174' },
        } as any)
      })
      await saveProfile()
      expect(message.success).not.toHaveBeenCalled()
      expect(handleError).toHaveBeenCalledWith(
        expect.objectContaining({ message: expect.stringContaining('電話未完整更新') }),
      )
    },
  )
})

test('cancel restores phone row IDs as well as values before the next edit', async () => {
  permissions.MEMBER_PHONE_ADMIN = true
  member.member_phones = [{ id: 'original-id', phone: '2025550173', country_code: 'US', is_valid: true }]
  act(() => {
    render(<MemberForm />, container)
  })
  act(() => {
    Simulate.change(container.querySelector('input[value="2025550173"]')!, { target: { value: '2025550174' } } as any)
  })
  act(() => {
    Simulate.click(
      Array.from(container.querySelectorAll('button')).find(button => button.textContent?.includes('cancel'))!,
    )
  })
  expect(container.querySelector('input[value="2025550173"]')).not.toBeNull()
  act(() => {
    Simulate.change(container.querySelector('input[value="2025550173"]')!, { target: { value: '2025550175' } } as any)
  })
  await saveProfile()
  expect((mutate.mock.calls[0][0] as any).variables.phoneUpdates[0].where.id).toEqual({ _eq: 'original-id' })
})

test.each(['swap', 'chain'])('phone %s uses collision-free staging and retains row metadata', async mode => {
  permissions.MEMBER_PHONE_ADMIN = true
  member.member_phones = [
    { id: 'first', phone: '2025550173', country_code: 'US', is_valid: true, is_primary: true, extension_number: '123' },
    { id: 'second', phone: '2025550174', country_code: 'US', is_valid: true, manager_id: 'sales' },
  ]
  const rows = member.member_phones.map((row: any) => ({ ...row }))
  mutate.mockImplementation(({ variables }: any) => {
    const apply = (updates: any[]) =>
      updates.map(update => {
        const row = rows.find((row: any) => row.id === update.where.id._eq)!
        if (rows.some((other: any) => other.id !== row.id && other.phone === update._set.phone))
          throw new Error('duplicate key violates member_phone_member_id_phone_key')
        Object.assign(row, update._set)
        return { affected_rows: 1 }
      })
    const staged = apply(variables.stagedPhoneUpdates)
    const final = apply(variables.phoneUpdates)
    return Promise.resolve({
      data: {
        update_member: { affected_rows: 1 },
        stage_phone_updates: staged,
        update_member_phone_many: final,
        delete_member_phone: { affected_rows: 0 },
        insert_member_phone: { affected_rows: 0 },
      },
    })
  })
  act(() => {
    render(<MemberForm />, container)
  })
  const first = container.querySelector('input[value="2025550173"]')!
  const second = container.querySelector('input[value="2025550174"]')!
  act(() => {
    Simulate.change(first, { target: { value: '2025550174' } } as any)
  })
  act(() => {
    Simulate.change(second, { target: { value: mode === 'swap' ? '2025550173' : '2025550175' } } as any)
  })
  await saveProfile()
  expect(handleError).not.toHaveBeenCalled()
  expect(message.success).toHaveBeenCalled()
  expect(rows[0]).toMatchObject({ id: 'first', phone: '2025550174', is_primary: true, extension_number: '123' })
  expect(rows[1]).toMatchObject({
    id: 'second',
    phone: mode === 'swap' ? '2025550173' : '2025550175',
    manager_id: 'sales',
  })
  const document = print(mockUseMutation.mock.calls[0][0] as any)
  expect(document.indexOf('stage_phone_updates:')).toBeLessThan(
    document.indexOf('update_member_phone_many(updates: $phoneUpdates)'),
  )
})

test('after save and server refetch cancel restores latest phone value and ID', async () => {
  permissions.MEMBER_PHONE_ADMIN = true
  member.member_phones = [{ id: 'original', phone: '2025550173', country_code: 'US', is_valid: true }]
  act(() => {
    render(<MemberForm />, container)
  })
  act(() => {
    Simulate.change(container.querySelector('input[value="2025550173"]')!, { target: { value: '2025550174' } } as any)
  })
  await saveProfile()
  member = { ...member, member_phones: [{ id: 'server-row', phone: '2025550175', country_code: 'US', is_valid: true }] }
  act(() => {
    render(<MemberForm />, container)
  })
  act(() => {
    Simulate.click(
      Array.from(container.querySelectorAll('button')).find(button => button.textContent?.includes('cancel'))!,
    )
  })
  expect(container.querySelector('input[value="2025550175"]')).not.toBeNull()
  act(() => {
    Simulate.change(container.querySelector('input[value="2025550175"]')!, { target: { value: '2025550176' } } as any)
  })
  await saveProfile()
  expect((mutate.mock.calls[1][0] as any).variables.phoneUpdates[0].where.id).toEqual({ _eq: 'server-row' })
})

test.each([null, [], [{ affected_rows: 0 }]])(
  'failed staging response %j is not reported as success',
  async response => {
    permissions.MEMBER_PHONE_ADMIN = true
    member.member_phones = [{ id: 'original', phone: '2025550173', country_code: 'US', is_valid: true }]
    mutate.mockImplementation(() =>
      Promise.resolve({
        data: {
          update_member: { affected_rows: 1 },
          stage_phone_updates: response,
          update_member_phone_many: [{ affected_rows: 1 }],
          delete_member_phone: { affected_rows: 0 },
          insert_member_phone: { affected_rows: 0 },
        },
      }),
    )
    act(() => {
      render(<MemberForm />, container)
    })
    act(() => {
      Simulate.change(container.querySelector('input[value="2025550173"]')!, { target: { value: '2025550174' } } as any)
    })
    await saveProfile()
    expect(message.success).not.toHaveBeenCalled()
    expect(handleError).toHaveBeenCalled()
  },
)
