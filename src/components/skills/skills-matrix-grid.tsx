'use client'

import { useState } from 'react'
import { SkillCategory, SkillLevel } from '@prisma/client'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Users, TrendingUp, CheckCircle, ArrowUpDown } from 'lucide-react'

interface SkillsMatrixGridProps {
  skills: Array<{
    id: string
    name: string
    description: string | null
    category: SkillCategory
    stats: {
      totalStudents: number
      avgProficiency: number
      proficiencyDistribution: {
        BEGINNER: number
        INTERMEDIATE: number
        ADVANCED: number
        EXPERT: number
      }
      verifiedCount: number
    }
  }>
  onSkillClick: (skillId: string) => void
}

type SortField = 'name' | 'students' | 'proficiency'
type SortDirection = 'asc' | 'desc'

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

export function SkillsMatrixGrid({ skills, onSkillClick }: SkillsMatrixGridProps) {
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortedSkills = [...skills].sort((a, b) => {
    let comparison = 0

    switch (sortField) {
      case 'name':
        comparison = a.name.localeCompare(b.name)
        break
      case 'students':
        comparison = a.stats.totalStudents - b.stats.totalStudents
        break
      case 'proficiency':
        comparison = a.stats.avgProficiency - b.stats.avgProficiency
        break
    }

    return sortDirection === 'asc' ? comparison : -comparison
  })

  const getProficiencyPercentage = (
    distribution: any,
    level: SkillLevel,
    total: number
  ) => {
    if (total === 0) return 0
    return Math.round((distribution[level] / total) * 100)
  }

  const getProficiencyLabel = (avg: number) => {
    if (avg >= 3.5) return 'Expert'
    if (avg >= 2.5) return 'Advanced'
    if (avg >= 1.5) return 'Intermediate'
    return 'Beginner'
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="w-[40%]">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort('name')}
                className="hover:bg-transparent font-semibold"
              >
                Skill Name
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="w-[15%]">Category</TableHead>
            <TableHead className="w-[15%]">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort('proficiency')}
                className="hover:bg-transparent font-semibold"
              >
                Avg Proficiency
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="w-[15%]">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort('students')}
                className="hover:bg-transparent font-semibold"
              >
                Students
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="w-[15%]">Distribution</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedSkills.length > 0 ? (
            sortedSkills.map((skill) => (
              <TableRow
                key={skill.id}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => onSkillClick(skill.id)}
              >
                <TableCell>
                  <div>
                    <div className="font-medium">{skill.name}</div>
                    {skill.description && (
                      <div className="text-sm text-gray-500 line-clamp-1 mt-0.5">
                        {skill.description}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={CATEGORY_COLORS[skill.category]} variant="secondary">
                    {skill.category.replace(/_/g, ' ')}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">
                        {skill.stats.avgProficiency.toFixed(1)}
                      </span>
                      <span className="text-gray-500 text-xs">
                        {getProficiencyLabel(skill.stats.avgProficiency)}
                      </span>
                    </div>
                    <Progress
                      value={(skill.stats.avgProficiency / 4) * 100}
                      className="h-1.5"
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{skill.stats.totalStudents}</span>
                    </div>
                    {skill.stats.verifiedCount > 0 && (
                      <div className="flex items-center gap-1.5 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm">{skill.stats.verifiedCount}</span>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-gray-100">
                      {skill.stats.proficiencyDistribution.BEGINNER > 0 && (
                        <div
                          className="bg-gray-500"
                          style={{
                            width: `${getProficiencyPercentage(
                              skill.stats.proficiencyDistribution,
                              'BEGINNER',
                              skill.stats.totalStudents
                            )}%`,
                          }}
                          title={`Beginner: ${skill.stats.proficiencyDistribution.BEGINNER}`}
                        />
                      )}
                      {skill.stats.proficiencyDistribution.INTERMEDIATE > 0 && (
                        <div
                          className="bg-blue-500"
                          style={{
                            width: `${getProficiencyPercentage(
                              skill.stats.proficiencyDistribution,
                              'INTERMEDIATE',
                              skill.stats.totalStudents
                            )}%`,
                          }}
                          title={`Intermediate: ${skill.stats.proficiencyDistribution.INTERMEDIATE}`}
                        />
                      )}
                      {skill.stats.proficiencyDistribution.ADVANCED > 0 && (
                        <div
                          className="bg-green-500"
                          style={{
                            width: `${getProficiencyPercentage(
                              skill.stats.proficiencyDistribution,
                              'ADVANCED',
                              skill.stats.totalStudents
                            )}%`,
                          }}
                          title={`Advanced: ${skill.stats.proficiencyDistribution.ADVANCED}`}
                        />
                      )}
                      {skill.stats.proficiencyDistribution.EXPERT > 0 && (
                        <div
                          className="bg-purple-500"
                          style={{
                            width: `${getProficiencyPercentage(
                              skill.stats.proficiencyDistribution,
                              'EXPERT',
                              skill.stats.totalStudents
                            )}%`,
                          }}
                          title={`Expert: ${skill.stats.proficiencyDistribution.EXPERT}`}
                        />
                      )}
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>B: {skill.stats.proficiencyDistribution.BEGINNER}</span>
                      <span>I: {skill.stats.proficiencyDistribution.INTERMEDIATE}</span>
                      <span>A: {skill.stats.proficiencyDistribution.ADVANCED}</span>
                      <span>E: {skill.stats.proficiencyDistribution.EXPERT}</span>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-12">
                <div className="text-gray-500">
                  <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">No skills found</p>
                  <p className="text-sm">Try adjusting your filters or add a new skill</p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
