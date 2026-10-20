import { describe, expect, test } from '@jest/globals'
import fs from 'fs'
import path from 'path'
import ts from 'typescript'
import pageMessages from '../translation'
import { canReadExerciseReport } from './exerciseReportAccess'

// Exercise the actual CSV callback, so assertions cover the exported cells, not
// just a permission helper. No React, network, or download side effects run here.
const sourceText = fs.readFileSync(path.join(__dirname, 'ProgramProcessBlock.tsx'), 'utf8')
const source = ts.createSourceFile('report.tsx', sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
let callback = ''
const visit = (node: ts.Node) => {
  if (
    !callback &&
    ts.isCallExpression(node) &&
    ts.isPropertyAccessExpression(node.expression) &&
    node.expression.name.text === 'then' &&
    node.arguments[0] &&
    ts.isArrowFunction(node.arguments[0]) &&
    node.arguments[0].getText(source).includes('downloadCSV(')
  ) {
    callback = node.arguments[0].getText(source)
  }
  ts.forEachChild(node, visit)
}
visit(source)
const callbackJS = ts.transpileModule(`const render = ${callback};`, {
  compilerOptions: { target: ts.ScriptTarget.ES2019 },
}).outputText

type Options = {
  role?: string
  actor?: string | null
  student?: string
  admin?: boolean
  owner?: boolean
  type?: string
  answers?: Array<{ points: number; passingScore: number | null }>
}
const exportRow = ({
  role = 'general-member',
  actor = 'viewer',
  student = 'student',
  admin = false,
  owner = false,
  type = 'exam',
  answers = [],
}: Options = {}) => {
  let rows: any[][] = []
  const date = () => ({ format: () => 'date', tz: () => ({ format: () => 'date' }) })
  const bindings = {
    currentUserRole: role,
    currentMemberId: actor,
    permissions: { EXERCISE_ADMIN: admin },
    canReadExerciseReport,
    pageMessages,
    formatMessage: (message: { defaultMessage: string }) => message.defaultMessage,
    sum: (values: number[]) => values.reduce((a, b) => a + b, 0),
    stableSort: (values: any[]) => values,
    moment: date,
    dayjs: date,
    currentTimeZone: 'Asia/Taipei',
    toCSV: (values: any[][]) => values,
    downloadCSV: (_name: string, values: any[][]) => {
      rows = values
    },
  }
  const render = new Function(...Object.keys(bindings), `${callbackJS}; return render;`)(...Object.values(bindings))
  render({
    data: {
      property: [],
      member: [{ id: student, name: 'Student', email: 'student@example.invalid', member_properties: [] }],
      program: [
        {
          title: 'Course',
          program_categories: [],
          program_roles: owner ? [{ member_id: actor }] : [],
          program_content_sections: [
            {
              title: 'Section',
              program_contents: [
                {
                  title: 'Content',
                  duration: 60,
                  metadata: { passingScore: 60 },
                  program_content_type: { type },
                  practices: [],
                  program_content_progress: [{ member_id: student, progress: 0.5 }],
                  exercises: answers.map(({ points, passingScore }) => ({
                    member_id: student,
                    answer: [{ questionPoints: 100, gainedPoints: points }],
                    updated_at: '2026-10-20',
                    exam: passingScore === null ? null : { passing_score: passingScore },
                  })),
                },
              ],
            },
          ],
        },
      ],
    },
  })
  expect(rows).toHaveLength(2)
  return rows[1]
}

describe('exercise report permission presentation', () => {
  test.each(['exam', 'exercise'])('READ-only staff see no permission, not zero: %s', type => {
    const row = exportRow({ type })
    for (const column of [8, 9, 13, 14, 15]) expect(row[column]).toBe('無權限')
    expect(row[12]).toBe('50%') // independently readable content progress
  })
  test.each([{ admin: true }, { role: 'app-owner' }, { actor: 'student' }, { role: 'content-creator', owner: true }])(
    'authorized empty results remain zero: %j',
    options => {
      const row = exportRow(options)
      expect(row[9]).toBe('0%')
      expect(row[13]).toBe('')
      expect(row[14]).toBe('')
    },
  )
  test('unrelated creator is not treated as a course owner', () => {
    expect(exportRow({ role: 'content-creator' })[9]).toBe('無權限')
  })
  test('general member with a program role still needs exercise access', () => {
    expect(exportRow({ owner: true })[9]).toBe('無權限')
  })
  test('an absent actor cannot get a numeric result from an admin flag', () => {
    expect(exportRow({ actor: null, admin: true })[9]).toBe('無權限')
  })
  test('visible answers with hidden exam threshold do not become failed or zero', () => {
    const row = exportRow({ admin: true, answers: [{ points: 80, passingScore: null }] })
    expect(row[9]).toBe('無權限')
    expect(row[13]).toBe('無權限')
    expect(row[14]).toBe('80/100')
  })
  test('a genuine zero score is a failed attempt, not a permission error', () => {
    const row = exportRow({ admin: true, answers: [{ points: 0, passingScore: 60 }] })
    expect(row[9]).toBe('0%')
    expect(row[13]).toBe(pageMessages.ProgramProcessBlock.exerciseFailed.defaultMessage)
    expect(row[14]).toBe('0/100')
  })
  test.each(['exam', 'exercise'])('authorized passing result remains 100%%: %s', type => {
    const row = exportRow({ type, admin: true, answers: [{ points: 80, passingScore: 60 }] })
    expect(row[9]).toBe('100%')
    expect(row[13]).toBe(pageMessages.ProgramProcessBlock.exercisePassed.defaultMessage)
  })
  test('video progress does not require exercise permission', () => {
    const row = exportRow({ type: 'video' })
    expect(row[9]).toBe('50%')
    expect(row[8]).toBe('1')
    expect(row[13]).toBe('')
  })
  test.each([80, 60, 59, 0])('legacy exercise without exam uses its content threshold: %i points', points => {
    const row = exportRow({ type: 'exercise', admin: true, answers: [{ points, passingScore: null }] })
    const passed = points >= 60
    expect(row[9]).toBe(passed ? '100%' : '0%')
    expect(row[13]).toBe(
      passed
        ? pageMessages.ProgramProcessBlock.exercisePassed.defaultMessage
        : pageMessages.ProgramProcessBlock.exerciseFailed.defaultMessage,
    )
    expect(row[15]).toBe(passed ? 'date' : '')
  })
  test('legacy exercise does not use a different exam threshold', () => {
    const row = exportRow({ type: 'exercise', admin: true, answers: [{ points: 80, passingScore: 99 }] })
    expect(row[9]).toBe('100%')
    expect(row[13]).toBe(pageMessages.ProgramProcessBlock.exercisePassed.defaultMessage)
  })
  test.each([{ actor: 'student' }, { role: 'content-creator', owner: true }])(
    'self/teacher legacy passing results are not restricted: %j',
    options => {
      const row = exportRow({ ...options, type: 'exercise', answers: [{ points: 80, passingScore: null }] })
      expect(row[9]).toBe('100%')
      expect(row[13]).toBe(pageMessages.ProgramProcessBlock.exercisePassed.defaultMessage)
    },
  )
  test('legacy passing data does not override a missing exercise permission', () => {
    const row = exportRow({ type: 'exercise', answers: [{ points: 80, passingScore: null }] })
    expect(row[9]).toBe('無權限')
    expect(row[13]).toBe('無權限')
    expect(row[14]).toBe('無權限')
    expect(row[15]).toBe('無權限')
  })
})
