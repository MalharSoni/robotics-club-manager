import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import 'dotenv/config'

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

// Create Prisma adapter
const adapter = new PrismaPg(pool)

// Initialize Prisma Client with adapter
const prisma = new PrismaClient({ adapter })

interface ValidationResult {
  section: string
  status: 'PASS' | 'FAIL' | 'WARNING'
  message: string
  details?: any
}

const results: ValidationResult[] = []

async function validateDatabaseConnection() {
  console.log('\n=== DATABASE CONNECTION ===')
  try {
    await prisma.$queryRaw`SELECT 1 as test`
    results.push({
      section: 'Connection',
      status: 'PASS',
      message: 'Database connection successful',
    })
    console.log('✓ Database connection successful')
  } catch (error) {
    results.push({
      section: 'Connection',
      status: 'FAIL',
      message: 'Database connection failed',
      details: error instanceof Error ? error.message : String(error),
    })
    console.error('✗ Database connection failed:', error)
    throw error
  }
}

async function validateSeedData() {
  console.log('\n=== SEED DATA VALIDATION ===')

  // Check users
  const users = await prisma.user.findMany()
  console.log(`✓ Users: ${users.length} found`)
  results.push({
    section: 'Users',
    status: users.length > 0 ? 'PASS' : 'WARNING',
    message: `Found ${users.length} user(s)`,
    details: users.map(u => ({ email: u.email, role: u.role })),
  })

  // Check coach profiles
  const coaches = await prisma.coachProfile.findMany({
    include: { user: true },
  })
  console.log(`✓ Coach Profiles: ${coaches.length} found`)
  results.push({
    section: 'Coach Profiles',
    status: coaches.length > 0 ? 'PASS' : 'WARNING',
    message: `Found ${coaches.length} coach profile(s)`,
    details: coaches.map(c => ({ name: c.user.name, organization: c.organization })),
  })

  // Check seasons
  const seasons = await prisma.season.findMany()
  console.log(`✓ Seasons: ${seasons.length} found`)
  results.push({
    section: 'Seasons',
    status: seasons.length > 0 ? 'PASS' : 'WARNING',
    message: `Found ${seasons.length} season(s)`,
    details: seasons.map(s => ({ name: s.name, current: s.current })),
  })

  // Check teams
  const teams = await prisma.team.findMany({
    include: {
      season: true,
      createdBy: { include: { user: true } },
    },
  })
  console.log(`✓ Teams: ${teams.length} found`)
  results.push({
    section: 'Teams',
    status: teams.length > 0 ? 'PASS' : 'WARNING',
    message: `Found ${teams.length} team(s)`,
    details: teams.map(t => ({
      name: t.name,
      teamNumber: t.teamNumber,
      season: t.season?.name,
      createdBy: t.createdBy.user.name,
    })),
  })

  // Check students
  const students = await prisma.student.findMany()
  console.log(`✓ Students: ${students.length} found`)
  results.push({
    section: 'Students',
    status: students.length > 0 ? 'PASS' : 'WARNING',
    message: `Found ${students.length} student(s)`,
    details: students.map(s => ({
      name: `${s.firstName} ${s.lastName}`,
      email: s.email,
      grade: s.grade,
    })),
  })

  // Check team members
  const teamMembers = await prisma.teamMember.findMany({
    include: {
      student: true,
      team: true,
    },
  })
  console.log(`✓ Team Members: ${teamMembers.length} found`)
  results.push({
    section: 'Team Members',
    status: teamMembers.length > 0 ? 'PASS' : 'WARNING',
    message: `Found ${teamMembers.length} team member(s)`,
    details: teamMembers.map(tm => ({
      student: `${tm.student.firstName} ${tm.student.lastName}`,
      team: tm.team.name,
      role: tm.primaryRole,
    })),
  })

  // Check skills
  const skills = await prisma.skill.findMany()
  console.log(`✓ Skills: ${skills.length} found`)
  results.push({
    section: 'Skills',
    status: skills.length > 0 ? 'PASS' : 'WARNING',
    message: `Found ${skills.length} skill(s)`,
    details: skills.map(s => ({ name: s.name, category: s.category, level: s.level })),
  })

  // Check tasks
  const tasks = await prisma.task.findMany({
    include: {
      team: true,
    },
  })
  console.log(`✓ Tasks: ${tasks.length} found`)
  results.push({
    section: 'Tasks',
    status: tasks.length > 0 ? 'PASS' : 'WARNING',
    message: `Found ${tasks.length} task(s)`,
    details: tasks.map(t => ({
      title: t.title,
      team: t.team.name,
      status: t.status,
      priority: t.priority,
    })),
  })

  // Check curriculum modules
  const modules = await prisma.curriculumModule.findMany()
  console.log(`✓ Curriculum Modules: ${modules.length} found`)
  results.push({
    section: 'Curriculum Modules',
    status: modules.length > 0 ? 'PASS' : 'WARNING',
    message: `Found ${modules.length} curriculum module(s)`,
    details: modules.map(m => ({ title: m.title, category: m.category, level: m.level })),
  })
}

async function validateRelationships() {
  console.log('\n=== RELATIONSHIP INTEGRITY ===')

  // Check for orphaned team members (students without valid teams)
  const orphanedTeamMembers = await prisma.$queryRaw<any[]>`
    SELECT tm.id, tm."teamId", tm."studentId"
    FROM "TeamMember" tm
    LEFT JOIN "Team" t ON tm."teamId" = t.id
    WHERE t.id IS NULL
  `
  if (orphanedTeamMembers.length > 0) {
    results.push({
      section: 'Team Members',
      status: 'FAIL',
      message: `Found ${orphanedTeamMembers.length} orphaned team member(s)`,
      details: orphanedTeamMembers,
    })
    console.error(`✗ Found ${orphanedTeamMembers.length} orphaned team members`)
  } else {
    results.push({
      section: 'Team Members',
      status: 'PASS',
      message: 'No orphaned team members found',
    })
    console.log('✓ No orphaned team members')
  }

  // Check for orphaned tasks (tasks without valid teams)
  const orphanedTasks = await prisma.$queryRaw<any[]>`
    SELECT t.id, t.title, t."teamId"
    FROM "Task" t
    LEFT JOIN "Team" team ON t."teamId" = team.id
    WHERE team.id IS NULL
  `
  if (orphanedTasks.length > 0) {
    results.push({
      section: 'Tasks',
      status: 'FAIL',
      message: `Found ${orphanedTasks.length} orphaned task(s)`,
      details: orphanedTasks,
    })
    console.error(`✗ Found ${orphanedTasks.length} orphaned tasks`)
  } else {
    results.push({
      section: 'Tasks',
      status: 'PASS',
      message: 'No orphaned tasks found',
    })
    console.log('✓ No orphaned tasks')
  }

  // Check for orphaned task assignments (assignments without valid tasks or students)
  const orphanedTaskAssignments = await prisma.$queryRaw<any[]>`
    SELECT ta.id, ta."taskId", ta."studentId"
    FROM "TaskAssignment" ta
    LEFT JOIN "Task" t ON ta."taskId" = t.id
    LEFT JOIN "Student" s ON ta."studentId" = s.id
    WHERE t.id IS NULL OR s.id IS NULL
  `
  if (orphanedTaskAssignments.length > 0) {
    results.push({
      section: 'Task Assignments',
      status: 'FAIL',
      message: `Found ${orphanedTaskAssignments.length} orphaned task assignment(s)`,
      details: orphanedTaskAssignments,
    })
    console.error(`✗ Found ${orphanedTaskAssignments.length} orphaned task assignments`)
  } else {
    results.push({
      section: 'Task Assignments',
      status: 'PASS',
      message: 'No orphaned task assignments found',
    })
    console.log('✓ No orphaned task assignments')
  }

  // Check for orphaned coach profiles (coach profiles without valid users)
  const orphanedCoachProfiles = await prisma.$queryRaw<any[]>`
    SELECT cp.id, cp."userId"
    FROM "CoachProfile" cp
    LEFT JOIN "User" u ON cp."userId" = u.id
    WHERE u.id IS NULL
  `
  if (orphanedCoachProfiles.length > 0) {
    results.push({
      section: 'Coach Profiles',
      status: 'FAIL',
      message: `Found ${orphanedCoachProfiles.length} orphaned coach profile(s)`,
      details: orphanedCoachProfiles,
    })
    console.error(`✗ Found ${orphanedCoachProfiles.length} orphaned coach profiles`)
  } else {
    results.push({
      section: 'Coach Profiles',
      status: 'PASS',
      message: 'No orphaned coach profiles found',
    })
    console.log('✓ No orphaned coach profiles')
  }
}

async function validateIndexes() {
  console.log('\n=== INDEX VALIDATION ===')

  const indexes = await prisma.$queryRaw<any[]>`
    SELECT
      schemaname,
      tablename,
      indexname,
      indexdef
    FROM pg_indexes
    WHERE schemaname = 'public'
    ORDER BY tablename, indexname
  `

  console.log(`Found ${indexes.length} indexes`)
  results.push({
    section: 'Indexes',
    status: 'PASS',
    message: `Found ${indexes.length} indexes`,
    details: indexes.map(i => ({
      table: i.tablename,
      index: i.indexname,
    })),
  })

  // Count indexes per table
  const indexCounts = indexes.reduce((acc: Record<string, number>, idx) => {
    acc[idx.tablename] = (acc[idx.tablename] || 0) + 1
    return acc
  }, {})

  console.log('\nIndexes per table:')
  Object.entries(indexCounts)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([table, count]) => {
      console.log(`  ${table}: ${count}`)
    })
}

async function validateConstraints() {
  console.log('\n=== CONSTRAINT VALIDATION ===')

  const constraints = await prisma.$queryRaw<any[]>`
    SELECT
      tc.constraint_name,
      tc.table_name,
      tc.constraint_type,
      kcu.column_name,
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name,
      rc.delete_rule
    FROM information_schema.table_constraints AS tc
    LEFT JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    LEFT JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
    LEFT JOIN information_schema.referential_constraints AS rc
      ON rc.constraint_name = tc.constraint_name
      AND rc.constraint_schema = tc.table_schema
    WHERE tc.table_schema = 'public'
      AND tc.constraint_type IN ('FOREIGN KEY', 'UNIQUE', 'PRIMARY KEY')
    ORDER BY tc.table_name, tc.constraint_type, tc.constraint_name
  `

  console.log(`Found ${constraints.length} constraints`)

  // Group by constraint type
  const constraintsByType = constraints.reduce((acc: Record<string, any[]>, c) => {
    if (!acc[c.constraint_type]) {
      acc[c.constraint_type] = []
    }
    acc[c.constraint_type].push(c)
    return acc
  }, {})

  Object.entries(constraintsByType).forEach(([type, items]) => {
    console.log(`\n${type}: ${items.length}`)
    if (type === 'FOREIGN KEY') {
      items.forEach(c => {
        console.log(
          `  ${c.table_name}.${c.column_name} -> ${c.foreign_table_name}.${c.foreign_column_name} (ON DELETE ${c.delete_rule})`
        )
      })
    }
  })

  results.push({
    section: 'Constraints',
    status: 'PASS',
    message: `Found ${constraints.length} constraints`,
    details: constraintsByType,
  })
}

async function printSummary() {
  console.log('\n\n=== VALIDATION SUMMARY ===')

  const passed = results.filter(r => r.status === 'PASS').length
  const warnings = results.filter(r => r.status === 'WARNING').length
  const failed = results.filter(r => r.status === 'FAIL').length

  console.log(`Total checks: ${results.length}`)
  console.log(`✓ Passed: ${passed}`)
  console.log(`⚠ Warnings: ${warnings}`)
  console.log(`✗ Failed: ${failed}`)

  if (failed > 0) {
    console.log('\n\nFailed checks:')
    results
      .filter(r => r.status === 'FAIL')
      .forEach(r => {
        console.log(`\n  ${r.section}: ${r.message}`)
        if (r.details) {
          console.log(`  Details:`, JSON.stringify(r.details, null, 2))
        }
      })
  }

  if (warnings > 0) {
    console.log('\n\nWarnings:')
    results
      .filter(r => r.status === 'WARNING')
      .forEach(r => {
        console.log(`\n  ${r.section}: ${r.message}`)
      })
  }

  console.log('\n')
}

async function main() {
  console.log('🔍 Starting database validation...\n')

  try {
    await validateDatabaseConnection()
    await validateSeedData()
    await validateRelationships()
    await validateIndexes()
    await validateConstraints()
    await printSummary()

    const failed = results.filter(r => r.status === 'FAIL').length
    if (failed > 0) {
      process.exit(1)
    }
  } catch (error) {
    console.error('\n\n❌ Validation failed with error:', error)
    process.exit(1)
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })
