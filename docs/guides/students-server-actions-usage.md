# Students Server Actions - Usage Guide

This guide demonstrates how to use the student server actions in your Next.js components.

## Import Server Actions

```typescript
import {
  getStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
  addStudentToTeam,
  updateStudentRoles,
  removeStudentFromTeam,
  bulkUpdateStudents,
  bulkAssignToTeam,
  getStudentStats,
} from '@/app/actions/students'
```

## Common Use Cases

### 1. Display Student List (Server Component)

```typescript
// app/dashboard/students/page.tsx
import { getStudents } from '@/app/actions/students'

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string; grade?: string }
}) {
  const result = await getStudents({
    page: Number(searchParams.page) || 1,
    pageSize: 20,
    search: searchParams.search,
    grade: searchParams.grade ? Number(searchParams.grade) : undefined,
    sortBy: 'lastName',
    sortOrder: 'asc',
  })

  if (!result.success) {
    return <div>Error: {result.error.message}</div>
  }

  const { students, total, page, totalPages } = result.data

  return (
    <div>
      <h1>Students ({total})</h1>

      <StudentTable students={students} />

      <Pagination
        currentPage={page}
        totalPages={totalPages}
      />
    </div>
  )
}
```

### 2. Student Detail Page (Server Component)

```typescript
// app/dashboard/students/[id]/page.tsx
import { getStudent } from '@/app/actions/students'
import { notFound } from 'next/navigation'

export default async function StudentDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const result = await getStudent(params.id)

  if (!result.success) {
    if (result.error.code === 'NOT_FOUND') {
      notFound()
    }
    return <div>Error: {result.error.message}</div>
  }

  const student = result.data

  return (
    <div>
      <h1>{student.firstName} {student.lastName}</h1>

      <StudentProfile student={student} />

      <StudentTeams teams={student.teams} />

      <StudentSkills skills={student.skills} />

      <StudentTasks tasks={student.tasks} />
    </div>
  )
}
```

### 3. Create Student Form (Client Component)

```typescript
// components/forms/create-student-form.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createStudent } from '@/app/actions/students'
import { TeamRole } from '@prisma/client'

export function CreateStudentForm({ teamId }: { teamId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string[]>>({})

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setErrors({})

    const data = {
      teamId,
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      grade: formData.get('grade') ? Number(formData.get('grade')) : null,
      gradYear: formData.get('gradYear') ? Number(formData.get('gradYear')) : null,
      primaryRole: (formData.get('primaryRole') as TeamRole) || TeamRole.MEMBER,
      parentEmail: formData.get('parentEmail') as string,
      parentPhone: formData.get('parentPhone') as string,
      active: true,
    }

    const result = await createStudent(data)

    if (!result.success) {
      setErrors(result.error.errors || {})
      setLoading(false)
      return
    }

    // Success - redirect to student page
    router.push(`/dashboard/students/${result.data.id}`)
  }

  return (
    <form action={handleSubmit}>
      <div>
        <label htmlFor="firstName">First Name *</label>
        <input
          id="firstName"
          name="firstName"
          required
          className={errors.firstName ? 'error' : ''}
        />
        {errors.firstName && (
          <p className="error">{errors.firstName[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="lastName">Last Name *</label>
        <input
          id="lastName"
          name="lastName"
          required
          className={errors.lastName ? 'error' : ''}
        />
        {errors.lastName && (
          <p className="error">{errors.lastName[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          className={errors.email ? 'error' : ''}
        />
        {errors.email && (
          <p className="error">{errors.email[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="grade">Grade</label>
        <select id="grade" name="grade">
          <option value="">Select grade</option>
          {[6, 7, 8, 9, 10, 11, 12].map(g => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="primaryRole">Team Role</label>
        <select id="primaryRole" name="primaryRole">
          {Object.values(TeamRole).map(role => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Student'}
      </button>
    </form>
  )
}
```

### 4. Update Student Form (Client Component)

```typescript
// components/forms/edit-student-form.tsx
'use client'

import { useState, useTransition } from 'react'
import { updateStudent } from '@/app/actions/students'

export function EditStudentForm({ student }: { student: any }) {
  const [isPending, startTransition] = useTransition()
  const [errors, setErrors] = useState<Record<string, string[]>>({})

  async function handleSubmit(formData: FormData) {
    setErrors({})

    const data = {
      id: student.id,
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string || undefined,
      grade: formData.get('grade') ? Number(formData.get('grade')) : null,
      bio: formData.get('bio') as string || undefined,
    }

    startTransition(async () => {
      const result = await updateStudent(data)

      if (!result.success) {
        setErrors(result.error.errors || {})
        return
      }

      // Success - form will refresh automatically
    })
  }

  return (
    <form action={handleSubmit}>
      <input
        name="firstName"
        defaultValue={student.firstName}
        required
      />
      {errors.firstName && <p>{errors.firstName[0]}</p>}

      <input
        name="lastName"
        defaultValue={student.lastName}
        required
      />

      <input
        name="email"
        type="email"
        defaultValue={student.email || ''}
      />

      <select name="grade" defaultValue={student.grade || ''}>
        <option value="">Select grade</option>
        {[6, 7, 8, 9, 10, 11, 12].map(g => (
          <option key={g} value={g}>{g}</option>
        ))}
      </select>

      <textarea
        name="bio"
        defaultValue={student.bio || ''}
        rows={4}
      />

      <button type="submit" disabled={isPending}>
        {isPending ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  )
}
```

