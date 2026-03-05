/**
 * Utility functions for student data manipulation and display
 */

import type { TeamRole } from '@prisma/client'

/**
 * Format student full name
 */
export function formatStudentName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim()
}

/**
 * Format student name with preferred format
 */
export function formatStudentNameReverse(
  firstName: string,
  lastName: string
): string {
  return `${lastName}, ${firstName}`.trim()
}

/**
 * Get student initials
 */
export function getStudentInitials(
  firstName: string,
  lastName: string
): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

/**
 * Calculate current grade based on graduation year
 */
export function calculateCurrentGrade(gradYear: number): number | null {
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth()

  // School year starts in August (month 7)
  const schoolYear = currentMonth >= 7 ? currentYear + 1 : currentYear

  const yearsUntilGrad = gradYear - schoolYear
  const grade = 12 - yearsUntilGrad

  // Validate grade range
  if (grade < 6 || grade > 12) {
    return null
  }

  return grade
}

/**
 * Calculate graduation year from current grade
 */
export function calculateGradYear(grade: number): number {
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth()

  // School year starts in August (month 7)
  const schoolYear = currentMonth >= 7 ? currentYear + 1 : currentYear

  const yearsUntilGrad = 12 - grade
  return schoolYear + yearsUntilGrad
}

/**
 * Format phone number for display
 */
export function formatPhoneNumber(phone: string | null): string | null {
  if (!phone) return null

  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '')

  // Format as (XXX) XXX-XXXX for 10 digits
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  }

  // Format with +1 for 11 digits
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`
  }

  // Return original if not standard format
  return phone
}

/**
 * Get team role display name
 */
export function getRoleDisplayName(role: TeamRole): string {
  const displayNames: Record<TeamRole, string> = {
    CAPTAIN: 'Captain',
    DRIVER: 'Driver',
    PROGRAMMER: 'Programmer',
    BUILDER: 'Builder',
    DESIGNER: 'Designer',
    SCOUT: 'Scout',
    NOTEBOOK: 'Notebook',
    MEMBER: 'Member',
  }

  return displayNames[role] || role
}

/**
 * Get team role color for UI
 */
export function getRoleColor(role: TeamRole): string {
  const colors: Record<TeamRole, string> = {
    CAPTAIN: 'purple',
    DRIVER: 'blue',
    PROGRAMMER: 'green',
    BUILDER: 'orange',
    DESIGNER: 'pink',
    SCOUT: 'cyan',
    NOTEBOOK: 'yellow',
    MEMBER: 'gray',
  }

  return colors[role] || 'gray'
}

/**
 * Sort students by name
 */
export function sortStudentsByName<T extends { firstName: string; lastName: string }>(
  students: T[],
  order: 'asc' | 'desc' = 'asc'
): T[] {
  return [...students].sort((a, b) => {
    const nameA = `${a.lastName} ${a.firstName}`.toLowerCase()
    const nameB = `${b.lastName} ${b.firstName}`.toLowerCase()

    if (order === 'asc') {
      return nameA.localeCompare(nameB)
    }
    return nameB.localeCompare(nameA)
  })
}

/**
 * Filter students by search term
 */
export function filterStudentsBySearch<
  T extends { firstName: string; lastName: string; email?: string | null }
>(students: T[], searchTerm: string): T[] {
  const term = searchTerm.toLowerCase().trim()

  if (!term) return students

  return students.filter((student) => {
    const fullName = `${student.firstName} ${student.lastName}`.toLowerCase()
    const email = student.email?.toLowerCase() || ''

    return fullName.includes(term) || email.includes(term)
  })
}

/**
 * Group students by grade
 */
export function groupStudentsByGrade<T extends { grade: number | null }>(
  students: T[]
): Record<string, T[]> {
  return students.reduce((groups, student) => {
    const key = student.grade ? `Grade ${student.grade}` : 'No Grade'

    if (!groups[key]) {
      groups[key] = []
    }

    groups[key].push(student)
    return groups
  }, {} as Record<string, T[]>)
}

/**
 * Group students by team role
 */
export function groupStudentsByRole<
  T extends { teams: Array<{ primaryRole: TeamRole }> }
>(students: T[]): Record<string, T[]> {
  const groups: Record<string, T[]> = {}

  students.forEach((student) => {
    student.teams.forEach((team) => {
      const roleName = getRoleDisplayName(team.primaryRole)

      if (!groups[roleName]) {
        groups[roleName] = []
      }

      if (!groups[roleName].includes(student)) {
        groups[roleName].push(student)
      }
    })
  })

  return groups
}

/**
 * Check if student has complete contact info
 */
export function hasCompleteContact(student: {
  email: string | null
  phone: string | null
  parentEmail: string | null
  parentPhone: string | null
}): boolean {
  return !!(
    (student.email || student.phone) &&
    (student.parentEmail || student.parentPhone)
  )
}

/**
 * Get student contact preference
 */
export function getPreferredContact(student: {
  email: string | null
  phone: string | null
}): 'email' | 'phone' | 'none' {
  if (student.email) return 'email'
  if (student.phone) return 'phone'
  return 'none'
}

/**
 * Validate student email format (client-side helper)
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate phone number format (client-side helper)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[\d\s()+-]*$/
  const digits = phone.replace(/\D/g, '')
  return phoneRegex.test(phone) && digits.length >= 10 && digits.length <= 11
}

/**
 * Generate student avatar fallback URL
 */
export function getStudentAvatarUrl(
  student: { avatar: string | null; firstName: string; lastName: string },
  size: number = 200
): string {
  if (student.avatar) {
    return student.avatar
  }

  // Generate UI Avatars fallback
  const name = encodeURIComponent(`${student.firstName} ${student.lastName}`)
  return `https://ui-avatars.com/api/?name=${name}&size=${size}&background=random`
}

/**
 * Calculate student age from grade (approximate)
 */
export function getApproximateAge(grade: number | null): number | null {
  if (!grade) return null

  // Typical age for grade (grade + 5)
  return grade + 5
}

/**
 * Get graduation status
 */
export function getGraduationStatus(gradYear: number | null): {
  status: 'graduated' | 'current' | 'future' | 'unknown'
  label: string
} {
  if (!gradYear) {
    return { status: 'unknown', label: 'Unknown' }
  }

  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth()

  // Graduation typically in May/June (month 4/5)
  const graduatedThisYear = currentMonth >= 5

  if (gradYear < currentYear || (gradYear === currentYear && graduatedThisYear)) {
    return { status: 'graduated', label: 'Graduated' }
  }

  if (gradYear === currentYear || gradYear === currentYear + 1) {
    return { status: 'current', label: 'Current Student' }
  }

  return { status: 'future', label: 'Future Graduate' }
}

/**
 * Format student for display in select/dropdown
 */
export function formatStudentOption(student: {
  id: string
  firstName: string
  lastName: string
  grade?: number | null
  email?: string | null
}): {
  value: string
  label: string
  description?: string
} {
  const name = formatStudentName(student.firstName, student.lastName)
  const parts = [name]

  if (student.grade) {
    parts.push(`Grade ${student.grade}`)
  }

  if (student.email) {
    parts.push(student.email)
  }

  return {
    value: student.id,
    label: name,
    description: parts.slice(1).join(' • '),
  }
}

/**
 * Calculate team statistics
 */
export function calculateTeamStats(students: Array<{ grade: number | null }>) {
  const total = students.length
  const withGrade = students.filter((s) => s.grade !== null)

  const grades = withGrade.map((s) => s.grade!)
  const avgGrade =
    grades.length > 0 ? grades.reduce((a, b) => a + b, 0) / grades.length : null

  const minGrade = grades.length > 0 ? Math.min(...grades) : null
  const maxGrade = grades.length > 0 ? Math.max(...grades) : null

  return {
    total,
    withGrade: withGrade.length,
    withoutGrade: total - withGrade.length,
    averageGrade: avgGrade ? Math.round(avgGrade * 10) / 10 : null,
    minGrade,
    maxGrade,
  }
}

/**
 * Export students to CSV format
 */
export function exportStudentsToCSV(
  students: Array<{
    firstName: string
    lastName: string
    email: string | null
    phone: string | null
    grade: number | null
    gradYear: number | null
  }>
): string {
  const headers = ['First Name', 'Last Name', 'Email', 'Phone', 'Grade', 'Grad Year']
  const rows = students.map((s) => [
    s.firstName,
    s.lastName,
    s.email || '',
    s.phone || '',
    s.grade?.toString() || '',
    s.gradYear?.toString() || '',
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n')

  return csvContent
}

/**
 * Get student list for download
 */
export function downloadStudentCSV(
  students: Array<{
    firstName: string
    lastName: string
    email: string | null
    phone: string | null
    grade: number | null
    gradYear: number | null
  }>,
  filename: string = 'students.csv'
) {
  const csv = exportStudentsToCSV(students)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}
