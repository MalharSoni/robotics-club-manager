# Recommended Schema Improvements

This document outlines suggested improvements to the Prisma schema based on the validation report.

## 1. Add Database URL to schema.prisma

**File:** `/Users/malharsoni/robotics-club-manager/prisma/schema.prisma`

**Current:**
```prisma
datasource db {
  provider = "postgresql"
}
```

**Recommended:**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

## 2. Fix Team.createdById Constraint

**File:** `/Users/malharsoni/robotics-club-manager/prisma/schema.prisma`

**Current (Line 100-102):**
```prisma
createdById String
createdBy   CoachProfile @relation("CreatedBy", fields: [createdById], references: [id])
```

**Option A - Allow NULL (Recommended):**
```prisma
createdById String?
createdBy   CoachProfile? @relation("CreatedBy", fields: [createdById], references: [id], onDelete: SetNull)
```

**Option B - Keep RESTRICT but add cascade to TeamCoach:**
Keep as-is and ensure coaches can only be deleted after transferring team ownership via TeamCoach table.

## 3. Add Performance Indexes

**File:** `/Users/malharsoni/robotics-club-manager/prisma/schema.prisma`

### Task Model (around line 232)

Add these indexes before the closing brace:

```prisma
model Task {
  // ... existing fields ...

  @@index([teamId, status])  // Already exists
  @@index([dueDate])          // Already exists
  @@index([priority])         // ADD THIS
  @@index([category])         // ADD THIS
}
```

### Student Model (around line 160)

Add these indexes:

```prisma
model Student {
  // ... existing fields ...

  @@index([email])   // Already exists
  @@index([active])  // Already exists
  @@index([grade])   // ADD THIS
  @@index([gradYear]) // ADD THIS
}
```

### ReportCard Model (around line 618)

Add this index:

```prisma
model ReportCard {
  // ... existing fields ...

  @@unique([studentId, teamId, periodName])
  @@index([studentId, published])
  @@index([teamId, published])
  @@index([exportToken])
  @@index([periodName]) // ADD THIS - for filtering by reporting period
}
```

### CurriculumProgress Model (around line 404)

Add this index:

```prisma
model CurriculumProgress {
  // ... existing fields ...

  @@unique([studentId, moduleId])
  @@index([studentId, status])
  @@index([moduleId])
  @@index([completedAt]) // ADD THIS - for date range queries
}
```

## 4. Complete Updated Schema Sections

Here are the complete sections with improvements:

### datasource block

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Task model

```prisma
model Task {
  id          String   @id @default(cuid())
  title       String
  description String?  @db.Text

  // Assignment
  teamId      String
  team        Team     @relation(fields: [teamId], references: [id], onDelete: Cascade)

  // Task details
  priority    Priority @default(MEDIUM)
  status      TaskStatus @default(TODO)
  category    TaskCategory @default(GENERAL)

  // Dates
  dueDate     DateTime?
  completedAt DateTime?

  // Assignment type
  assignmentType AssignmentType @default(TEAM)

  // Relations
  assignments TaskAssignment[]
  attachments TaskAttachment[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([teamId, status])
  @@index([dueDate])
  @@index([priority])
  @@index([category])
}
```

### Student model

```prisma
model Student {
  id          String   @id @default(cuid())
  firstName   String
  lastName    String
  email       String?  @unique
  phone       String?
  grade       Int?     // 6-12
  gradYear    Int?     // Graduation year

  // Parent contact
  parentName  String?
  parentEmail String?
  parentPhone String?

  // Profile
  bio         String?  @db.Text
  avatar      String?  // URL to photo

  active      Boolean  @default(true)

  // Relations
  teams       TeamMember[]
  tasks       TaskAssignment[]
  curriculumProgress CurriculumProgress[]
  reportCards ReportCard[]
  skills      StudentSkill[]
  projectRoles ProjectRole[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([email])
  @@index([active])
  @@index([grade])
  @@index([gradYear])
}
```

### ReportCard model

