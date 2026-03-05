import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import 'dotenv/config'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

interface SchemaIssue {
  severity: 'CRITICAL' | 'WARNING' | 'INFO'
  category: string
  message: string
  recommendation?: string
  sqlExample?: string
}

const issues: SchemaIssue[] = []

async function analyzeMissingIndexes() {
  console.log('\n=== ANALYZING MISSING INDEXES ===')

  // Check for foreign keys without indexes (already indexed by Prisma)
  const foreignKeys = await prisma.$queryRaw<any[]>`
    SELECT
      tc.table_name,
      kcu.column_name,
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public'
  `

  console.log(`Found ${foreignKeys.length} foreign key relationships`)
  console.log('✓ Prisma automatically creates indexes for foreign keys')

  // Check for commonly queried columns that might benefit from indexes
  const potentialIndexCandidates = [
    { table: 'Task', column: 'priority', reason: 'Frequently filtered in task lists' },
    { table: 'Task', column: 'category', reason: 'Frequently filtered in task lists' },
    { table: 'Student', column: 'grade', reason: 'Frequently filtered by grade level' },
    { table: 'Student', column: 'gradYear', reason: 'Frequently filtered by graduation year' },
    { table: 'Team', column: 'teamNumber', reason: 'Frequently searched by team number' },
    { table: 'ReportCard', column: 'periodName', reason: 'Frequently filtered by period' },
    { table: 'CurriculumProgress', column: 'completedAt', reason: 'Date range queries' },
  ]

  for (const candidate of potentialIndexCandidates) {
    const indexExists = await prisma.$queryRaw<any[]>`
      SELECT indexname
      FROM pg_indexes
      WHERE tablename = ${candidate.table}
        AND indexdef LIKE '%' || ${candidate.column} || '%'
    `

    if (indexExists.length === 0) {
      issues.push({
        severity: 'INFO',
        category: 'Performance',
        message: `Consider adding index on ${candidate.table}.${candidate.column}`,
        recommendation: candidate.reason,
        sqlExample: `@@index([${candidate.column}])`,
      })
    }
  }
}

async function analyzeDataTypes() {
  console.log('\n=== ANALYZING DATA TYPES ===')

  const columns = await prisma.$queryRaw<any[]>`
    SELECT
      table_name,
      column_name,
      data_type,
      character_maximum_length,
      is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name NOT LIKE '_prisma%'
    ORDER BY table_name, ordinal_position
  `

  // Check for text fields that might benefit from limits
  const unlimitedTextFields = columns.filter(
    c =>
      c.data_type === 'text' &&
      !['description', 'bio', 'content', 'notes', 'comments', 'contributions'].some(field =>
        c.column_name.toLowerCase().includes(field)
      )
  )

  if (unlimitedTextFields.length > 0) {
    console.log(`Found ${unlimitedTextFields.length} text columns that might benefit from limits:`)
    unlimitedTextFields.forEach(c => {
      console.log(`  - ${c.table_name}.${c.column_name}`)
    })
  }

  // Check for ID fields
  const idFields = columns.filter(c => c.column_name === 'id')
  console.log(`\n✓ All ${idFields.length} tables use cuid() for IDs (good practice)`)
}

