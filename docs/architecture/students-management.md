# Students Management - Server-Side Architecture

## Overview

This document describes the server-side architecture for Students Management in the robotics club manager application.

## Architecture Layers

### 1. Server Actions (`/app/actions/students.ts`)

Entry points for all student-related operations. These are Next.js Server Actions that handle:
- Request validation
- Authorization checks
- Database operations
- Cache revalidation
- Error handling

**Key Functions:**
- `getStudents(query)` - Paginated student list with filters
- `getStudent(studentId)` - Single student with full details
- `createStudent(data)` - Create student and add to team
- `updateStudent(data)` - Update student information
- `deleteStudent(studentId)` - Soft delete student
- `addStudentToTeam(data)` - Add existing student to team
- `updateStudentRoles(data)` - Modify student's team roles
- `removeStudentFromTeam(data)` - Remove from team
- `bulkUpdateStudents(data)` - Batch update students
- `bulkAssignToTeam(data)` - Batch assign to team
- `getStudentStats(teamId)` - Team statistics

### 2. Validation Layer (`/lib/validations/student.ts`)

Zod schemas for all input validation:
- `studentFormSchema` - Base student form validation
- `createStudentSchema` - Create with team assignment
- `updateStudentSchema` - Partial update validation
- `addStudentToTeamSchema` - Team assignment validation
- `updateStudentRolesSchema` - Role modification validation
- `getStudentsQuerySchema` - Query parameters validation

**Validation Rules:**
- Email: Valid email format, unique constraint
- Phone: Valid format (digits, spaces, +, -, ())
- Grade: Integer 6-12
- Graduation Year: Current year to 2050
- Names: Required, max 100 characters
- Bio: Max 5000 characters

### 3. Database Query Layer (`/lib/db/student-queries.ts`)

Optimized Prisma query patterns:
- Reusable include configurations
- Dynamic where clause builders
- Pagination helpers
- Sort order builders

**Query Patterns:**

```typescript
// Lightweight list query
const students = await prisma.student.findMany({
  select: studentListSelect, // Only essential fields
  where: buildStudentWhereClause(filters, coachTeamIds),
  orderBy: buildStudentOrderBy(pagination),
  skip: (page - 1) * pageSize,
  take: pageSize,
})

// Full details query
const student = await prisma.student.findUnique({
  where: { id },
  include: studentWithDetailsInclude, // All relations
})
```

### 4. Authorization Layer (`/lib/authorization.ts`)

Row-level security implementation:
- `requireUser()` - Ensure authenticated
- `getCoachProfile()` - Get coach for user
- `getCoachTeamIds()` - Get accessible teams
- `verifyTeamAccess()` - Check team access
- `verifyTeamWriteAccess()` - Check write permission
- `verifyStudentAccess()` - Check student access
- `verifyBulkStudentAccess()` - Batch verification

**Authorization Rules:**
1. Coaches can only access students on their teams
2. OBSERVER role has read-only access
3. ASSISTANT and HEAD_COACH can modify
4. HEAD_COACH has full permissions

### 5. Error Handling (`/lib/errors.ts`)

Standardized error types:
- `UnauthorizedError` - Not authenticated
- `ForbiddenError` - Insufficient permissions
- `ValidationError` - Invalid input
- `NotFoundError` - Resource not found
- `ConflictError` - Duplicate/conflict
- `DatabaseError` - Database operation failed

**Error Flow:**

```typescript
return handleActionError(async () => {
  // Action logic
  throw new ValidationError('Invalid data', {
    email: ['Email already exists']
  })
})

// Returns standardized result:
{
  success: false,
  error: {
    message: 'Invalid data',
    code: 'VALIDATION_ERROR',
    errors: { email: ['Email already exists'] }
  }
}
```

## Data Flow

### Creating a Student

```
Client Form Submission
    ↓
Server Action: createStudent(data)
    ↓
1. Validate with createStudentSchema
    ↓
2. Get authenticated user → getCoachProfile
    ↓
3. Verify team write access
    ↓
4. Check for duplicate email
    ↓
5. Transaction:
   - Create student record
   - Create team membership
    ↓
6. Revalidate cache paths
    ↓
Return { success: true, data: { id } }
```

### Fetching Students

```
Client Request with filters
    ↓
Server Action: getStudents(query)
    ↓
1. Validate query params
    ↓
2. Get coach's accessible teams
    ↓
3. Build WHERE clause (filters + team access)
    ↓
4. Get total count
    ↓
5. Fetch paginated results with lightweight select
    ↓
Return paginated response
```

## Performance Optimizations

### 1. Query Optimization

**Use Selective Includes:**
```typescript
// List view - lightweight
select: studentListSelect // Only needed fields

// Detail view - comprehensive
include: studentWithDetailsInclude // All relations
```

**Filter at Database Level:**
```typescript
where: {
  active: true,
  teams: {
    some: {
      teamId: { in: coachTeamIds },
      active: true,
    },
  },
}
```

**Use Indexes:**
The schema includes strategic indexes:
- `@@index([email])` - Fast email lookups
- `@@index([active])` - Filter by status
- `@@index([teamId, studentId])` - Team membership queries

### 2. Pagination Strategy

