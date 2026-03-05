# Database Validation Scripts

This directory contains scripts for validating and analyzing your Prisma database setup.

## Scripts

### validate-db.ts
**Purpose:** Comprehensive database validation

**What it checks:**
- Database connection
- Seed data integrity
- Relationship integrity (orphaned records)
- Index coverage
- Constraint validation

**Usage:**
```bash
npx tsx scripts/validate-db.ts
```

**Expected output:**
```
=== VALIDATION SUMMARY ===
Total checks: 16
✓ Passed: 16
⚠ Warnings: 0
✗ Failed: 0
```

### schema-analysis.ts
**Purpose:** Deep schema analysis for optimization

**What it analyzes:**
- Missing indexes
- Data type appropriateness
- Cascade delete rules
- Unique constraints
- Nullable fields
- Table sizes
- Common pitfalls

**Usage:**
```bash
npx tsx scripts/schema-analysis.ts
```

**Note:** Currently has an issue with ExportToken table lookup. Will be fixed in next update.

## Reports Generated

### PRISMA_VALIDATION_REPORT.md
Comprehensive 12-section report covering:
1. Schema Analysis
2. Prisma Client Configuration
3. Seed Data Validation
4. Database Connection & Migration
5. Cascade Delete Configuration
6. Data Type Appropriateness
7. Performance Considerations
8. Common Pitfalls
9. Security Considerations
10. Recommendations Summary
11. Testing Recommendations
12. Migration Strategy

### VALIDATION_SUMMARY.md
Quick reference summary with:
- Pass/fail status
- Key findings
- Test credentials
- Command reference

### schema-improvements.md
Implementation guide for recommended improvements:
- Code examples
- Migration commands
- Breaking change warnings
- Testing procedures

## Common Tasks

### Run all validations
```bash
# Validate database
npx tsx scripts/validate-db.ts

# Analyze schema (when fixed)
npx tsx scripts/schema-analysis.ts
```

### After schema changes
```bash
# 1. Format schema
npx prisma format

# 2. Create migration
npx prisma migrate dev --name your_migration_name

# 3. Regenerate client
npx prisma generate

# 4. Validate
npx tsx scripts/validate-db.ts

# 5. Re-seed if needed
npx tsx prisma/seed.ts
```

### View data
```bash
# Open Prisma Studio
npx prisma studio
```

## Validation Checklist

Before deploying to production:

- [ ] Run validate-db.ts - all checks pass
- [ ] Review cascade delete rules
- [ ] Verify all indexes are appropriate
- [ ] Test seed script idempotency
- [ ] Check for orphaned records
- [ ] Verify foreign key constraints
- [ ] Review security settings
- [ ] Test migration rollback procedure

## Quick Health Check

```bash
# One-liner health check
npx tsx scripts/validate-db.ts 2>&1 | grep -A 5 "VALIDATION SUMMARY"
```

Expected output:
```
=== VALIDATION SUMMARY ===
Total checks: 16
✓ Passed: 16
⚠ Warnings: 0
✗ Failed: 0
```

## Troubleshooting

### Connection errors
```bash
# Check if Prisma dev server is running
echo $DATABASE_URL

# Restart Prisma dev server
npx prisma dev
```

### Validation failures
```bash
# Reset database
npx prisma migrate reset

# Re-run seed
npx tsx prisma/seed.ts

# Validate again
npx tsx scripts/validate-db.ts
```

### Missing tables
```bash
# Check migration status
npx prisma migrate status

# Apply pending migrations
npx prisma migrate deploy
```

## Environment Variables Required

```env
DATABASE_URL="postgres://postgres:postgres@localhost:51214/template1?sslmode=disable"
```

## Dependencies

These scripts require:
- @prisma/client ^7.3.0
- @prisma/adapter-pg ^7.3.0
- pg (PostgreSQL driver)
- tsx (TypeScript execution)
- dotenv (environment variables)

All dependencies are already in package.json.

## Exit Codes

- **0** - All validations passed
- **1** - Validation failures detected

Use exit codes in CI/CD pipelines:
```bash
#!/bin/bash
npx tsx scripts/validate-db.ts
if [ $? -eq 0 ]; then
  echo "Database validation passed"
  exit 0
else
  echo "Database validation failed"
  exit 1
fi
```

## Performance

Validation typically takes:
- validate-db.ts: ~2-3 seconds
- schema-analysis.ts: ~3-5 seconds

Safe to run in development as often as needed.

## Future Enhancements

Planned additions:
- [ ] Performance benchmarking script
- [ ] Data migration testing
- [ ] Foreign key constraint stress testing
- [ ] Concurrent operation testing
- [ ] Index effectiveness analysis
- [ ] Query plan analyzer
