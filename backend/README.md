# Task Tracker Backend

NestJS API for the Task Tracker. PostgreSQL stores users and tasks; task routes require a bearer token from the auth endpoints.

## Run locally

Install dependencies with `npm ci`, configure the PostgreSQL connection, then run `npm run start:dev` from this directory. The current connection host is set in `src/app.module.ts`; `DB_USERNAME`, `DB_PASSWORD`, and `DB_NAME` configure its credentials and database. Set `NODE_ENV=production` to enable PostgreSQL SSL.

The application currently uses TypeORM schema synchronization. Review `synchronize` in `src/app.module.ts` before using a production database.

## API

Register or log in with `POST /auth/register` or `POST /auth/login`, sending `{ "username": "...", "password": "..." }`. Both return a bearer `token` and user details.

All `/tasks` routes require `Authorization: Bearer <token>`.

| Method | Route | Behavior |
| --- | --- | --- |
| `GET` | `/tasks` | List the authenticated user's tasks, newest first. |
| `GET` | `/tasks?q=report&status=open` | Search title and description, optionally filtering status. |
| `POST` | `/tasks` | Create with `{ "title": "...", "description": "..." }`. |
| `PATCH` | `/tasks/:id` | Update `title`, `description`, and/or `isCompleted`. |
| `DELETE` | `/tasks/:id` | Delete one of the authenticated user's tasks. |

For `GET /tasks`, `q` is a case-insensitive substring search across title and description. `status` accepts `all` (default), `open`, or `completed`; other values return `400 Bad Request`. Search and status are combined, and results remain scoped to the authenticated user.

## Checks

- `npm test` runs the Vitest suite.
- `npm run build` compiles the NestJS application.
- `npm run lint` runs Oxlint over `src/` and `test/`.