Always paginate large lists:
```typescript
const { skip, take } = getPaginationParams({ page, pageSize })
const students = await prisma.student.findMany({
  skip,
  take,
  // ...
})
```

Default page size: 20, max: 100

### 3. N+1 Query Prevention

Use `include` instead of separate queries:
```typescript
// Bad - N+1 queries
const students = await prisma.student.findMany()
for (const student of students) {
  const teams = await prisma.teamMember.findMany({
    where: { studentId: student.id }
  })
}

// Good - single query
const students = await prisma.student.findMany({
  include: {
    teams: {
      include: { team: true }
    }
  }
})
```

### 4. Batch Operations

Use `createMany`, `updateMany` for bulk operations:
```typescript
await prisma.teamMember.createMany({
  data: studentIds.map(id => ({
    studentId: id,
    teamId,
    primaryRole,
  })),
})
```

### 5. Transactions

Use transactions for multi-step operations:
```typescript
await prisma.$transaction(async (tx) => {
  const student = await tx.student.create({ data })
  await tx.teamMember.create({ data: { studentId: student.id } })
  return student
})
```

## Caching Strategy

### Next.js Cache Revalidation

Revalidate paths after mutations:
```typescript
revalidatePath('/dashboard/students')
revalidatePath(`/dashboard/students/${studentId}`)
revalidatePath(`/dashboard/teams/${teamId}`)
```

### Server Component Caching

Server Components automatically cache fetch results. Use:
- Route segment config: `export const revalidate = 3600` (1 hour)
- Manual revalidation after mutations

## Security Considerations

### 1. Row-Level Security

Every query filters by coach's accessible teams:
```typescript
where: {
  teams: {
    some: {
      teamId: { in: coachTeamIds }
    }
  }
}
```

### 2. Input Validation

All inputs validated with Zod before processing:
```typescript
const validated = createStudentSchema.parse(data)
```

### 3. SQL Injection Prevention

Prisma provides parameterized queries automatically.

### 4. Authorization Checks

Every action verifies permissions:
```typescript
await verifyTeamWriteAccess(coachId, teamId)
await verifyStudentAccess(coachId, studentId)
```

## Database Schema

### Student Table

```prisma
model Student {
  id          String   @id @default(cuid())
  firstName   String
  lastName    String
  email       String?  @unique
  phone       String?
  grade       Int?     // 6-12
  gradYear    Int?     // Graduation year

  parentName  String?
  parentEmail String?
  parentPhone String?

  bio         String?  @db.Text
  avatar      String?
  active      Boolean  @default(true)

  teams       TeamMember[]
  // ... other relations

  @@index([email])
  @@index([active])
}
```

### TeamMember Table

```prisma
model TeamMember {
  id             String     @id @default(cuid())
  teamId         String
  studentId      String
  primaryRole    TeamRole   @default(MEMBER)
  secondaryRoles TeamRole[] @default([])
  joinedAt       DateTime   @default(now())
  leftAt         DateTime?
  active         Boolean    @default(true)

  @@unique([teamId, studentId])
  @@index([studentId])
  @@index([teamId, active])
}
```

## Error Handling Examples

### Validation Error

```typescript
throw new ValidationError('Invalid data', {
  email: ['Email is required', 'Email must be valid'],
  grade: ['Grade must be between 6 and 12'],
})
```

### Authorization Error

```typescript
throw new ForbiddenError('You do not have access to this team')
```

### Database Error

```typescript
// Prisma unique constraint violation (P2002)
// Automatically caught and converted to:
{
  success: false,
  error: {
    message: 'A record with this email already exists',
    code: 'CONFLICT'
  }
}
```

## Testing Recommendations

### Unit Tests

Test validation schemas:
```typescript
it('validates student email', () => {
  expect(() => studentFormSchema.parse({
    email: 'invalid'
  })).toThrow()
})
```

### Integration Tests

Test server actions:
```typescript
it('creates student with team membership', async () => {
  const result = await createStudent({
    firstName: 'John',
    lastName: 'Doe',
    teamId: 'team-123',
    // ...
  })
  expect(result.success).toBe(true)
})
```

### Authorization Tests

Test access control:
```typescript
it('denies access to other teams students', async () => {
  const result = await getStudent('student-from-other-team')
  expect(result.success).toBe(false)
  expect(result.error.code).toBe('FORBIDDEN')
})
```

## Future Enhancements

### Potential Optimizations

1. **Redis Caching**
   - Cache student lists by team
   - Cache student details
   - Invalidate on mutations

2. **DataLoader Pattern**
   - Batch student lookups
   - Reduce database queries in GraphQL-like scenarios

3. **Search Improvements**
   - PostgreSQL full-text search
   - Elasticsearch integration for fuzzy search

4. **Analytics**
   - Track student activity
   - Generate insights on team composition
   - Skills gap analysis

### Scalability Considerations

1. **Database**
   - Add read replicas for queries
   - Partition by season/year
   - Archive old students

2. **Caching**
   - Implement Redis for session caching
   - Cache frequently accessed data
   - Use CDN for avatars

3. **API**
   - Implement rate limiting
   - Add request queuing for bulk operations
   - Consider GraphQL for complex queries
