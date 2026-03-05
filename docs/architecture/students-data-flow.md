# Students Management - Data Flow Diagrams

Visual representation of data flow in the Students Management system.

## Architecture Layers

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                          │
├─────────────────────────────────────────────────────────┤
│  Server Components        │     Client Components        │
│  - Student List Page      │     - Create Form            │
│  - Student Detail Page    │     - Edit Form              │
│  - Team Roster Page       │     - Search/Filter UI       │
│                           │     - Bulk Actions           │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│               SERVER ACTIONS LAYER                       │
├─────────────────────────────────────────────────────────┤
│  /app/actions/students.ts                               │
│  - getStudents()          - addStudentToTeam()          │
│  - getStudent()           - updateStudentRoles()        │
│  - createStudent()        - removeStudentFromTeam()     │
│  - updateStudent()        - bulkUpdateStudents()        │
│  - deleteStudent()        - bulkAssignToTeam()          │
│  - getStudentStats()                                    │
└─────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌──────────────┐  ┌──────────────────┐  ┌──────────────┐
│ VALIDATION   │  │  AUTHORIZATION   │  │ ERROR        │
│              │  │                  │  │ HANDLING     │
│ Zod Schemas  │  │ Row-Level        │  │              │
│ Type Safety  │  │ Security         │  │ Standard     │
│ Input Check  │  │ Role-Based       │  │ Errors       │
└──────────────┘  └──────────────────┘  └──────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│              DATABASE QUERY LAYER                        │
├─────────────────────────────────────────────────────────┤
│  /lib/db/student-queries.ts                             │
│  - Query Builders         - Pagination Helpers          │
│  - Include Configs        - Sort Helpers                │
│  - Where Clause Builders  - Type Exports                │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                   PRISMA CLIENT                          │
├─────────────────────────────────────────────────────────┤
│  ORM Layer - Type-safe database access                  │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│               POSTGRESQL DATABASE                        │
├─────────────────────────────────────────────────────────┤
│  Tables: Student, TeamMember, TeamCoach                 │
│  Indexes: email, active, teamId                         │
└─────────────────────────────────────────────────────────┘
```

## Create Student Flow

```
Client Form
    │
    ▼
createStudent() Server Action
    │
    ├─► Validate with Zod Schema
    │   ├─ Check required fields
    │   ├─ Validate email format
    │   └─ Validate grade/year range
    │
    ├─► Get Current User
    │   └─ requireUser()
    │
    ├─► Get Coach Profile
    │   └─ getCoachProfile(userId)
    │
    ├─► Verify Team Access
    │   └─ verifyTeamWriteAccess(coachId, teamId)
    │
    ├─► Check Duplicate Email
    │   └─ prisma.student.findUnique({ where: { email } })
    │
    ├─► Database Transaction
    │   ├─ Create Student Record
    │   │  └─ prisma.student.create({ data })
    │   │
    │   └─ Create Team Membership
    │      └─ prisma.teamMember.create({ data })
    │
    ├─► Revalidate Cache
    │   ├─ revalidatePath('/dashboard/students')
    │   └─ revalidatePath(`/dashboard/teams/${teamId}`)
    │
    └─► Return Result
        └─ { success: true, data: { id } }
```

## Get Students (List) Flow

```
Server Component Request
    │
    ▼
getStudents(query) Server Action
    │
    ├─► Validate Query Params
    │   └─ getStudentsQuerySchema.parse(query)
    │
    ├─► Get Current User & Coach
    │   ├─ requireUser()
    │   └─ getCoachProfile(userId)
    │
    ├─► Get Accessible Teams
    │   └─ getCoachTeamIds(coachId)
    │
    ├─► Build WHERE Clause
    │   └─ buildStudentWhereClause(filters, coachTeamIds)
    │       ├─ Search filter (name/email)
    │       ├─ Grade filter
    │       ├─ Team membership filter
    │       └─ Active status filter
    │
    ├─► Get Total Count
    │   └─ prisma.student.count({ where })
    │
    ├─► Build Query
    │   ├─ Pagination (skip/take)
    │   ├─ Ordering (sortBy/sortOrder)
    │   └─ Select (lightweight fields only)
    │
    ├─► Execute Query
    │   └─ prisma.student.findMany({ where, select, orderBy, skip, take })
    │
    └─► Return Paginated Result
        └─ { students, total, page, pageSize, totalPages }
```

## Authorization Flow

```
Any Server Action
    │
    ▼
requireUser()
    │
    ├─► Get Session
    │   └─ getCurrentUser()
    │
    └─► Verify Authenticated
        └─ Throw UnauthorizedError if not
    │
    ▼
getCoachProfile(userId)
    │
    ├─► Query Coach Profile
    │   └─ prisma.coachProfile.findUnique({ where: { userId } })
    │
    └─► Return Coach with Teams
    │
    ▼
For Team Operations:
verifyTeamAccess(coachId, teamId)
    │
    ├─► Check Team Membership
    │   └─ prisma.teamCoach.findUnique({ where: { teamId_coachId } })
    │
    └─► Verify Role Level
        └─ Throw ForbiddenError if insufficient
    │
    ▼
For Student Operations:
verifyStudentAccess(coachId, studentId)
    │
    ├─► Get Coach's Teams
    │   └─ getCoachTeamIds(coachId)
    │
    ├─► Check Student Membership
    │   └─ prisma.teamMember.findFirst({
    │       where: { studentId, teamId: { in: coachTeamIds } }
    │     })
    │
    └─► Throw ForbiddenError if no match
```

## Error Handling Flow

```
Server Action Execution
    │
    ▼
handleActionError(async () => {
    │
    ├─► Try Execute Action
    │
    └─► Catch Errors
        ├─► AppError (Custom)
        │   └─ Return { success: false, error: { message, code } }
        │
        ├─► Prisma Error (P2002, P2025, P2003)
        │   └─ Translate to user-friendly message
        │
        └─► Unknown Error
            └─ Return generic error message
})
    │
    ▼
Client Receives Result
    │
    ├─► Success: { success: true, data }
    │   └─ Update UI
    │
    └─► Error: { success: false, error }
        ├─ Display error message
        └─ Show field-level errors if validation error
```

## Update Student Flow

```
Client Form Submission
    │
    ▼
updateStudent(data) Server Action
    │
    ├─► Validate with Zod Schema
    │   └─ updateStudentSchema.parse(data)
    │
    ├─► Verify Student Access
    │   └─ verifyStudentAccess(coachId, studentId)
    │
    ├─► Check Email Uniqueness (if changed)
    │   └─ prisma.student.findFirst({
    │       where: { email, id: { not: studentId } }
    │     })
    │
    ├─► Update Database
    │   └─ prisma.student.update({
    │       where: { id },
    │       data: { ...validated fields }
    │     })
    │
    ├─► Revalidate Cache
    │   ├─ revalidatePath(`/dashboard/students/${studentId}`)
    │   └─ revalidatePath('/dashboard/students')
    │
    └─► Return Success
        └─ { success: true }
```

## Bulk Operations Flow

```
Client Bulk Action
    │
    ▼
bulkUpdateStudents(data) or bulkAssignToTeam(data)
    │
    ├─► Validate Input
    │   └─ bulkUpdateStudentsSchema.parse(data)
    │
    ├─► Verify Bulk Access
    │   └─ verifyBulkStudentAccess(coachId, studentIds)
    │       ├─ Get coach's teams
    │       ├─ Check all students are on those teams
    │       └─ Throw error if any student is inaccessible
    │
    ├─► Execute Bulk Operation
    │   └─ For Update:
    │       └─ prisma.student.updateMany({
    │           where: { id: { in: studentIds } },
    │           data: updates
    │         })
    │   └─ For Assign:
    │       ├─ Check existing memberships
    │       └─ prisma.teamMember.createMany({
    │           data: [array of memberships]
    │         })
    │
    ├─► Revalidate Cache
    │   └─ revalidatePath('/dashboard/students')
    │
    └─► Return Count
        └─ { success: true, data: { updated/assigned: count } }
```

## Query Optimization Flow

```
List View Request
    │
    ├─► Use Lightweight Select
    │   └─ studentListSelect (only essential fields)
    │
    ├─► Apply Filters at DB Level
    │   └─ WHERE clause filters data in database
    │
    ├─► Use Pagination
    │   └─ LIMIT/OFFSET to reduce data transfer
    │
    ├─► Include Only Active Relations
    │   └─ teams: { where: { active: true } }
    │
    └─► Result: Fast query, minimal data transfer

Detail View Request
    │
    ├─► Use Full Includes
    │   └─ studentWithDetailsInclude (all relations)
    │
    ├─► Limit Related Data
    │   ├─ tasks: take 10
    │   ├─ curriculumProgress: take 10
    │   └─ reportCards: take 5
    │
    ├─► Order Related Data
    │   └─ Most recent first
    │
    └─► Result: Rich data for detail view
```

## Cache Revalidation Flow

```
Mutation (Create/Update/Delete)
    │
    ├─► Execute Database Operation
    │
    ├─► Operation Successful
    │
    ├─► Revalidate Affected Paths
    │   ├─ Student List: /dashboard/students
    │   ├─ Student Detail: /dashboard/students/[id]
    │   └─ Team Roster: /dashboard/teams/[teamId]
    │
    └─► Next.js Cache Updates
        ├─ Server Component re-renders
        └─ Fresh data on next request
```

## Security Layers

```
Request
    │
    ├─► Layer 1: Authentication
    │   └─ Is user logged in?
    │
    ├─► Layer 2: Coach Profile
    │   └─ Does user have coach profile?
    │
    ├─► Layer 3: Team Membership
    │   └─ Is coach on any teams?
    │
    ├─► Layer 4: Team Access
    │   └─ Does coach have access to this team?
    │
    ├─► Layer 5: Role Permission
    │   └─ Does coach role allow this action?
    │
    ├─► Layer 6: Student Access
    │   └─ Is student on coach's team?
    │
    └─► Allowed: Proceed with operation
```

## Type Safety Flow

```
Client Input
    │
    ▼
Zod Schema Validation
    │
    ├─► Parse & Transform
    │
    ├─► Infer TypeScript Type
    │   └─ type CreateStudentData = z.infer<typeof schema>
    │
    └─► Validated Data
        │
        ▼
Server Action (TypeScript)
    │
    ├─► Type-safe parameters
    │
    ├─► Type-safe database queries
    │   └─ Prisma Client types
    │
    └─► Type-safe return value
        └─ ActionResult<T>
            │
            ▼
Client Component (TypeScript)
    │
    └─► Type-safe result handling
```
