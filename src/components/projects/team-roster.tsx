'use client'

import { useState } from 'react'
import { Student, ProjectRole } from '@prisma/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Trash2, Edit, Clock } from 'lucide-react'
import { assignStudentToProject, removeStudentFromProject, updateProjectRole } from '@/app/actions/projects'
import { useRouter } from 'next/navigation'
import { toast } from '@/components/ui/use-toast'

type ProjectRoleWithStudent = ProjectRole & {
  student: Student
}

interface TeamRosterProps {
  projectId: string
  roles: ProjectRoleWithStudent[]
  availableStudents: Student[]
}

export function TeamRoster({ projectId, roles, availableStudents }: TeamRosterProps) {
  const router = useRouter()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<ProjectRoleWithStudent | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [newMember, setNewMember] = useState({
    studentId: '',
    role: '',
    contributionHours: 0,
  })

  const [editData, setEditData] = useState({
    role: '',
    contributions: '',
    hoursSpent: 0,
  })

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`
  }

  const getRoleBadgeColor = (role: string) => {
    if (role.toUpperCase().includes('LEAD')) return 'default'
    if (role.toUpperCase().includes('MENTOR')) return 'secondary'
    return 'outline'
  }

  const handleAddMember = async () => {
    if (!newMember.studentId || !newMember.role) {
      toast({
        title: 'Missing Information',
        description: 'Please select a student and enter a role',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)
    const result = await assignStudentToProject({
      projectId,
      studentId: newMember.studentId,
      role: newMember.role,
      contributionHours: newMember.contributionHours,
    })

    setIsSubmitting(false)

    if ('error' in result) {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Success',
        description: 'Team member added successfully',
      })
      setIsAddDialogOpen(false)
      setNewMember({ studentId: '', role: '', contributionHours: 0 })
      router.refresh()
    }
  }

  const handleRemoveMember = async (studentId: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) {
      return
    }

    const result = await removeStudentFromProject({
      projectId,
      studentId,
    })

    if ('error' in result) {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Success',
        description: 'Team member removed successfully',
      })
      router.refresh()
    }
  }

  const handleEditRole = (role: ProjectRoleWithStudent) => {
    setSelectedRole(role)
    setEditData({
      role: role.role,
      contributions: role.contributions || '',
      hoursSpent: role.hoursSpent || 0,
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdateRole = async () => {
    if (!selectedRole) return

    setIsSubmitting(true)
    const result = await updateProjectRole({
      id: selectedRole.id,
      ...editData,
    })

    setIsSubmitting(false)

    if ('error' in result) {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Success',
        description: 'Team member updated successfully',
      })
      setIsEditDialogOpen(false)
      setSelectedRole(null)
      router.refresh()
    }
  }

  // Filter out students who are already on the project
  const unassignedStudents = availableStudents.filter(
    (student) => !roles.some((role) => role.studentId === student.id)
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Team Roster</CardTitle>
            <CardDescription>
              {roles.length} {roles.length === 1 ? 'member' : 'members'} working on this project
            </CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Team Member</DialogTitle>
                <DialogDescription>
                  Assign a student to this project with a specific role
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Student</Label>
                  <Select
                    value={newMember.studentId}
                    onValueChange={(value) =>
                      setNewMember({ ...newMember, studentId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select student" />
                    </SelectTrigger>
                    <SelectContent>
                      {unassignedStudents.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.firstName} {student.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Role</Label>
                  <Input
                    placeholder="e.g., Lead Programmer, Builder, Designer"
                    value={newMember.role}
                    onChange={(e) =>
                      setNewMember({ ...newMember, role: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Initial Hours (optional)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.5"
                    value={newMember.contributionHours}
                    onChange={(e) =>
                      setNewMember({
                        ...newMember,
                        contributionHours: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAddMember} disabled={isSubmitting}>
                    {isSubmitting ? 'Adding...' : 'Add Member'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {roles.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No team members assigned yet. Add members to get started.
          </div>
        ) : (
          <div className="space-y-3">
            {roles.map((role) => (
              <div
                key={role.id}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-blue-600 text-white">
                      {getInitials(role.student.firstName, role.student.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {role.student.firstName} {role.student.lastName}
                      </span>
                      <Badge variant={getRoleBadgeColor(role.role)}>
                        {role.role}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                      {role.student.grade && (
                        <span>Grade {role.student.grade}</span>
                      )}
                      {role.hoursSpent !== null && role.hoursSpent > 0 && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {role.hoursSpent.toFixed(1)} hrs
                        </span>
                      )}
                    </div>
                    {role.contributions && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                        {role.contributions}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEditRole(role)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveMember(role.studentId)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Edit Role Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Team Member</DialogTitle>
            <DialogDescription>
              Update role, contributions, and hours for{' '}
              {selectedRole &&
                `${selectedRole.student.firstName} ${selectedRole.student.lastName}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Role</Label>
              <Input
                value={editData.role}
                onChange={(e) => setEditData({ ...editData, role: e.target.value })}
              />
            </div>
            <div>
              <Label>Hours Spent</Label>
              <Input
                type="number"
                min="0"
                step="0.5"
                value={editData.hoursSpent}
                onChange={(e) =>
                  setEditData({ ...editData, hoursSpent: parseFloat(e.target.value) || 0 })
                }
              />
            </div>
            <div>
              <Label>Contributions</Label>
              <Textarea
                placeholder="Describe this student's contributions to the project..."
                value={editData.contributions}
                onChange={(e) =>
                  setEditData({ ...editData, contributions: e.target.value })
                }
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button onClick={handleUpdateRole} disabled={isSubmitting}>
                {isSubmitting ? 'Updating...' : 'Update'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
