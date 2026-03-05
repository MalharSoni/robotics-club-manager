# Students Management - Architecture Summary

Complete server-side architecture for Students Management module.

## Files Created

### Core Server Architecture

1. **Server Actions** - `/src/app/actions/students.ts`
   - 11 server actions for CRUD and bulk operations
   - Complete type safety with TypeScript
   - Authorization and validation integration
   - Cache revalidation after mutations

2. **Validation Schemas** - `/src/lib/validations/student.ts`
   - Zod schemas for all operations
   - Type-safe validation with error messages
   - Query parameter validation
   - Type exports for TypeScript

3. **Database Queries** - `/src/lib/db/student-queries.ts`
   - Optimized Prisma query patterns
   - Reusable include configurations
   - Dynamic where clause builders
   - Pagination and sorting helpers
   - Type-safe query results

4. **Authorization** - `/src/lib/authorization.ts`
   - Row-level security implementation
   - Coach team access verification
   - Role-based permissions
   - Bulk operation authorization

5. **Error Handling** - `/src/lib/errors.ts`
   - Standardized error types
   - ActionResult wrapper type
   - Prisma error translation
   - Field-level validation errors

6. **Type Definitions** - `/src/types/student.ts`
   - Domain type definitions
   - Display types for UI
   - Filter and sort types
   - Activity and statistics types

7. **Utility Helpers** - `/src/lib/utils/student-helpers.ts`
   - Name formatting functions
   - Grade/year calculations
   - Phone number formatting
   - Role display helpers
   - Grouping and sorting utilities
   - CSV export functions

### Documentation

8. **Architecture Documentation** - `/docs/architecture/students-management.md`
   - Detailed architecture overview
   - Layer-by-layer breakdown
   - Data flow diagrams
   - Performance optimizations
   - Security considerations
   - Testing recommendations

9. **Usage Guide** - `/docs/guides/students-server-actions-usage.md`
   - Practical code examples
   - Common use cases
   - Client and server component patterns
   - Form handling examples
   - Error handling patterns
   - Best practices

10. **API Reference** - `/docs/API_REFERENCE_STUDENTS.md`
    - Complete API documentation
    - All function signatures
    - Parameter descriptions
    - Return types
    - Error codes
    - Authorization rules

11. **Architecture Index** - `/docs/STUDENTS_ARCHITECTURE_INDEX.md`
    - Quick reference guide
    - File structure overview
    - Common patterns
    - Testing checklist
    - Migration guide

## Key Features

### Server Actions (11 total)

**Query Actions:**
- `getStudents(query)` - Paginated list with filters
- `getStudent(studentId)` - Single student details
- `getStudentStats(teamId)` - Team statistics

**Mutation Actions:**
- `createStudent(data)` - Create and assign to team
- `updateStudent(data)` - Update information
- `deleteStudent(studentId)` - Soft delete

**Team Management:**
- `addStudentToTeam(data)` - Add to team
- `updateStudentRoles(data)` - Modify roles
- `removeStudentFromTeam(data)` - Remove from team

**Bulk Operations:**
- `bulkUpdateStudents(data)` - Batch updates
- `bulkAssignToTeam(data)` - Batch assignments

### Validation Rules

- **Names**: Required, max 100 characters
- **Email**: Valid format, unique constraint
- **Phone**: Valid format with digits, spaces, +, -, ()
- **Grade**: Integer 6-12
- **Graduation Year**: Current year to 2050
- **Bio**: Max 5000 characters

### Authorization System

**Row-Level Security:**
- Coaches only access students on their teams
- All queries filtered by accessible teams
- Batch operations verify access to all students

**Role-Based Permissions:**
- **OBSERVER**: Read-only access
- **ASSISTANT**: Create, read, update
- **HEAD_COACH**: Full permissions including delete

### Performance Optimizations

1. **Query Optimization**
   - Lightweight selects for list views
   - Full includes only for detail views
   - Strategic database indexes
   - N+1 query prevention

2. **Pagination**
   - Default 20 items per page
   - Maximum 100 items per page
   - Efficient skip/take queries

