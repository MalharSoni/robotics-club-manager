'use client'

import { useState } from 'react'
import { CurriculumCategory, SkillLevel, ProgressStatus } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, X, Filter } from 'lucide-react'

interface ModuleFiltersProps {
  onFilterChange: (filters: {
    category?: CurriculumCategory
    difficultyLevel?: SkillLevel
    status?: ProgressStatus
    search?: string
  }) => void
  showStatusFilter?: boolean
}

const categoryOptions: { value: CurriculumCategory; label: string }[] = [
  { value: 'MECHANICAL', label: 'Mechanical' },
  { value: 'ELECTRICAL', label: 'Electrical' },
  { value: 'PROGRAMMING', label: 'Programming' },
  { value: 'CAD_DESIGN', label: 'CAD/Design' },
  { value: 'NOTEBOOK', label: 'Notebook' },
  { value: 'SOFT_SKILLS', label: 'Soft Skills' },
  { value: 'COMPETITION_STRATEGY', label: 'Competition Strategy' },
  { value: 'SAFETY', label: 'Safety' },
]

const levelOptions: { value: SkillLevel; label: string }[] = [
  { value: 'BEGINNER', label: 'Beginner' },
  { value: 'INTERMEDIATE', label: 'Intermediate' },
  { value: 'ADVANCED', label: 'Advanced' },
  { value: 'EXPERT', label: 'Expert' },
]

const statusOptions: { value: ProgressStatus; label: string }[] = [
  { value: 'NOT_STARTED', label: 'Not Started' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'MASTERED', label: 'Mastered' },
]

export function ModuleFilters({ onFilterChange, showStatusFilter = false }: ModuleFiltersProps) {
  const [filters, setFilters] = useState<{
    category?: CurriculumCategory
    difficultyLevel?: SkillLevel
    status?: ProgressStatus
    search?: string
  }>({})

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = {
      ...filters,
      [key]: value || undefined,
    }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const clearFilters = () => {
    setFilters({})
    onFilterChange({})
  }

  const activeFilterCount = Object.values(filters).filter(Boolean).length

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            <CardTitle className="text-lg">Filters</CardTitle>
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFilterCount}
              </Badge>
            )}
          </div>
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-8"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search">Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search modules..."
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={filters.category || 'all'}
            onValueChange={(value) =>
              handleFilterChange('category', value === 'all' ? undefined : value)
            }
          >
            <SelectTrigger id="category">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categoryOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Difficulty Level */}
        <div className="space-y-2">
          <Label htmlFor="level">Difficulty Level</Label>
          <Select
            value={filters.difficultyLevel || 'all'}
            onValueChange={(value) =>
              handleFilterChange('difficultyLevel', value === 'all' ? undefined : value)
            }
          >
            <SelectTrigger id="level">
              <SelectValue placeholder="All Levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              {levelOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status (optional) */}
        {showStatusFilter && (
          <div className="space-y-2">
            <Label htmlFor="status">Progress Status</Label>
            <Select
              value={filters.status || 'all'}
              onValueChange={(value) =>
                handleFilterChange('status', value === 'all' ? undefined : value)
              }
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Active Filters Display */}
        {activeFilterCount > 0 && (
          <div className="pt-4 border-t space-y-2">
            <div className="text-sm font-medium">Active Filters:</div>
            <div className="flex flex-wrap gap-2">
              {filters.category && (
                <Badge variant="secondary">
                  Category:{' '}
                  {categoryOptions.find((o) => o.value === filters.category)?.label}
                  <button
                    onClick={() => handleFilterChange('category', undefined)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.difficultyLevel && (
                <Badge variant="secondary">
                  Level:{' '}
                  {levelOptions.find((o) => o.value === filters.difficultyLevel)?.label}
                  <button
                    onClick={() => handleFilterChange('difficultyLevel', undefined)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.status && (
                <Badge variant="secondary">
                  Status: {statusOptions.find((o) => o.value === filters.status)?.label}
                  <button
                    onClick={() => handleFilterChange('status', undefined)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.search && (
                <Badge variant="secondary">
                  Search: "{filters.search}"
                  <button
                    onClick={() => handleFilterChange('search', undefined)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
