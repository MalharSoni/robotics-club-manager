'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { format } from 'date-fns'

interface SkillsTabProps {
  student: {
    id: string
    firstName: string
    lastName: string
    skills: Array<{
      skill: {
        id: string
        name: string
        description: string | null
        category: string
      }
      proficiency: string
      verified: boolean
      notes: string | null
      acquiredAt: Date
    }>
  }
}

const PROFICIENCY_COLORS = {
  BEGINNER: 'bg-gray-100 text-gray-800 border-gray-300',
  INTERMEDIATE: 'bg-blue-100 text-blue-800 border-blue-300',
  ADVANCED: 'bg-green-100 text-green-800 border-green-300',
  EXPERT: 'bg-purple-100 text-purple-800 border-purple-300',
}

const PROFICIENCY_VALUES = {
  BEGINNER: 25,
  INTERMEDIATE: 50,
  ADVANCED: 75,
  EXPERT: 100,
}

export function SkillsTab({ student }: SkillsTabProps) {
  // Group skills by category
  const skillsByCategory = student.skills.reduce(
    (acc, skill) => {
      const categoryName = skill.skill.category
      if (!acc[categoryName]) {
        acc[categoryName] = []
      }
      acc[categoryName].push(skill)
      return acc
    },
    {} as Record<string, typeof student.skills>
  )

  // Sort categories alphabetically
  const sortedCategories = Object.keys(skillsByCategory).sort()

  // Calculate proficiency stats
  const proficiencyStats = {
    BEGINNER: student.skills.filter((s) => s.proficiency === 'BEGINNER').length,
    INTERMEDIATE: student.skills.filter((s) => s.proficiency === 'INTERMEDIATE').length,
    ADVANCED: student.skills.filter((s) => s.proficiency === 'ADVANCED').length,
    EXPERT: student.skills.filter((s) => s.proficiency === 'EXPERT').length,
  }

  const totalSkills = student.skills.length

  return (
    <div className="space-y-6">
      {/* Skills Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Skills Overview</CardTitle>
          <CardDescription>
            {totalSkills} skills across {sortedCategories.length} categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Beginner</span>
                <Badge className={PROFICIENCY_COLORS.BEGINNER} variant="outline">
                  {proficiencyStats.BEGINNER}
                </Badge>
              </div>
              <Progress value={(proficiencyStats.BEGINNER / totalSkills) * 100} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Intermediate</span>
                <Badge className={PROFICIENCY_COLORS.INTERMEDIATE} variant="outline">
                  {proficiencyStats.INTERMEDIATE}
                </Badge>
              </div>
              <Progress value={(proficiencyStats.INTERMEDIATE / totalSkills) * 100} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Advanced</span>
                <Badge className={PROFICIENCY_COLORS.ADVANCED} variant="outline">
                  {proficiencyStats.ADVANCED}
                </Badge>
              </div>
              <Progress value={(proficiencyStats.ADVANCED / totalSkills) * 100} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Expert</span>
                <Badge className={PROFICIENCY_COLORS.EXPERT} variant="outline">
                  {proficiencyStats.EXPERT}
                </Badge>
              </div>
              <Progress value={(proficiencyStats.EXPERT / totalSkills) * 100} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skills Matrix by Category */}
      {totalSkills === 0 ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-gray-500">
              No skills assigned yet. Assign skills to track this student's progress.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedCategories.map((categoryName) => {
            const categorySkills = skillsByCategory[categoryName]

            return (
              <Card key={categoryName}>
                <CardHeader>
                  <CardTitle className="text-lg">{categoryName.replace('_', ' ')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {categorySkills.map((skillAssignment) => (
                      <div
                        key={skillAssignment.skill.id}
                        className="border-b pb-4 last:border-0 last:pb-0"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{skillAssignment.skill.name}</h4>
                              <Badge
                                className={
                                  PROFICIENCY_COLORS[
                                    skillAssignment.proficiency as keyof typeof PROFICIENCY_COLORS
                                  ]
                                }
                                variant="outline"
                              >
                                {skillAssignment.proficiency}
                              </Badge>
                              {skillAssignment.verified && (
                                <Badge className="bg-green-100 text-green-800 border-green-300" variant="outline">
                                  Verified
                                </Badge>
                              )}
                            </div>

                            {skillAssignment.skill.description && (
                              <p className="text-sm text-gray-600">
                                {skillAssignment.skill.description}
                              </p>
                            )}

                            <div className="space-y-1">
                              <Progress
                                value={
                                  PROFICIENCY_VALUES[
                                    skillAssignment.proficiency as keyof typeof PROFICIENCY_VALUES
                                  ]
                                }
                                className="h-2"
                              />
                              <div className="flex items-center justify-between text-xs text-gray-500">
                                <span>
                                  Acquired {format(new Date(skillAssignment.acquiredAt), 'MMM d, yyyy')}
                                </span>
                                <span>
                                  {
                                    PROFICIENCY_VALUES[
                                      skillAssignment.proficiency as keyof typeof PROFICIENCY_VALUES
                                    ]
                                  }
                                  % proficiency
                                </span>
                              </div>
                            </div>

                            {skillAssignment.notes && (
                              <div className="bg-gray-50 rounded-md p-3 mt-2">
                                <p className="text-sm text-gray-700">
                                  <span className="font-medium">Notes:</span> {skillAssignment.notes}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Proficiency Levels</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <Badge className={PROFICIENCY_COLORS.BEGINNER} variant="outline">
                Beginner
              </Badge>
              <p className="text-xs text-gray-600">Learning the basics</p>
            </div>
            <div className="space-y-1">
              <Badge className={PROFICIENCY_COLORS.INTERMEDIATE} variant="outline">
                Intermediate
              </Badge>
              <p className="text-xs text-gray-600">Can work with guidance</p>
            </div>
            <div className="space-y-1">
              <Badge className={PROFICIENCY_COLORS.ADVANCED} variant="outline">
                Advanced
              </Badge>
              <p className="text-xs text-gray-600">Works independently</p>
            </div>
            <div className="space-y-1">
              <Badge className={PROFICIENCY_COLORS.EXPERT} variant="outline">
                Expert
              </Badge>
              <p className="text-xs text-gray-600">Can teach others</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
