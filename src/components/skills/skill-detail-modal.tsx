'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getSkillById } from '@/app/actions/skills'
import { ProficiencyBadge, ProficiencyChart } from './proficiency-chart'
import { AssessmentDialog } from './assessment-dialog'
import { SkillFormDialog } from './skill-form-dialog'
import { SkillCategory, SkillLevel } from '@prisma/client'
import {
  Users,
  CheckCircle,
  Edit,
  UserPlus,
  Calendar,
  ExternalLink,
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { formatDistanceToNow } from 'date-fns'

interface SkillDetailModalProps {
  skillId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onRefresh?: () => void
}

const CATEGORY_COLORS: Record<SkillCategory, string> = {
  MECHANICAL: 'bg-orange-100 text-orange-800',
  ELECTRICAL: 'bg-yellow-100 text-yellow-800',
  PROGRAMMING: 'bg-blue-100 text-blue-800',
  CAD_DESIGN: 'bg-purple-100 text-purple-800',
  PROJECT_MANAGEMENT: 'bg-green-100 text-green-800',
  COMMUNICATION: 'bg-pink-100 text-pink-800',
  LEADERSHIP: 'bg-indigo-100 text-indigo-800',
  PROBLEM_SOLVING: 'bg-teal-100 text-teal-800',
}

export function SkillDetailModal({
  skillId,
  open,
  onOpenChange,
  onRefresh,
}: SkillDetailModalProps) {
  const [skill, setSkill] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showAssessDialog, setShowAssessDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (skillId && open) {
      loadSkill()
    }
  }, [skillId, open])

  const loadSkill = async () => {
    if (!skillId) return

    setIsLoading(true)
    try {
      const result = await getSkillById(skillId)
      if (result.error) {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        })
      } else {
        setSkill(result.skill)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load skill details',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuccess = () => {
    loadSkill()
    onRefresh?.()
  }

  if (!skill && !isLoading) {
    return null
  }

  const proficiencyDistribution = {
    BEGINNER: skill?.students.filter((s: any) => s.proficiency === 'BEGINNER').length || 0,
    INTERMEDIATE: skill?.students.filter((s: any) => s.proficiency === 'INTERMEDIATE').length || 0,
    ADVANCED: skill?.students.filter((s: any) => s.proficiency === 'ADVANCED').length || 0,
    EXPERT: skill?.students.filter((s: any) => s.proficiency === 'EXPERT').length || 0,
  }

  const totalStudents = skill?.students.length || 0

  // Get all students for assessment (you'd fetch this from a separate endpoint in production)
  const availableStudents = skill?.students.map((s: any) => ({
    id: s.student.id,
    firstName: s.student.firstName,
    lastName: s.student.lastName,
    avatar: s.student.avatar,
    currentProficiency: s.proficiency,
  })) || []

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          {isLoading ? (
            <div className="py-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto" />
              <p className="mt-4 text-gray-600">Loading skill details...</p>
            </div>
          ) : skill ? (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <DialogTitle className="text-2xl">{skill.name}</DialogTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={CATEGORY_COLORS[skill.category as SkillCategory]}>
                        {skill.category.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowEditDialog(true)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button size="sm" onClick={() => setShowAssessDialog(true)}>
                      <UserPlus className="h-4 w-4 mr-1" />
                      Assess
                    </Button>
                  </div>
                </div>
                {skill.description && (
                  <DialogDescription className="text-base mt-2">
                    {skill.description}
                  </DialogDescription>
                )}
              </DialogHeader>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <Users className="h-4 w-4" />
                    <span className="text-sm font-medium">Total Students</span>
                  </div>
                  <div className="text-2xl font-bold">{totalStudents}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-600 mb-1">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Verified</span>
                  </div>
                  <div className="text-2xl font-bold">
                    {skill.students.filter((s: any) => s.verified).length}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-600 mb-1">
                    Latest Update
                  </div>
                  <div className="text-lg font-semibold">
                    {skill.students.length > 0
                      ? formatDistanceToNow(new Date(skill.updatedAt), {
                          addSuffix: true,
                        })
                      : 'Never'}
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Proficiency Distribution */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Proficiency Distribution</h3>
                <ProficiencyChart
                  distribution={proficiencyDistribution}
                  total={totalStudents}
                />
              </div>

              <Separator className="my-6" />

              {/* Students Table */}
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Students with This Skill ({totalStudents})
                </h3>
                {totalStudents > 0 ? (
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student</TableHead>
                          <TableHead>Proficiency</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Updated</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {skill.students.map((studentSkill: any) => (
                          <TableRow key={studentSkill.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={studentSkill.student.avatar || undefined} />
                                  <AvatarFallback>
                                    {studentSkill.student.firstName[0]}
                                    {studentSkill.student.lastName[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">
                                    {studentSkill.student.firstName}{' '}
                                    {studentSkill.student.lastName}
                                  </div>
                                  {studentSkill.student.email && (
                                    <div className="text-xs text-gray-500">
                                      {studentSkill.student.email}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <ProficiencyBadge level={studentSkill.proficiency as SkillLevel} />
                            </TableCell>
                            <TableCell>
                              {studentSkill.verified ? (
                                <Badge className="bg-green-100 text-green-800">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Verified
                                </Badge>
                              ) : (
                                <Badge variant="secondary">Unverified</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-sm text-gray-500">
                              {formatDistanceToNow(new Date(studentSkill.updatedAt), {
                                addSuffix: true,
                              })}
                            </TableCell>
                            <TableCell className="text-right">
                              {studentSkill.evidenceUrl && (
                                <a
                                  href={studentSkill.evidenceUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Button variant="ghost" size="sm">
                                    <ExternalLink className="h-4 w-4" />
                                  </Button>
                                </a>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12 border rounded-lg bg-gray-50">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No students assessed for this skill yet</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={() => setShowAssessDialog(true)}
                    >
                      Assess Students
                    </Button>
                  </div>
                )}
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      {skill && (
        <>
          <AssessmentDialog
            open={showAssessDialog}
            onOpenChange={setShowAssessDialog}
            skill={{ id: skill.id, name: skill.name }}
            students={availableStudents}
            onSuccess={handleSuccess}
          />
          <SkillFormDialog
            open={showEditDialog}
            onOpenChange={setShowEditDialog}
            skill={skill}
            onSuccess={handleSuccess}
          />
        </>
      )}
    </>
  )
}
