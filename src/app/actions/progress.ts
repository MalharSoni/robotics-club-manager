'use server'

/**
 * Progress tracking Server Actions
 *
 * Provides functions for coaches to update student progress on bootcamp milestones
 * and portfolio projects. These actions support photo evidence linking and detailed
 * progress tracking through the CurriculumProgress model.
 *
 * Note: Core implementation in curriculum.ts to maintain consistency with existing
 * curriculum progress tracking patterns. This file re-exports the relevant functions.
 */

export { updateStudentProgress, getStudentBootcampProgress } from './curriculum'