3. **Batch Operations**
   - `createMany` for bulk inserts
   - `updateMany` for bulk updates
   - Single transaction for multi-step ops

4. **Caching**
   - Automatic Next.js caching
   - Path revalidation after mutations
   - Server Component caching

### Error Handling

**Standard Error Types:**
- `UNAUTHORIZED` (401) - Not authenticated
- `FORBIDDEN` (403) - No permission
- `NOT_FOUND` (404) - Resource not found
- `VALIDATION_ERROR` (400) - Invalid input
- `CONFLICT` (409) - Duplicate email
- `DATABASE_ERROR` (500) - DB operation failed

**Error Response Format:**
```typescript
{
  success: false,
  error: {
    message: string,
    code: string,
    errors?: Record<string, string[]>
  }
}
```

## Database Schema

### Student Table
- Personal info (name, email, phone)
- Academic info (grade, gradYear)
- Parent contact (name, email, phone)
- Profile (bio, avatar)
- Active status flag
- Indexes on email and active

### TeamMember Table
- Student-to-team association
- Primary and secondary roles
- Join/leave dates
- Active status flag
- Unique constraint on [teamId, studentId]
- Indexes for fast lookups

## Usage Examples

### Create Student (Server Action)
```typescript
const result = await createStudent({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@school.edu',
  grade: 9,
  teamId: 'team-123',
  primaryRole: 'PROGRAMMER',
})
```

### List Students (Server Component)
```typescript
const result = await getStudents({
  page: 1,
  pageSize: 20,
  search: 'john',
  grade: 9,
  sortBy: 'lastName',
})
```

### Update Student (Client Component)
```typescript
'use client'

const result = await updateStudent({
  id: 'student-123',
  email: 'new@school.edu',
  grade: 10,
})
```

## File Locations (Absolute Paths)

```
/Users/malharsoni/robotics-club-manager/
├── src/
│   ├── app/
│   │   └── actions/
│   │       └── students.ts
│   ├── lib/
│   │   ├── validations/
│   │   │   └── student.ts
│   │   ├── db/
│   │   │   └── student-queries.ts
│   │   ├── utils/
│   │   │   └── student-helpers.ts
│   │   ├── errors.ts
│   │   └── authorization.ts
│   └── types/
│       └── student.ts
└── docs/
    ├── API_REFERENCE_STUDENTS.md
    ├── STUDENTS_ARCHITECTURE_INDEX.md
    ├── architecture/
    │   └── students-management.md
    └── guides/
        └── students-server-actions-usage.md
```

## Next Steps for Implementation

### 1. Install Dependencies (if needed)
```bash
npm install zod
```

### 2. Run Type Check
```bash
npx tsc --noEmit
```

### 3. Test Server Actions
Create test files in `/tests/actions/students.test.ts`

### 4. Create UI Components
- Student list table
- Student detail page
- Create/edit forms
- Search and filters
- Bulk actions toolbar

### 5. Implement Routes
- `/app/dashboard/students/page.tsx` - List view
- `/app/dashboard/students/[id]/page.tsx` - Detail view
- `/app/dashboard/teams/[id]/roster/page.tsx` - Team roster

## Benefits of This Architecture

1. **Type Safety**: Full TypeScript coverage with Zod validation
2. **Security**: Row-level security and authorization
3. **Performance**: Optimized queries and pagination
4. **Maintainability**: Clear separation of concerns
5. **Testability**: Pure functions, easy to test
6. **Error Handling**: Consistent error format
7. **Documentation**: Comprehensive guides and examples
8. **Scalability**: Designed for growth

## Integration Points

This architecture integrates with:
- **Teams**: Team membership and roles
- **Tasks**: Task assignments
- **Skills**: Skill tracking
- **Curriculum**: Learning progress
- **Report Cards**: Performance reviews
- **Projects**: Project roles

## Support

- **API Reference**: `/docs/API_REFERENCE_STUDENTS.md`
- **Usage Guide**: `/docs/guides/students-server-actions-usage.md`
- **Architecture**: `/docs/architecture/students-management.md`
- **Index**: `/docs/STUDENTS_ARCHITECTURE_INDEX.md`
