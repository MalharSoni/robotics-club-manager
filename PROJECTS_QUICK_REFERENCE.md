# Projects Management - Quick Reference

## URLs

- Dashboard: `http://localhost:3000/dashboard/projects`
- Project Detail: `http://localhost:3000/dashboard/projects/[id]`

## Key Features

### Dashboard (`/dashboard/projects`)
- View all projects in grid layout
- Filter by status and category
- Sort by recent, name, status, start date
- Search by name or description
- See summary stats (Total, Active, Planning, Completed)
- Create new projects

### Project Detail (`/dashboard/projects/[id]`)

**Tabs:**
1. **Overview** - Project info, stats, and goals preview
2. **Team** - Manage team members and roles
3. **Goals** - Track milestones and completion
4. **Media** - Photo gallery (placeholder)
5. **Activity** - Project timeline

**Actions:**
- Edit project details
- Change project status
- Archive project
- Add/remove team members
- Assign roles and track hours
- Add/complete goals

## Project Properties

### Required Fields
- Name (min 3 chars)
- Category (ROBOT, MECHANISM, AUTONOMOUS, OUTREACH, FUNDRAISING, OTHER)

### Optional Fields
- Description
- Status (default: PLANNING)
- Start Date
- End Date
- Goals (array of strings)
- Cover Image URL

## Status Workflow

```
PLANNING → IN_PROGRESS → TESTING → COMPLETED → ARCHIVED
```

Can skip steps or move backwards as needed.

## Team Roles

- **LEAD** - Project leader
- **MEMBER** - Regular contributor
- **MENTOR** - Advisor/mentor

Custom roles also supported (e.g., "Lead Programmer", "Builder").

## Server Actions Available

```typescript
// Get all projects with optional filters
await getProjects({ status: 'IN_PROGRESS', category: 'ROBOT' })

// Get single project
await getProjectById(projectId)

// Create project
await createProject({ name: '...', category: 'ROBOT', ... })

// Update project
await updateProject({ id: '...', name: 'New Name', ... })

// Update status only
await updateProjectStatus({ id: '...', status: 'COMPLETED' })

// Delete (archive)
await deleteProject(projectId)

// Team management
await assignStudentToProject({ projectId, studentId, role: 'Lead', contributionHours: 10 })
await removeStudentFromProject({ projectId, studentId })
await updateProjectRole({ id: roleId, hoursSpent: 15, contributions: '...' })
```

## Component Usage

### Using ProjectCard
```tsx
import { ProjectCard } from '@/components/projects/project-card'

<ProjectCard project={projectWithRelations} />
```

### Using TeamRoster
```tsx
import { TeamRoster } from '@/components/projects/team-roster'

<TeamRoster
  projectId={project.id}
  roles={project.roles}
  availableStudents={students}
/>
```

### Using MilestoneChecklist
```tsx
import { MilestoneChecklist } from '@/components/projects/milestone-checklist'

<MilestoneChecklist
  projectId={project.id}
  goals={project.goals}
  outcomes={project.outcomes}
  status={project.status}
/>
```

### Using ProjectFormDialog
```tsx
import { ProjectFormDialog } from '@/components/projects/project-form-dialog'

// Create mode
<ProjectFormDialog
  open={isOpen}
  onOpenChange={setIsOpen}
  mode="create"
/>

// Edit mode
<ProjectFormDialog
  open={isOpen}
  onOpenChange={setIsOpen}
  project={existingProject}
  mode="edit"
/>
```

## Color Coding

### Status Colors
- Planning: Gray
- In Progress: Blue
- Testing: Purple
- Completed: Green
- Archived: Slate

### Category Colors
- Robot: Orange
- Mechanism: Blue
- Autonomous: Purple
- Outreach: Green
- Fundraising: Yellow
- Other: Gray

## Database Queries

The system uses Prisma with the following relations:

```typescript
// Project with all relations
{
  include: {
    team: {
      include: {
        season: true,
      },
    },
    roles: {
      include: {
        student: true,
      },
    },
    media: true,
  }
}
```

## Authorization

All actions require:
1. Authenticated user
2. COACH role
3. Team access (user must be coach of the project's team)

## Validation

All inputs validated with Zod schemas before processing.

## Error Handling

All actions return either:
- `{ success: true, data: ... }` on success
- `{ error: string }` on failure

Toast notifications shown to user for all operations.

## UI States

- **Loading**: Disabled buttons with "Loading..." text
- **Empty**: Helpful messages with call-to-action
- **Error**: Red text with error message
- **Success**: Toast notification with success message

## Tips

1. Use search to quickly find projects
2. Filter by status to see active work
3. Track hours for accurate reporting
4. Mark goals as completed for progress tracking
5. Change status as project progresses
6. Archive old projects to keep dashboard clean
