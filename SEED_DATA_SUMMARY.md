# Database Seed Data Summary

## Overview
The enhanced seed file creates comprehensive, realistic test data for the Student Management features of the VEX VRC scouting and match prediction web app.

## File Location
- **Seed File**: `/Users/malharsoni/robotics-club-manager/prisma/seed.ts`

## How to Run

### Fresh Database (Recommended for Testing)
For best results with test data, start with a fresh database:
```bash
# WARNING: This will delete ALL data in your database!
# Only use on development/test databases, NEVER on production!

# Reset the database (requires user confirmation)
npx prisma migrate reset

# The seed will run automatically after reset
# Or run manually:
npx tsx prisma/seed.ts
```

### Existing Database (Idempotent)
```bash
npx tsx prisma/seed.ts
```

**Important Notes**:
- The seed is **idempotent** - it can be run multiple times safely without creating duplicates
- Uses upsert operations with empty `update: {}` blocks, meaning:
  - **New records will be created** if they don't exist
  - **Existing records will NOT be modified** (preserves any changes you've made)
- For completely fresh test data matching this documentation, reset the database first
- Student IDs (student-1 through student-15) are fixed for predictable testing

## Data Created

### 1. Authentication & Organization
- **1 Coach User**
  - Email: coach@robotics.com
  - Password: password123
  - Organization: Riverside Robotics Academy

### 2. Team Structure
- **1 Season**: 2025-2026 High Stakes
- **1 Team**: Team Alpha (1234A)
- All 15 students are members of this team

### 3. Students (15 Total)

#### Grade Distribution
- **Grade 12 (2026)**: 3 students - Senior leaders with advanced skills
- **Grade 11 (2027)**: 4 students - Experienced members with specialized roles
- **Grade 10 (2028)**: 4 students - Mid-level students developing skills
- **Grade 9 (2029)**: 4 students - New members learning basics

#### Student Profiles Include:
- Realistic names from diverse backgrounds
- Student email addresses (@students.riverside.edu domain)
- Phone numbers
- Parent contact information (name, email, phone)
- Biographical descriptions highlighting robotics interests
- Primary role assignments:
  - 1 Captain
  - 3 Programmers
  - 3 Builders
  - 3 Designers
  - 1 Driver
  - 1 Scout
  - 1 Notebook keeper
  - 2 General members

#### Example Students:
1. **Marcus Chen** (Grade 12, Captain) - Team captain with 4 years experience, pneumatics specialist
2. **Aisha Patel** (Grade 12, Programmer) - Lead programmer, autonomous expert, notebook keeper
3. **Ethan Rodriguez** (Grade 12, Designer) - CAD specialist, drivetrain design expert
4. **Zoe Thompson** (Grade 11, Driver) - Primary driver with excellent game sense
5. **Emma Davis** (Grade 9, Member) - New to robotics, interested in programming

### 4. Skills (34 Total)

#### Categories:
- **Mechanical** (7 skills): Hand Tools, Power Tools, Metal Fabrication, Assembly, Gear Systems, Drivetrain, Pneumatics
- **Programming** (7 skills): Python, C++, Autonomous, Sensors, PID Control, Computer Vision, Debug & Testing
- **CAD/Design** (6 skills): Basic CAD, Advanced CAD, 3D Modeling, Technical Drawing, Simulation, Prototyping
- **Electrical** (4 skills): Wiring, Circuit Design, Troubleshooting, Motor Control
- **Soft Skills** (6 skills): Teamwork, Leadership, Presentation, Technical Writing, Project Management, Time Management
- **Problem Solving** (4 skills): Critical Thinking, Strategy Development, Innovation, Data Analysis

#### Proficiency Levels:
- BEGINNER
- INTERMEDIATE
- ADVANCED
- EXPERT

### 5. Student-Skill Assignments (118 Total)

#### Distribution:
- **Seniors**: 10-11 skills each (mostly ADVANCED/EXPERT)
- **Juniors**: 8-9 skills each (mostly INTERMEDIATE/ADVANCED)
- **Sophomores**: 6-8 skills each (mostly BEGINNER/INTERMEDIATE)
- **Freshmen**: 5-6 skills each (mostly BEGINNER)

#### Features:
- Varied proficiency levels matching student experience
- Assessment dates spread over past 6 months
- Advanced/Expert skills are verified
- Realistic skill progression (beginners to veterans)
- Students specialize based on their primary role

### 6. Curriculum Modules (10 Total)

#### Modules:
1. **Safety Fundamentals** (BEGINNER, Safety) - 2 hours
2. **Introduction to VEX Robotics** (BEGINNER, Mechanical) - 4 hours
3. **CAD Basics** (BEGINNER, CAD/Design) - 6 hours
4. **Hand Tools Mastery** (BEGINNER, Mechanical) - 3 hours
5. **Programming Fundamentals** (BEGINNER, Programming) - 8 hours
6. **Advanced CAD Techniques** (ADVANCED, CAD/Design) - 10 hours
7. **Autonomous Programming** (ADVANCED, Programming) - 12 hours
8. **Engineering Notebook** (BEGINNER, Notebook) - 5 hours
9. **Competition Strategy** (INTERMEDIATE, Strategy) - 4 hours
10. **Team Leadership** (INTERMEDIATE, Soft Skills) - 6 hours

### 7. Curriculum Progress (67 Records)

#### Distribution by Student Level:
- **Seniors**: 5-8 modules completed, some MASTERED
- **Juniors**: 4-5 modules, mix of COMPLETED and IN_PROGRESS
- **Sophomores**: 3-4 modules, mostly IN_PROGRESS
- **Freshmen**: 2-3 modules, just starting (NOT_STARTED to IN_PROGRESS)

#### Progress Statuses:
- NOT_STARTED
- IN_PROGRESS
- COMPLETED
- MASTERED

#### Features:
- Realistic completion dates spread over past 4 months
- Quiz scores (85-100%) for completed modules
- Multiple attempts tracked
- Started/completed dates align with student grade level

### 8. Tasks (15 Total)

#### Status Distribution:
- **COMPLETED**: 3 tasks (past deadlines with completion dates)
- **IN_PROGRESS**: 4 tasks (current work)
- **TODO**: 8 tasks (upcoming work)

#### Priority Distribution:
- **URGENT**: 1 task
- **HIGH**: 6 tasks
- **MEDIUM**: 6 tasks
- **LOW**: 2 tasks

#### Categories:
- BUILD (4 tasks)
- PROGRAMMING (3 tasks)
- DESIGN (2 tasks)
- NOTEBOOK (1 task)
- COMPETITION_PREP (3 tasks)
- GENERAL (1 task)
- FUNDRAISING (1 task)

#### Assignment Types:
- INDIVIDUAL (4 tasks) - Assigned to 1 student
- GROUP (10 tasks) - Assigned to 2-4 students
- TEAM (1 task) - Assigned to 4 students

#### Due Dates:
- Past: 3 tasks (30-65 days ago)
- Near term: 4 tasks (3-10 days from now)
- Mid term: 5 tasks (12-28 days from now)
- Long term: 3 tasks (35-42 days from now)

#### Example Tasks:
1. **Complete safety training** (COMPLETED, URGENT) - All team members
2. **Design intake mechanism CAD** (IN_PROGRESS, HIGH) - Ethan Rodriguez
3. **Program autonomous routine** (IN_PROGRESS, HIGH) - Aisha, Maya, Noah
4. **Build lift mechanism** (TODO, HIGH) - Jamal, Lucas, Ryan
5. **Scout local competition** (TODO, MEDIUM) - Connor O'Brien

### 9. Task Assignments (33 Total)
- 2-4 students per task on average
- Status matches parent task status
- Realistic distribution across team members

### 10. Projects (5 Total)

#### Projects:
1. **Competition Robot Build** (IN_PROGRESS, ROBOT)
   - 9 students with varied roles
   - 40-130 hours logged per student
   - Main competition robot for season

2. **Autonomous Skills Challenge** (IN_PROGRESS, AUTONOMOUS)
   - 4 students (programmers + analyst)
   - 15-35 hours logged
   - Optimizing autonomous routines

3. **Intake Subsystem** (TESTING, MECHANISM)
   - 5 students (designers + builders + tester)
   - 12-35 hours logged
   - Specific mechanism development

4. **Team Outreach Program** (IN_PROGRESS, OUTREACH)
   - 3 students (coordinator + mentors)
   - 25-40 hours logged
   - Community engagement

5. **Pneumatics System** (COMPLETED, MECHANISM)
   - 3 students (lead + builders)
   - 28-50 hours logged
   - Successfully completed subsystem

#### Student Roles:
- Project Lead, Lead Programmer, Lead Designer, Lead Driver, Lead Builder
- Programmers, Builders, Designers
- Learners, Assistants, Testers, Coordinators, Mentors
- Each role includes contributions description and hours logged

### 11. Project Roles (24 Assignments)
- Multiple students per project
- Realistic role assignments based on student skills
- Hours logged varies by role (12-130 hours)
- Contribution descriptions provided

## Data Characteristics

### Realism
- **Names**: Diverse, realistic student names
- **Contact Info**: Consistent email domains, formatted phone numbers
- **Dates**: Realistic progression over the season
- **Skills**: Match student grade level and experience
- **Tasks**: Real robotics team activities with appropriate priorities

### Relationships
- All foreign keys properly linked
- Students belong to team
- Tasks assigned to team
- Projects belong to team
- Skills, curriculum, and assignments all properly related

### Edge Cases Covered
- New students (freshmen) with minimal progress
- Veterans (seniors) with extensive skills and completed work
- Mid-level students at various stages
- Mix of individual, group, and team assignments
- Various task statuses and priorities
- Completed and in-progress projects
- Different proficiency levels across skills

### Data Integrity
- **Idempotent**: Uses upsert operations with proper unique constraints
- **No Duplicates**: Composite unique keys on join tables
- **Valid References**: All foreign keys point to existing records
- **Consistent**: Completion dates align with status
- **Realistic**: Skills match roles, progress matches grade level

## Testing Use Cases

This seed data enables testing of:

1. **Student List Views**
   - Filtering by grade, role, status
   - Sorting by various fields
   - Search functionality

2. **Student Profiles**
   - Viewing complete student information
   - Skills matrix display
   - Task assignments
   - Project contributions
   - Curriculum progress

3. **Skills Management**
   - Viewing all skills by category
   - Assigning skills to students
   - Tracking proficiency levels
   - Verifying skill achievements

4. **Task Management**
   - Creating and assigning tasks
   - Filtering by status, priority, category
   - Due date tracking
   - Task completion workflows
   - Individual vs group assignments

5. **Project Tracking**
   - Project overview and status
   - Student role assignments
   - Hours tracking
   - Contribution documentation

6. **Curriculum Progress**
   - Module completion tracking
   - Progress by student
   - Assessment scores
   - Learning path progression

7. **Edge Cases**
   - New students with no history
   - Graduating seniors with full records
   - Overdue tasks
   - Completed projects
   - Various proficiency levels

## Database Indexes

The schema already includes optimal indexes for common queries:

- Student lookups by email and active status
- Task queries by team, status, and due date
- Skill queries by category
- Team member queries by team and active status
- Curriculum progress by student and status
- Project queries by team and status

No additional indexes are needed at this time.

## Recommendations

### For Production Use
1. Adjust student count per team as needed (currently 15)
2. Modify email domain to match actual school domain
3. Update season dates to match current competition year
4. Customize team numbers and names
5. Adjust phone number format to match region

### For Testing
1. The current seed provides good coverage for most test scenarios
2. Add more teams if testing multi-team features
3. Consider adding report cards for end-to-end testing
4. May want to add task attachments for file upload testing

### For Development
1. Run seed after schema migrations
2. Use seed data as reference for API response shapes
3. Student IDs are predictable (student-1 through student-15) for easy testing
4. Task and project IDs follow similar pattern

## Verification Queries

To verify the seeded data:

```typescript
// Count all entities
const counts = {
  students: await prisma.student.count(),
  skills: await prisma.skill.count(),
  studentSkills: await prisma.studentSkill.count(),
  tasks: await prisma.task.count(),
  taskAssignments: await prisma.taskAssignment.count(),
  projects: await prisma.project.count(),
  projectRoles: await prisma.projectRole.count(),
  modules: await prisma.curriculumModule.count(),
  progress: await prisma.curriculumProgress.count(),
}

// Check grade distribution
const gradeDistribution = await prisma.student.groupBy({
  by: ['grade'],
  _count: { grade: true }
})

// Check task status distribution
const taskStatusDistribution = await prisma.task.groupBy({
  by: ['status'],
  _count: { status: true }
})
```

## Summary Statistics

- **Total Records Created**: ~280 records across all tables
- **Student Data**: 15 students with complete profiles
- **Skill Assessments**: 118 student-skill assignments
- **Task Assignments**: 33 task assignments across 15 tasks
- **Project Contributions**: 24 role assignments across 5 projects
- **Curriculum Tracking**: 67 progress records across 10 modules
- **Safe to Re-run**: Yes, fully idempotent with upsert operations