```prisma
model ReportCard {
  id          String   @id @default(cuid())
  studentId   String
  teamId      String

  student     Student  @relation(fields: [studentId], references: [id], onDelete: Cascade)
  team        Team     @relation(fields: [teamId], references: [id], onDelete: Cascade)

  // Reporting period
  periodName  String   // "Fall 2024", "Q1 2024", etc.
  startDate   DateTime
  endDate     DateTime

  // Overall assessment
  overallGrade String?  // "A", "Excellent", etc.
  attendance   Float?   // Percentage

  // Ratings (1-5 scale)
  technicalSkills    Int? // 1-5
  teamwork           Int? // 1-5
  leadership         Int? // 1-5
  communication      Int? // 1-5
  problemSolving     Int? // 1-5
  initiative         Int? // 1-5

  // Narrative feedback
  strengths          String? @db.Text
  areasForGrowth     String? @db.Text
  coachComments      String? @db.Text
  goals              String? @db.Text // Goals for next period

  // Metrics
  tasksCompleted     Int @default(0)
  projectsCompleted  Int @default(0)
  hoursLogged        Float @default(0)

  // Publishing
  published          Boolean @default(false)
  publishedAt        DateTime?

  // Export tracking
  exportToken        String? @unique // For secure sharing

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([studentId, teamId, periodName])
  @@index([studentId, published])
  @@index([teamId, published])
  @@index([exportToken])
  @@index([periodName])
}
```

### CurriculumProgress model

```prisma
model CurriculumProgress {
  id        String @id @default(cuid())
  studentId String
  moduleId  String

  student   Student @relation(fields: [studentId], references: [id], onDelete: Cascade)
  module    CurriculumModule @relation(fields: [moduleId], references: [id], onDelete: Cascade)

  status    ProgressStatus @default(NOT_STARTED)

  // Progress tracking
  startedAt   DateTime?
  completedAt DateTime?
  lastAccessedAt DateTime?

  // Assessment
  quizScore   Float?   // Percentage if quiz exists
  attempts    Int      @default(0)

  // Notes from coach
  coachNotes  String?  @db.Text

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([studentId, moduleId])
  @@index([studentId, status])
  @@index([moduleId])
  @@index([completedAt])
}
```

### Team model (if using Option A for createdById)

```prisma
model Team {
  id          String   @id @default(cuid())
  name        String   // "Team Alpha", "7850A", etc.
  teamNumber  String?  // VEX team number
  description String?  @db.Text
  active      Boolean  @default(true)

  // Season tracking
  seasonId    String?
  season      Season?  @relation(fields: [seasonId], references: [id], onDelete: SetNull)

  // Creator (now nullable)
  createdById String?
  createdBy   CoachProfile? @relation("CreatedBy", fields: [createdById], references: [id], onDelete: SetNull)

  // Relations
  coaches     TeamCoach[]
  members     TeamMember[]
  tasks       Task[]
  projects    Project[]
  reportCards ReportCard[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([teamNumber, seasonId]) // Unique per season
  @@index([seasonId, active])
  @@index([createdById])
}
```

## 5. Migration Commands

After making these changes, run:

```bash
# 1. Format the schema
npx prisma format

# 2. Create a new migration
npx prisma migrate dev --name add_performance_indexes

# 3. Regenerate the Prisma Client
npx prisma generate

# 4. Verify the changes
npx tsx scripts/validate-db.ts
```

## 6. Breaking Changes

### If implementing Option A for Team.createdById:

**Breaking Change:** Existing teams must have a createdById value.

**Migration Steps:**

1. Before changing the schema, ensure all teams have a createdById:
   ```sql
   -- Check for any teams without a creator
   SELECT id, name FROM "Team" WHERE "createdById" IS NULL;

   -- If any exist, assign them to a default coach
   UPDATE "Team"
   SET "createdById" = (SELECT id FROM "CoachProfile" LIMIT 1)
   WHERE "createdById" IS NULL;
   ```

2. Then apply the schema change to make it nullable.

### For new indexes:

**No breaking changes** - indexes are additive and don't affect existing queries.

## 7. Testing After Changes

Run these validation scripts:

```bash
# 1. Validate database integrity
npx tsx scripts/validate-db.ts

# 2. Test seed script is still idempotent
npx tsx prisma/seed.ts

# 3. Query performance test
npx tsx scripts/performance-test.ts  # Create this next
```

## 8. Performance Testing Script

Create `/Users/malharsoni/robotics-club-manager/scripts/performance-test.ts`:

```typescript
import prisma from '../src/lib/prisma'

async function testQueries() {
  console.time('Query tasks by priority')
  await prisma.task.findMany({
    where: { priority: 'HIGH' },
  })
  console.timeEnd('Query tasks by priority')

  console.time('Query students by grade')
  await prisma.student.findMany({
    where: { grade: 10 },
  })
  console.timeEnd('Query students by grade')

  console.time('Query report cards by period')
  await prisma.reportCard.findMany({
    where: { periodName: 'Fall 2024' },
  })
  console.timeEnd('Query report cards by period')
}

testQueries()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

## Summary

These improvements will:
1. ✅ Make the schema more explicit (database URL)
2. ✅ Fix the coach deletion constraint issue
3. ✅ Improve query performance with strategic indexes
4. ✅ Maintain backward compatibility (except for createdById if using Option A)

All changes are optional but recommended for production use.
