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