### 5. Team Roster Management

```typescript
// app/dashboard/teams/[id]/roster/page.tsx
import { getStudents, getStudentStats } from '@/app/actions/students'

export default async function TeamRosterPage({
  params,
}: {
  params: { id: string }
}) {
  const teamId = params.id

  // Get students on this team
  const studentsResult = await getStudents({
    teamId,
    active: true,
    page: 1,
    pageSize: 100,
    sortBy: 'lastName',
    sortOrder: 'asc',
  })

  // Get statistics
  const statsResult = await getStudentStats(teamId)

  if (!studentsResult.success || !statsResult.success) {
    return <div>Error loading roster</div>
  }

  const { students } = studentsResult.data
  const stats = statsResult.data

  return (
    <div>
      <h1>Team Roster</h1>

      <TeamStats stats={stats} />

      <StudentRoster students={students} teamId={teamId} />

      <AddStudentButton teamId={teamId} />
    </div>
  )
}
```

### 6. Bulk Operations

```typescript
// components/student-bulk-actions.tsx
'use client'

import { bulkUpdateStudents, bulkAssignToTeam } from '@/app/actions/students'

export function StudentBulkActions({
  selectedStudentIds,
}: {
  selectedStudentIds: string[]
}) {
  async function handleBulkGradeUpdate(newGrade: number) {
    const result = await bulkUpdateStudents({
      studentIds: selectedStudentIds,
      updates: {
        grade: newGrade,
      },
    })

    if (result.success) {
      alert(`Updated ${result.data.updated} students`)
    }
  }

  async function handleBulkAssignToTeam(teamId: string) {
    const result = await bulkAssignToTeam({
      studentIds: selectedStudentIds,
      teamId,
      primaryRole: 'MEMBER',
    })

    if (result.success) {
      alert(`Assigned ${result.data.assigned} students to team`)
    }
  }

  return (
    <div>
      <button onClick={() => handleBulkGradeUpdate(9)}>
        Set Grade to 9
      </button>

      <button onClick={() => handleBulkAssignToTeam('team-123')}>
        Add to Team
      </button>
    </div>
  )
}
```

### 7. Add Student to Team

```typescript
// components/add-student-to-team-modal.tsx
'use client'

import { useState } from 'react'
import { addStudentToTeam } from '@/app/actions/students'
import { TeamRole } from '@prisma/client'

export function AddStudentToTeamModal({
  teamId,
  availableStudents,
}: {
  teamId: string
  availableStudents: { id: string; name: string }[]
}) {
  const [selectedStudentId, setSelectedStudentId] = useState('')
  const [primaryRole, setPrimaryRole] = useState<TeamRole>(TeamRole.MEMBER)
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    if (!selectedStudentId) return

    setLoading(true)

    const result = await addStudentToTeam({
      studentId: selectedStudentId,
      teamId,
      primaryRole,
    })

    if (result.success) {
      // Close modal and refresh
      window.location.reload()
    } else {
      alert(result.error.message)
      setLoading(false)
    }
  }

  return (
    <div>
      <h2>Add Student to Team</h2>

      <select
        value={selectedStudentId}
        onChange={(e) => setSelectedStudentId(e.target.value)}
      >
        <option value="">Select student</option>
        {availableStudents.map(student => (
          <option key={student.id} value={student.id}>
            {student.name}
          </option>
        ))}
      </select>

      <select
        value={primaryRole}
        onChange={(e) => setPrimaryRole(e.target.value as TeamRole)}
      >
        {Object.values(TeamRole).map(role => (
          <option key={role} value={role}>{role}</option>
        ))}
      </select>

      <button onClick={handleSubmit} disabled={loading}>
        Add to Team
      </button>
    </div>
  )
}
```

### 8. Student Search with Filters

