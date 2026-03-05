'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Student, Team, Skill, Task } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { StudentFormDialog } from './student-form-dialog'

type StudentWithRelations = Student & {
  teams: Array<{ team: Team; primaryRole: string | null }>
  skills: Array<{ skill: Skill }>
  tasks: Array<{ task: Task }>
}

interface StudentListClientProps {
  initialStudents: StudentWithRelations[]
}

export function StudentListClient({ initialStudents }: StudentListClientProps) {
  const [students, setStudents] = useState<StudentWithRelations[]>(initialStudents)
  const [searchQuery, setSearchQuery] = useState('')
  const [gradeFilter, setGradeFilter] = useState<string>('all')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [isFormOpen, setIsFormOpen] = useState(false)

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch =
        searchQuery === '' ||
        student.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesGrade = gradeFilter === 'all' || student.grade?.toString() === gradeFilter

      const matchesRole =
        roleFilter === 'all' ||
        student.teams.some((tm) => tm.primaryRole === roleFilter)

      return matchesSearch && matchesGrade && matchesRole
    })
  }, [students, searchQuery, gradeFilter, roleFilter])

  const getInitials = (firstName: string, lastName: string) => {
    return firstName.charAt(0) + lastName.charAt(0)
  }

  const getRoleBadgeColor = (role: string | null) => {
    if (role === 'DRIVER') return 'info'
    if (role === 'PROGRAMMER') return 'success'
    if (role === 'BUILDER') return 'warning'
    if (role === 'DESIGNER') return 'secondary'
    if (role === 'SCOUT') return 'outline'
    if (role === 'NOTEBOOK_KEEPER') return 'default'
    return 'outline'
  }

  const formatRole = (role: string | null) => {
    if (!role) return 'No Role'
    return role.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ')
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search students by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={gradeFilter} onValueChange={setGradeFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Grade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Grades</SelectItem>
                <SelectItem value="12">Grade 12</SelectItem>
                <SelectItem value="11">Grade 11</SelectItem>
                <SelectItem value="10">Grade 10</SelectItem>
                <SelectItem value="9">Grade 9</SelectItem>
              </SelectContent>
            </Select>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="DRIVER">Driver</SelectItem>
                <SelectItem value="PROGRAMMER">Programmer</SelectItem>
                <SelectItem value="BUILDER">Builder</SelectItem>
                <SelectItem value="DESIGNER">Designer</SelectItem>
                <SelectItem value="SCOUT">Scout</SelectItem>
                <SelectItem value="NOTEBOOK_KEEPER">Notebook Keeper</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => setIsFormOpen(true)}>
              Add Student
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredStudents.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">No students found matching your filters.</p>
            </CardContent>
          </Card>
        ) : (
          filteredStudents.map((student) => {
            const primaryRole = student.teams[0]?.primaryRole
            const skillCount = student.skills.length
            const taskCount = student.tasks.filter((t) => t.task.status !== 'COMPLETED').length

            return (
              <Link key={student.id} href={`/dashboard/students/${student.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-blue-600 text-white">
                            {getInitials(student.firstName, student.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">
                            {student.firstName} {student.lastName}
                          </CardTitle>
                          <p className="text-sm text-gray-500">
                            Grade {student.grade} - Class of {student.gradYear}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {primaryRole && (
                        <Badge variant={getRoleBadgeColor(primaryRole) as any}>
                          {formatRole(primaryRole)}
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Skills</p>
                        <p className="font-semibold">{skillCount}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Active Tasks</p>
                        <p className="font-semibold">{taskCount}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })
        )}
      </div>

      <StudentFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSuccess={(newStudent) => {
          setStudents((prev) => [...prev, newStudent as any])
          setIsFormOpen(false)
        }}
      />
    </div>
  )
}
