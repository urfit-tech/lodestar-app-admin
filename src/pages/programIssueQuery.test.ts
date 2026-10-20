import { describe, expect, test } from '@jest/globals'
import { buildProgramIssueWhere } from './programIssueQuery'

describe('course issue list filters', () => {
  test('ADMIN includes courses without roles, but still requires an authorized enrollment', () => {
    expect(buildProgramIssueWhere('A', null, 'all')).toEqual({ app_id: { _eq: 'A' }, issue_enrollment: {} })
  })
  test('NORMAL requires the current member to be an instructor', () => {
    expect(buildProgramIssueWhere('A', 'teacher', 'all').issue_enrollment).toEqual({
      program_roles: { member_id: { _eq: 'teacher' }, name: { _eq: 'instructor' } },
    })
  })
  test('missing member does not turn into an ADMIN filter', () => {
    expect(buildProgramIssueWhere('A', '', 'all').issue_enrollment).toEqual({
      program_roles: { member_id: { _eq: '' }, name: { _eq: 'instructor' } },
    })
  })
  test.each([true, false])('preserves the status filter %s', unsolved => {
    expect(buildProgramIssueWhere('A', null, 'all', unsolved).solved_at).toEqual({ _is_null: unsolved })
  })
  test('selected course and status can be combined', () => {
    expect(buildProgramIssueWhere('A', 'teacher', 'course', false)).toMatchObject({
      app_id: { _eq: 'A' },
      thread_id: { _like: '/programs/course/contents/%' },
      solved_at: { _is_null: false },
    })
  })
  test('all statuses and courses omit optional predicates entirely', () => {
    const where = buildProgramIssueWhere('A', null, 'all')
    expect(where).not.toHaveProperty('thread_id')
    expect(where).not.toHaveProperty('solved_at')
    expect(JSON.stringify(where)).not.toContain('null')
  })
})
