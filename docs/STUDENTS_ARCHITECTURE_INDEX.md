# Students Management - Architecture Index

Complete server-side architecture for Students Management in the robotics club manager.

## Quick Links

- [API Reference](./API_REFERENCE_STUDENTS.md) - Quick reference for all server actions
- [Usage Guide](./guides/students-server-actions-usage.md) - Practical examples and patterns
- [Architecture Details](./architecture/students-management.md) - Deep dive into design

## File Structure

```
src/
├── app/
│   └── actions/
│       └── students.ts                    # Server actions (main entry points)
├── lib/
│   ├── validations/
│   │   └── student.ts                     # Zod schemas and type exports
│   ├── db/
│   │   └── student-queries.ts             # Prisma query patterns
│   ├── errors.ts                          # Error handling utilities
│   ├── authorization.ts                   # Authorization helpers
│   ├── prisma.ts                          # Prisma client singleton
│   └── auth-helpers.ts                    # Authentication helpers
└── types/
    └── student.ts                         # TypeScript types

docs/
├── API_REFERENCE_STUDENTS.md              # API reference
├── guides/
│   └── students-server-actions-usage.md   # Usage examples
└── architecture/
    └── students-management.md             # Architecture documentation
```

## Layer Overview

### 1. Server Actions (`/app/actions/students.ts`)

**Purpose:** Entry points for all student operations

**Functions:**
- `getStudents()` - List with filters and pagination
- `getStudent()` - Single student details
- `createStudent()` - Create and assign to team
- `updateStudent()` - Update information
- `deleteStudent()` - Soft delete
- `addStudentToTeam()` - Team assignment
- `updateStudentRoles()` - Role management
- `removeStudentFromTeam()` - Remove from team
- `bulkUpdateStudents()` - Batch updates
- `bulkAssignToTeam()` - Batch assignments
- `getStudentStats()` - Team statistics

### 2. Validation Layer (`/lib/validations/student.ts`)

**Purpose:** Input validation with Zod

**Schemas:**
- `studentFormSchema` - Base form validation
- `createStudentSchema` - Create validation
- `updateStudentSchema` - Update validation
- `addStudentToTeamSchema` - Team assignment
- `getStudentsQuerySchema` - Query parameters
- `bulkUpdateStudentsSchema` - Bulk operations

**Features:**
- Type-safe validation
- Custom error messages
- Format validation (email, phone)
- Range validation (grade, year)
- Type inference for TypeScript

### 3. Database Layer (`/lib/db/student-queries.ts`)

**Purpose:** Optimized Prisma query patterns

**Exports:**
- `studentBaseInclude` - Minimal includes
- `studentWithDetailsInclude` - Full includes
- `studentListSelect` - List view select
- `buildStudentWhereClause()` - Dynamic filters
- `buildStudentOrderBy()` - Sort ordering
- `getPaginationParams()` - Pagination helpers

**Optimizations:**
- Selective includes for performance
- N+1 query prevention
- Index usage
- Pagination support

### 4. Authorization Layer (`/lib/authorization.ts`)

**Purpose:** Row-level security and permissions

**Functions:**
- `requireUser()` - Ensure authenticated
- `getCoachProfile()` - Get coach data
- `getCoachTeamIds()` - Accessible teams
- `verifyTeamAccess()` - Check team access
- `verifyTeamWriteAccess()` - Check write permission
- `verifyStudentAccess()` - Check student access
- `verifyBulkStudentAccess()` - Batch verification

**Security:**
- Coach can only access students on their teams
- Role-based permissions (OBSERVER, ASSISTANT, HEAD_COACH)
- Team membership verification
- Bulk operation security

### 5. Error Handling (`/lib/errors.ts`)

**Purpose:** Standardized error handling

**Error Types:**
- `UnauthorizedError` (401)
- `ForbiddenError` (403)
- `NotFoundError` (404)
- `ValidationError` (400)
- `ConflictError` (409)
- `DatabaseError` (500)

**Features:**
- Consistent error format
- Field-level validation errors
- Prisma error translation
- Safe error messages

## Common Patterns

### Creating a Student

```typescript
const result = await createStudent({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@school.edu',
  grade: 9,
  teamId: 'team-123',
  primaryRole: 'PROGRAMMER',
})

if (result.success) {
  const { id } = result.data
  // Success
} else {
  const { message, code, errors } = result.error
  // Handle error
}
```

### Listing Students

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

if (result.success) {
  const { students, total, totalPages } = result.data
  // Render list
}
```

### Error Handling

```typescript
if (!result.success) {
  switch (result.error.code) {
    case 'VALIDATION_ERROR':
      setFieldErrors(result.error.errors)
      break
    case 'CONFLICT':
      alert('Email already exists')
      break
    case 'FORBIDDEN':
      alert('No permission')
      break
    default:
      alert(result.error.message)
  }
}
```

## Database Schema

### Student Model

```prisma
model Student {
  id          String   @id @default(cuid())
  firstName   String
  lastName    String
  email       String?  @unique
  grade       Int?
  gradYear    Int?
  active      Boolean  @default(true)

  teams       TeamMember[]
  tasks       TaskAssignment[]
  skills      StudentSkill[]
  // ... other relations

  @@index([email])
  @@index([active])
}
```

### TeamMember Model

```prisma
model TeamMember {
  id             String     @id @default(cuid())
  teamId         String
  studentId      String
  primaryRole    TeamRole   @default(MEMBER)
  secondaryRoles TeamRole[] @default([])
  active         Boolean    @default(true)
  leftAt         DateTime?

  @@unique([teamId, studentId])
  @@index([studentId])
  @@index([teamId, active])
}
```

## Performance Guidelines

### Query Optimization

1. **Use appropriate includes**
   - List: `studentListSelect` (lightweight)
   - Detail: `studentWithDetailsInclude` (full)

2. **Always paginate**
   - Default: 20 items
   - Max: 100 items

3. **Filter at database level**
   - Use Prisma where clauses
   - Avoid client-side filtering

4. **Prevent N+1 queries**
   - Use includes for relations
   - Avoid loops with queries

### Caching Strategy

1. **Server Components** - Automatic caching
2. **Revalidate on mutations** - Update cache
3. **Use search params** - Preserve filters in URL

## Authorization Matrix

| Action | Observer | Assistant | Head Coach |
|--------|----------|-----------|------------|
| View students | ✓ | ✓ | ✓ |
| Create student | ✗ | ✓ | ✓ |
| Update student | ✗ | ✓ | ✓ |
| Delete student | ✗ | ✗ | ✓ |
| Manage roles | ✗ | ✓ | ✓ |
| Bulk operations | ✗ | ✓ | ✓ |

## Validation Rules

| Field | Rule |
|-------|------|
| firstName | Required, max 100 chars |
| lastName | Required, max 100 chars |
| email | Valid email, unique, optional |
| phone | Valid format, optional |
| grade | Integer 6-12, optional |
| gradYear | Integer current-2050, optional |
| bio | Max 5000 chars, optional |

## Testing Checklist

### Unit Tests
- [ ] Validation schemas with valid/invalid inputs
- [ ] Query builders produce correct SQL
- [ ] Error formatting

### Integration Tests
- [ ] Create student with team membership
- [ ] Update student information
- [ ] Soft delete student
- [ ] Add/remove team membership
- [ ] Bulk operations
- [ ] Search and filters
- [ ] Pagination

### Authorization Tests
- [ ] Coach can access own team students
- [ ] Coach cannot access other team students
- [ ] Observer has read-only access
- [ ] Role-based permissions enforced

## Migration Checklist

When deploying:

1. [ ] Run Prisma migrations
2. [ ] Verify indexes created
3. [ ] Test authorization rules
4. [ ] Verify cache revalidation
5. [ ] Test error handling
6. [ ] Load test pagination
7. [ ] Verify email uniqueness constraint

## Future Enhancements

### Planned Features
- Redis caching for student lists
- Full-text search with PostgreSQL
- Student activity tracking
- Skills gap analysis
- Advanced reporting

### Scalability
- Read replicas for queries
- Partition by season
- Archive inactive students
- CDN for avatars

## Support

For implementation help:
1. Check [API Reference](./API_REFERENCE_STUDENTS.md)
2. Review [Usage Examples](./guides/students-server-actions-usage.md)
3. Read [Architecture Details](./architecture/students-management.md)

## Related Modules

- Teams Management (team CRUD operations)
- Tasks Management (task assignments)
- Skills Management (skill tracking)
- Curriculum (learning progress)
- Report Cards (performance reviews)