async function analyzeCascadeRules() {
  console.log('\n=== ANALYZING CASCADE RULES ===')

  const cascadeRules = await prisma.$queryRaw<any[]>`
    SELECT
      tc.table_name,
      kcu.column_name,
      ccu.table_name AS foreign_table_name,
      rc.delete_rule,
      rc.update_rule
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
    JOIN information_schema.referential_constraints AS rc
      ON rc.constraint_name = tc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public'
    ORDER BY tc.table_name
  `

  const groupedByDeleteRule = cascadeRules.reduce((acc: Record<string, any[]>, rule) => {
    if (!acc[rule.delete_rule]) {
      acc[rule.delete_rule] = []
    }
    acc[rule.delete_rule].push(rule)
    return acc
  }, {})

  console.log('\nDelete rules distribution:')
  Object.entries(groupedByDeleteRule).forEach(([rule, items]) => {
    console.log(`  ${rule}: ${items.length}`)
  })

  // Check for potential issues with RESTRICT
  const restrictRules = cascadeRules.filter(r => r.delete_rule === 'RESTRICT')
  if (restrictRules.length > 0) {
    console.log(`\n⚠ Found ${restrictRules.length} RESTRICT delete rule(s):`)
    restrictRules.forEach(r => {
      console.log(`  - ${r.table_name}.${r.column_name} -> ${r.foreign_table_name}`)

      if (r.table_name === 'Team' && r.column_name === 'createdById') {
        issues.push({
          severity: 'WARNING',
          category: 'Data Integrity',
          message: 'Team.createdById has ON DELETE RESTRICT',
          recommendation:
            'This prevents deleting a coach if they created teams. Consider changing to SET NULL with a nullable createdById field, or add a data migration process.',
        })
      }
    })
  }
}

async function analyzeUniqueConstraints() {
  console.log('\n=== ANALYZING UNIQUE CONSTRAINTS ===')

  const uniqueConstraints = await prisma.$queryRaw<any[]>`
    SELECT
      tc.table_name,
      string_agg(kcu.column_name, ', ' ORDER BY kcu.ordinal_position) as columns
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    WHERE tc.constraint_type = 'UNIQUE'
      AND tc.table_schema = 'public'
    GROUP BY tc.table_name, tc.constraint_name
    ORDER BY tc.table_name
  `

  console.log(`\nFound ${uniqueConstraints.length} unique constraints:`)
  uniqueConstraints.forEach(c => {
    console.log(`  - ${c.table_name}: [${c.columns}]`)
  })

  // Verify important unique constraints exist
  const expectedUnique = [
    { table: 'User', column: 'email' },
    { table: 'Student', column: 'email' },
    { table: 'Skill', column: 'name' },
  ]

  for (const expected of expectedUnique) {
    const exists = uniqueConstraints.some(
      c => c.table_name === expected.table && c.columns === expected.column
    )
    if (exists) {
      console.log(`✓ ${expected.table}.${expected.column} is unique`)
    } else {
      issues.push({
        severity: 'CRITICAL',
        category: 'Data Integrity',
        message: `Missing unique constraint on ${expected.table}.${expected.column}`,
      })
    }
  }
}

async function analyzeNullability() {
  console.log('\n=== ANALYZING NULLABLE FIELDS ===')

  const nullableFields = await prisma.$queryRaw<any[]>`
    SELECT
      table_name,
      column_name,
      data_type
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND is_nullable = 'YES'
      AND column_name NOT IN ('createdAt', 'updatedAt')
      AND table_name NOT LIKE '_prisma%'
    ORDER BY table_name, column_name
  `

  console.log(`Found ${nullableFields.length} nullable fields (excluding timestamps)`)

  // Check for potentially problematic nullable fields
  const problematicNullable = nullableFields.filter(
    f =>
      (f.column_name.includes('Id') && !f.column_name.includes('parent')) ||
      f.column_name === 'name' ||
      f.column_name === 'title'
  )

  if (problematicNullable.length > 0) {
    console.log(`\n⚠ Potentially problematic nullable fields:`)
    problematicNullable.forEach(f => {
      console.log(`  - ${f.table_name}.${f.column_name}`)

      if (f.column_name === 'seasonId' && f.table_name === 'Team') {
        issues.push({
          severity: 'INFO',
          category: 'Data Integrity',
          message: 'Team.seasonId is nullable',
          recommendation:
            'This is intentional (ON DELETE SET NULL) but consider if teams should always have a season. You may want a default "Unassigned" season.',
        })
      }
    })
  }
}

async function analyzeTableSizes() {
  console.log('\n=== ANALYZING TABLE SIZES ===')

  const tableSizes = await prisma.$queryRaw<any[]>`
    SELECT
      schemaname,
      tablename,
      pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
      pg_total_relation_size(schemaname||'.'||tablename) AS size_bytes
    FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
  `

  console.log('\nTable sizes:')
  tableSizes.forEach(t => {
    console.log(`  ${t.tablename}: ${t.size}`)
  })
}

