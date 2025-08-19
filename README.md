## NestJs

Framework TypeScript starter repository.

## Folder structure

```bash
boilerplate/
├── src/                    # Source code
│   ├── common/            # Shared utilities and helpers
│   │   ├── decorators/
│   │   ├── dto/
│   │   ├── filters/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   ├── pipes/
│   │   └── types/
│   ├── config/           # Configuration files
│   │   ├── database.config.ts
│   │   └── app.config.ts
│   ├── modules/         # Feature modules
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.module.ts
│   │   │   └── dto/
│   │   ├── users/
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   ├── users.module.ts
│   │   │   ├── entities/
│   │   │   │   └── user.entity.ts
│   │   │   └── dto/
│   │   └── [other-modules]/
│   ├── database/        # Database-related files
│   │   ├── migrations/
│   │   ├── seeds/
│   │   └── database.module.ts
│   ├── app.module.ts    # Root module
│   ├── main.ts         # Application bootstrap
│   └── app.service.ts  # Optional root service
├── test/               # Test files
│   ├── unit/
│   ├── e2e/
│   └── jest.config.js
├── public/            # Static files (optional)
│   └── assets/
├── docs/             # Documentation
├── scripts/         # Build/deployment scripts
├── .env             # Environment variables
├── .eslintrc.js     # ESLint configuration
├── .prettierrc     # Prettier configuration
├── tsconfig.json   # TypeScript configuration
├── nest-cli.json   # Nest CLI configuration
├── package.json    # Dependencies and scripts
└── README.md       # Project documentation
```

## Business logic

### Topic Idea: "TaskSync - Collaborative Task Manager"

**Concept**: A web application where users can manage their personal tasks and collaborate with others by assigning tasks to team members. The app will have user authentication, a login system, and CRUD operations for both users (e.g., team members) and tasks (the main entity).

### Main topics

1. **Users**: Represents team members who can log in, manage their profiles, and interact with tasks.
2. **Entity**: Tasks as the core entity with properties like title, description, status, priority, assigned user, and due date.
3. **Functionalities**: Authentication ensures secure access, login ties users to their tasks, and CRUD allows managing both users and tasks.

### Roles

1. **Admin**: can manage users (create, edit, delete)
2. **Customer**: can create, edit, and delete tasks. Can assign tasks to users (Customers or Editors). Can create comments on tasks.
3. **Editor**: can change the status of tasks. Can create comments on tasks.

## Start project

1. Download modules

```bash
npm i
```

2. Create .env file
3. Run migrations

```bash
npm run migration:run
```

4. Run seed

```bash
npm run seed:run:relational
```

## Database changes

1. Update entities
2. Generate migration

```bash
npm run migration:generate -- src/database/migrations/MigrationName
```

3. Run migrations

```bash
npm run migration:run
```
