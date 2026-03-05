# Students Server Actions - API Reference

Quick reference for all student-related server actions.

## Table of Contents

- [Query Actions](#query-actions)
- [Mutation Actions](#mutation-actions)
- [Bulk Actions](#bulk-actions)
- [Types](#types)
- [Error Codes](#error-codes)

## Query Actions

### `getStudents(query)`

Fetch paginated list of students with filters.

**Parameters:**
```typescript
{
  // Pagination
  page?: number              // Default: 1
  pageSize?: number          // Default: 20, Max: 100
  sortBy?: 'firstName' | 'lastName' | 'email' | 'grade' | 'gradYear' | 'createdAt' | 'updatedAt'
  sortOrder?: 'asc' | 'desc' // Default: 'asc'

  // Filters
  search?: string            // Search name or email
  grade?: number             // Filter by grade (6-12)
  gradYear?: number          // Filter by graduation year
  active?: boolean           // Filter by active status
  teamId?: string            // Filter by team membership
  role?: TeamRole            // Filter by team role
  hasEmail?: boolean         // Has email address
  hasParentContact?: boolean // Has parent contact
}
```

**Returns:**
```typescript
ActionResult<{
  students: StudentListItem[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}>
```

**Example:**
```typescript
const result = await getStudents({
  page: 1,
  pageSize: 20,
  search: 'john',
  grade: 9,
  active: true,
  sortBy: 'lastName',
  sortOrder: 'asc',
})
```

---

### `getStudent(studentId)`

Fetch a single student with full details.

**Parameters:**
- `studentId: string` - Student CUID

**Returns:**
```typescript
ActionResult<StudentWithDetails>
```

**Includes:**
- Teams with season info
- Skills with proficiency
- Active tasks (up to 10)
- Curriculum progress (up to 10)
- Recent report cards (up to 5)
- Project roles

**Example:**
```typescript
const result = await getStudent('clxxx123456')
if (result.success) {
  const student = result.data
}
```

---

### `getStudentStats(teamId)`

Get statistics for students on a team.

**Parameters:**
- `teamId: string` - Team CUID

**Returns:**
```typescript
ActionResult<{
  total: number
  active: number
  inactive: number
  byGrade: Record<number, number>
  byRole: Record<string, number>
}>
```

**Example:**
```typescript
const result = await getStudentStats('team-123')
// { total: 15, active: 14, inactive: 1, byGrade: { 9: 5, 10: 6, 11: 3, 12: 1 }, ... }
```

---

## Mutation Actions

### `createStudent(data)`

Create a new student and add to team.

**Parameters:**
```typescript
{
  // Required
  firstName: string
  lastName: string
  teamId: string

  // Optional
  email?: string
  phone?: string
  grade?: number | null        // 6-12
  gradYear?: number | null     // Current year to 2050
  parentName?: string
  parentEmail?: string
  parentPhone?: string
  bio?: string
  avatar?: string              // URL
  primaryRole?: TeamRole       // Default: MEMBER
  active?: boolean             // Default: true
}
```

**Returns:**
```typescript
ActionResult<{ id: string }>
```

**Validation:**
- First/last name required (max 100 chars)
- Email must be valid and unique
- Phone must be valid format
- Grade 6-12
- Grad year current to 2050

**Example:**
```typescript
const result = await createStudent({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@school.edu',
  grade: 9,
  gradYear: 2028,
  teamId: 'team-123',
  primaryRole: 'PROGRAMMER',
})
```

---

### `updateStudent(data)`

Update an existing student.

**Parameters:**
```typescript
{
  id: string                   // Required
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  grade?: number | null
  gradYear?: number | null
  parentName?: string
  parentEmail?: string
  parentPhone?: string
  bio?: string
  avatar?: string
  active?: boolean
}
```

**Returns:**
```typescript
ActionResult<void>
```

**Notes:**
- All fields except `id` are optional
- Email uniqueness is checked if changed
- Revalidates cache automatically

**Example:**
```typescript
const result = await updateStudent({
  id: 'student-123',
  grade: 10,
  email: 'new.email@school.edu',
})
```

---

### `deleteStudent(studentId)`

Soft delete a student (sets active = false).

**Parameters:**
- `studentId: string` - Student CUID

**Returns:**
```typescript
ActionResult<void>
```

**Behavior:**
- Sets `student.active = false`
- Sets `teamMember.active = false` for all teams
- Sets `teamMember.leftAt = now()` for all teams
- Does NOT delete data (soft delete)

**Example:**
```typescript
const result = await deleteStudent('student-123')
```

---

### `addStudentToTeam(data)`

Add an existing student to a team.

**Parameters:**
```typescript
{
  studentId: string
  teamId: string
  primaryRole?: TeamRole      // Default: MEMBER
}
```

**Returns:**
```typescript
ActionResult<void>
```

**Validation:**
- Student must exist
- Team must exist
- Coach must have write access to team
- Student not already on team

**Example:**
```typescript
const result = await addStudentToTeam({
  studentId: 'student-123',
  teamId: 'team-456',
  primaryRole: 'BUILDER',
})
```

---

### `updateStudentRoles(data)`

Update a student's roles on a team.

**Parameters:**
```typescript
{
  studentId: string
  teamId: string
  primaryRole: TeamRole
  secondaryRoles?: TeamRole[]  // Default: []
}
```

**Returns:**
```typescript
ActionResult<void>
```

**Example:**
```typescript
const result = await updateStudentRoles({
  studentId: 'student-123',
  teamId: 'team-456',
  primaryRole: 'CAPTAIN',
  secondaryRoles: ['PROGRAMMER', 'DRIVER'],
})
```

---

### `removeStudentFromTeam(data)`

Remove a student from a team.

**Parameters:**
```typescript
{
  studentId: string
  teamId: string
}
```

**Returns:**
```typescript
ActionResult<void>
```

**Behavior:**
- Soft delete: sets `active = false`, `leftAt = now()`
- Does not delete membership record

**Example:**
```typescript
const result = await removeStudentFromTeam({
  studentId: 'student-123',
  teamId: 'team-456',
})
```

---

## Bulk Actions

### `bulkUpdateStudents(data)`

Update multiple students at once.

**Parameters:**
```typescript
{
  studentIds: string[]        // Array of CUIDs
  updates: {
    active?: boolean
    grade?: number            // 6-12
    gradYear?: number         // Current year to 2050
  }
}
```

**Returns:**
```typescript
ActionResult<{ updated: number }>
```

**Example:**
```typescript
const result = await bulkUpdateStudents({
  studentIds: ['student-1', 'student-2', 'student-3'],
  updates: {
    grade: 10,
    gradYear: 2028,
  },
})
// { success: true, data: { updated: 3 } }
```

---

### `bulkAssignToTeam(data)`

Assign multiple students to a team at once.

**Parameters:**
```typescript
{
  studentIds: string[]        // Min: 1
  teamId: string
  primaryRole?: TeamRole      // Default: MEMBER
}
```

**Returns:**
```typescript
ActionResult<{ assigned: number }>
```

**Behavior:**
- Skips students already on the team
- Returns count of newly assigned students

**Example:**
```typescript
const result = await bulkAssignToTeam({
  studentIds: ['student-1', 'student-2', 'student-3'],
  teamId: 'team-456',
  primaryRole: 'MEMBER',
})
// { success: true, data: { assigned: 2 } }  // 1 was already on team
```

---

## Types

### TeamRole Enum

```typescript
enum TeamRole {
  CAPTAIN
  DRIVER
  PROGRAMMER
  BUILDER
  DESIGNER
  SCOUT
  NOTEBOOK
  MEMBER
}
```

### ActionResult

```typescript
type ActionResult<T> =
  | {
      success: true
      data: T
    }
  | {
      success: false
      error: {
        message: string
        code: string
        errors?: Record<string, string[]>
      }
    }
```

### StudentListItem

```typescript
{
  id: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  grade: number | null
  gradYear: number | null
  avatar: string | null
  active: boolean
  createdAt: Date
  updatedAt: Date
  teams: {
    id: string
    primaryRole: TeamRole
    secondaryRoles: TeamRole[]
    team: {
      id: string
      name: string
      teamNumber: string | null
    }
  }[]
}
```

### StudentWithDetails

Extends `StudentListItem` with:
- `teams` - Full team details with season
- `skills` - Student skills with proficiency
- `tasks` - Active task assignments (max 10)
- `curriculumProgress` - In-progress modules (max 10)
- `reportCards` - Recent report cards (max 5)
- `projectRoles` - Project assignments

---

## Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| `UNAUTHORIZED` | 401 | Not authenticated |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid input data |
| `CONFLICT` | 409 | Duplicate email or constraint violation |
| `DATABASE_ERROR` | 500 | Database operation failed |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

### Common Error Scenarios

**Duplicate Email:**
```typescript
{
  success: false,
  error: {
    message: 'A student with this email already exists',
    code: 'CONFLICT'
  }
}
```

**Validation Error:**
```typescript
{
  success: false,
  error: {
    message: 'Invalid data',
    code: 'VALIDATION_ERROR',
    errors: {
      email: ['Invalid email address'],
      grade: ['Grade must be between 6 and 12']
    }
  }
}
```

**Permission Error:**
```typescript
{
  success: false,
  error: {
    message: 'You do not have access to this team',
    code: 'FORBIDDEN'
  }
}
```

**Not Found:**
```typescript
{
  success: false,
  error: {
    message: "Student with identifier 'xyz' not found",
    code: 'NOT_FOUND'
  }
}
```

---

## Authorization Rules

1. **Coaches can only access students on their teams**
2. **OBSERVER role** - Read-only access
3. **ASSISTANT role** - Can create, read, update
4. **HEAD_COACH role** - Full permissions including delete
5. **All queries are filtered by accessible teams**
6. **Bulk operations verify access to all students**

---

## Cache Revalidation

After mutations, these paths are automatically revalidated:

- `createStudent`: `/dashboard/teams/{teamId}`, `/dashboard/students`
- `updateStudent`: `/dashboard/students/{studentId}`, `/dashboard/students`
- `deleteStudent`: `/dashboard/students/{studentId}`, `/dashboard/students`
- `addStudentToTeam`: `/dashboard/teams/{teamId}`, `/dashboard/students/{studentId}`
- `removeStudentFromTeam`: `/dashboard/teams/{teamId}`, `/dashboard/students/{studentId}`
- `bulkUpdateStudents`: `/dashboard/students`
- `bulkAssignToTeam`: `/dashboard/teams/{teamId}`, `/dashboard/students`

---

## Performance Considerations

1. **Pagination**: Default 20 items, max 100 per page
2. **List queries use lightweight select** (not full includes)
3. **Detail queries include all relations** (use sparingly)
4. **Bulk operations are optimized** with `createMany`, `updateMany`
5. **Indexes on**: email, active, team membership
6. **Transactions for multi-step operations**

---

## Related Documentation

- [Architecture Overview](/docs/architecture/students-management.md)
- [Usage Guide](/docs/guides/students-server-actions-usage.md)
- [Database Schema](/prisma/schema.prisma)