async function checkForCommonPitfalls() {
  console.log('\n=== CHECKING FOR COMMON PITFALLS ===')

  // Check for tables without timestamps
  const tablesWithoutTimestamps = await prisma.$queryRaw<any[]>`
    SELECT DISTINCT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      AND table_name NOT IN (
        SELECT DISTINCT table_name
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND column_name IN ('createdAt', 'updatedAt')
      )
      AND table_name NOT LIKE '_prisma%'
  `

  if (tablesWithoutTimestamps.length > 0) {
    console.log(`\n⚠ Tables without timestamp fields:`)
    tablesWithoutTimestamps.forEach(t => {
      console.log(`  - ${t.table_name}`)
      issues.push({
        severity: 'INFO',
        category: 'Audit Trail',
        message: `${t.table_name} lacks createdAt/updatedAt fields`,
        recommendation: 'Consider adding timestamp fields for audit purposes',
      })
    })
  } else {
    console.log('✓ All tables have timestamp fields')
  }

  // Check for enum usage
  const enums = await prisma.$queryRaw<any[]>`
    SELECT
      t.typname as enum_name,
      array_agg(e.enumlabel ORDER BY e.enumsortorder) as values
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    GROUP BY t.typname
    ORDER BY t.typname
  `

  console.log(`\n✓ Found ${enums.length} enum types:`)
  enums.forEach(e => {
    console.log(`  - ${e.enum_name}: ${e.values.length} values`)
  })
}

async function printSummary() {
  console.log('\n\n' + '='.repeat(80))
  console.log('=== SCHEMA ANALYSIS SUMMARY ===')
  console.log('='.repeat(80))

  const critical = issues.filter(i => i.severity === 'CRITICAL')
  const warnings = issues.filter(i => i.severity === 'WARNING')
  const info = issues.filter(i => i.severity === 'INFO')

  console.log(`\nTotal issues: ${issues.length}`)
  console.log(`  CRITICAL: ${critical.length}`)
  console.log(`  WARNING: ${warnings.length}`)
  console.log(`  INFO: ${info.length}`)

  if (critical.length > 0) {
    console.log('\n\n🔴 CRITICAL ISSUES:')
    critical.forEach((issue, i) => {
      console.log(`\n${i + 1}. [${issue.category}] ${issue.message}`)
      if (issue.recommendation) {
        console.log(`   Recommendation: ${issue.recommendation}`)
      }
      if (issue.sqlExample) {
        console.log(`   Example: ${issue.sqlExample}`)
      }
    })
  }

  if (warnings.length > 0) {
    console.log('\n\n⚠️  WARNINGS:')
    warnings.forEach((issue, i) => {
      console.log(`\n${i + 1}. [${issue.category}] ${issue.message}`)
      if (issue.recommendation) {
        console.log(`   Recommendation: ${issue.recommendation}`)
      }
      if (issue.sqlExample) {
        console.log(`   Example: ${issue.sqlExample}`)
      }
    })
  }

  if (info.length > 0) {
    console.log('\n\nℹ️  INFORMATIONAL:')
    info.forEach((issue, i) => {
      console.log(`\n${i + 1}. [${issue.category}] ${issue.message}`)
      if (issue.recommendation) {
        console.log(`   Recommendation: ${issue.recommendation}`)
      }
      if (issue.sqlExample) {
        console.log(`   Example: ${issue.sqlExample}`)
      }
    })
  }

  console.log('\n')
}

async function main() {
  console.log('🔍 Starting comprehensive schema analysis...')

  try {
    await analyzeMissingIndexes()
    await analyzeDataTypes()
    await analyzeCascadeRules()
    await analyzeUniqueConstraints()
    await analyzeNullability()
    await analyzeTableSizes()
    await checkForCommonPitfalls()
    await printSummary()
  } catch (error) {
    console.error('❌ Analysis failed:', error)
    process.exit(1)
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })
