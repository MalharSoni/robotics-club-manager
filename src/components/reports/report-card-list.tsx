'use client'

import { useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { FileText, Search, Filter, Eye, Edit, CheckCircle, Circle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Student {
  id: string
  firstName: string
  lastName: string
}

interface Team {
  id: string
  name: string
}

interface ReportCard {
  id: string
  studentId: string
  teamId: string
  periodName: string
  startDate: Date
  endDate: Date
  published: boolean
  publishedAt: Date | null
  attendance: number | null
  createdAt: Date
  updatedAt: Date
  student: Student
  team: Team
}

interface ReportCardListProps {
  reportCards: ReportCard[]
}

export function ReportCardList({ reportCards }: ReportCardListProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published'>('all')
  const [periodFilter, setPeriodFilter] = useState<string>('all')

  // Get unique periods
  const periods = Array.from(new Set(reportCards.map((rc) => rc.periodName)))

  // Filter report cards
  const filteredReportCards = reportCards.filter((rc) => {
    const matchesSearch =
      search === '' ||
      `${rc.student.firstName} ${rc.student.lastName}`
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      rc.periodName.toLowerCase().includes(search.toLowerCase())

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'draft' && !rc.published) ||
      (statusFilter === 'published' && rc.published)

    const matchesPeriod = periodFilter === 'all' || rc.periodName === periodFilter

    return matchesSearch && matchesStatus && matchesPeriod
  })

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by student name or period..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>

            <Select value={periodFilter} onValueChange={setPeriodFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Periods</SelectItem>
                {periods.map((period) => (
                  <SelectItem key={period} value={period}>
                    {period}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results count */}
      <div className="text-sm text-gray-600">
        Showing {filteredReportCards.length} of {reportCards.length} report cards
      </div>

      {/* Report cards table */}
      <Card>
        <CardContent className="p-0">
          {filteredReportCards.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <FileText className="h-12 w-12 mb-4 text-gray-300" />
              <p className="text-lg font-medium">No report cards found</p>
              <p className="text-sm">Try adjusting your filters or create a new report card</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Date Range</TableHead>
                  <TableHead>Attendance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReportCards.map((rc) => (
                  <TableRow key={rc.id}>
                    <TableCell className="font-medium">
                      {rc.student.firstName} {rc.student.lastName}
                    </TableCell>
                    <TableCell>{rc.periodName}</TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {format(new Date(rc.startDate), 'MMM d')} -{' '}
                      {format(new Date(rc.endDate), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      {rc.attendance !== null ? (
                        <span className="text-sm">{rc.attendance}%</span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {rc.published ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Published
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <Circle className="h-3 w-3 mr-1" />
                          Draft
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {format(new Date(rc.updatedAt), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/dashboard/reports/${rc.id}`}>
                          <Button variant="ghost" size="sm">
                            {rc.published ? (
                              <>
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </>
                            ) : (
                              <>
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </>
                            )}
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