```typescript
// components/student-search.tsx
'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export function StudentSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [grade, setGrade] = useState(searchParams.get('grade') || '')
  const [active, setActive] = useState(searchParams.get('active') || 'true')

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()

    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (grade) params.set('grade', grade)
    if (active !== 'all') params.set('active', active)

    router.push(`/dashboard/students?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSearch}>
      <input
        type="text"
        placeholder="Search by name or email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <select value={grade} onChange={(e) => setGrade(e.target.value)}>
        <option value="">All Grades</option>
        {[6, 7, 8, 9, 10, 11, 12].map(g => (
          <option key={g} value={g}>Grade {g}</option>
        ))}
      </select>

      <select value={active} onChange={(e) => setActive(e.target.value)}>
        <option value="all">All Status</option>
        <option value="true">Active Only</option>
        <option value="false">Inactive Only</option>
      </select>

      <button type="submit">Search</button>
    </form>
  )
}
```

### 9. Update Student Roles

```typescript
// components/student-role-editor.tsx
'use client'

import { useState } from 'react'
import { updateStudentRoles } from '@/app/actions/students'
import { TeamRole } from '@prisma/client'

export function StudentRoleEditor({
  studentId,
  teamId,
  currentPrimaryRole,
  currentSecondaryRoles,
}: {
  studentId: string
  teamId: string
  currentPrimaryRole: TeamRole
  currentSecondaryRoles: TeamRole[]
}) {
  const [primaryRole, setPrimaryRole] = useState(currentPrimaryRole)
  const [secondaryRoles, setSecondaryRoles] = useState<TeamRole[]>(
    currentSecondaryRoles
  )
  const [loading, setLoading] = useState(false)

  async function handleSave() {
    setLoading(true)

    const result = await updateStudentRoles({
      studentId,
      teamId,
      primaryRole,
      secondaryRoles,
    })

    if (result.success) {
      alert('Roles updated successfully')
    } else {
      alert(result.error.message)
    }

    setLoading(false)
  }

  function toggleSecondaryRole(role: TeamRole) {
    if (secondaryRoles.includes(role)) {
      setSecondaryRoles(secondaryRoles.filter(r => r !== role))
    } else {
      setSecondaryRoles([...secondaryRoles, role])
    }
  }

  return (
    <div>
      <h3>Primary Role</h3>
      <select
        value={primaryRole}
        onChange={(e) => setPrimaryRole(e.target.value as TeamRole)}
      >
        {Object.values(TeamRole).map(role => (
          <option key={role} value={role}>{role}</option>
        ))}
      </select>

      <h3>Secondary Roles</h3>
      {Object.values(TeamRole).map(role => (
        <label key={role}>
          <input
            type="checkbox"
            checked={secondaryRoles.includes(role)}
            onChange={() => toggleSecondaryRole(role)}
            disabled={role === primaryRole}
          />
          {role}
        </label>
      ))}

      <button onClick={handleSave} disabled={loading}>
        {loading ? 'Saving...' : 'Save Roles'}
      </button>
    </div>
  )
}
```

### 10. Delete Student with Confirmation

```typescript
// components/delete-student-button.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteStudent } from '@/app/actions/students'

export function DeleteStudentButton({ studentId }: { studentId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm('Are you sure you want to deactivate this student?')) {
      return
    }

    setLoading(true)

    const result = await deleteStudent(studentId)

    if (result.success) {
      router.push('/dashboard/students')
    } else {
      alert(result.error.message)
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="btn-danger"
    >
      {loading ? 'Deactivating...' : 'Deactivate Student'}
    </button>
  )
}
```

## Error Handling Patterns

### Display Validation Errors

```typescript
if (!result.success && result.error.errors) {
  // Field-level errors
  Object.entries(result.error.errors).forEach(([field, messages]) => {
    console.log(`${field}: ${messages.join(', ')}`)
  })
}
```

### Handle Different Error Types

```typescript
const result = await createStudent(data)

if (!result.success) {
  switch (result.error.code) {
    case 'VALIDATION_ERROR':
      // Show validation errors
      setFieldErrors(result.error.errors)
      break

    case 'CONFLICT':
      // Email already exists
      alert('A student with this email already exists')
      break

    case 'FORBIDDEN':
      // No permission
      alert('You do not have permission to perform this action')
      break

    default:
      // Generic error
      alert(result.error.message)
  }
}
```

## Performance Tips

1. **Use Server Components** for initial data loading
2. **Implement optimistic updates** in client components
3. **Paginate large lists** (default 20 items per page)
4. **Use search params** for filters instead of state
5. **Cache student lists** with Next.js automatic caching
6. **Revalidate paths** after mutations to update cache

## Best Practices

1. Always handle error cases
2. Show loading states during async operations
3. Validate on client side before server action
4. Use TypeScript for type safety
5. Display user-friendly error messages
6. Implement confirmation dialogs for destructive actions
7. Use form actions for progressive enhancement
8. Keep server actions focused and single-purpose
