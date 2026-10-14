# KOLABLE App

This application is based on multi-tenant architecture.
You can customize your own application from this app.

## Customization

you must set `REACT_APP_ID` in your environment variable

### Environment variable

configure APP_ID, API server, user pool, and so on

### Database

add application record into `app` table

### Theme

set theme variables into `theme` folder and naming into `{REACT_APP_ID}.js`

### Template

put template page into `src/templates/{REACT_APP_ID}` folder with the same filename as the corresponding page. ex: `HomePage.tsx`

## Styling

### UI framework

using `antd` for the base UI framework and modifying with `styled-component`
shared variables in `theme` folder

### Responsive

using `react-responsive` to separate mobile and default version

### Layout

TBD

## Task and meeting-room saves

Task saves use `SaveMemberTask`; room changes use `MoveMeetMember`. Each sends its native Hasura writes and a final
consistency assertion in one same-source transaction. A permission failure or a required zero-row write rolls back
the transaction. The form is kept open on failure; success requires exactly one `{ ok: true }` assertion result.

- Requires Hasura migration `1791990000000_meeting_transaction_assertions` and its function/result-table metadata
  **before** this UI is deployed. No existing task/meeting permission is broadened.
- Task edits compare the original raw `member_task.meet_id` (`MemberTaskProps.meetId`, including NULL), not the
  permission-filtered `meet` relationship. Concurrent meeting replacement/removal cannot overwrite that linkage.
- Existing Zoom cleanup runs only after the database commit. A network failure is not automatically retried.
- This fixes these UI save flows, not arbitrary direct GraphQL writes, task deletion, or historical data cleanup.

Rollback: restore the prior UI first; then untrack the two assertion functions and their result table before applying
the Hasura down migration.
