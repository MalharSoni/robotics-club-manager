"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/supabase/card";
import { Button } from "@/components/ui/supabase/button";
import { Input } from "@/components/ui/supabase/input";
import { Badge } from "@/components/ui/supabase/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { cn, getInitials, formatDate } from "@/lib/utils";
import {
  getSessionData,
  recordAttendance,
  recordPerformanceRating,
  saveXFactorNote,
  updateWorkProgress,
  bulkMarkAllPresent,
  getAttendanceStreak,
  getLastWeekRating,
} from "@/app/actions/daily-stats";
import {
  XFACTOR_TAGS,
  RATING_DESCRIPTORS,
  ATTENDANCE_COLORS,
  getNextSaturday,
  getPreviousSaturday,
  formatSaturdayDate,
  isSaturday,
  type AttendanceRecord,
} from "@/lib/validations/daily-stats";
import {
  Calendar as CalendarIcon,
  Save,
  Search,
  Star,
  CheckCircle2,
  Circle,
  Loader2,
  Undo2,
  Redo2,
  Filter,
  Download,
  Zap,
  TrendingUp,
  Award,
  AlertCircle,
  Check,
  X,
  Users,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Types
interface StudentData {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  grade: number | null;
  avatar: string | null;
  attendance: {
    id: string;
    status: "PRESENT" | "ABSENT" | "EXCUSED";
    notes: string | null;
  } | null;
  performance: {
    id: string;
    rating: number;
    notes: string | null;
  } | null;
  xFactorNotes: Array<{
    id: string;
    note: string;
    tags: string[];
    createdAt: Date;
  }>;
  tasks: Array<{
    id: string;
    title: string;
    status: string;
  }>;
}

interface SessionData {
  date: Date;
  students: StudentData[];
}

// Student Card Component
const StudentStatsCard = ({
  student,
  onAttendanceChange,
  onRatingChange,
  onNoteAdd,
  onTaskToggle,
  streak,
  lastWeekRating,
  saving,
}: {
  student: StudentData;
  onAttendanceChange: (status: "PRESENT" | "ABSENT" | "EXCUSED") => void;
  onRatingChange: (rating: number) => void;
  onNoteAdd: (note: string, tags: string[]) => void;
  onTaskToggle: (taskId: string, completed: boolean) => void;
  streak: number;
  lastWeekRating: number | null;
  saving: boolean;
}) => {
  const [noteExpanded, setNoteExpanded] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showTasks, setShowTasks] = useState(false);

  const currentRating = student.performance?.rating ?? 0;
  const currentAttendance = student.attendance?.status;

  const completedTasks = student.tasks.filter((t) => t.status === "COMPLETED").length;
  const progressPercent = student.tasks.length > 0
    ? Math.round((completedTasks / student.tasks.length) * 100)
    : 0;

  const handleTagClick = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleNoteSave = () => {
    if (noteText.trim()) {
      onNoteAdd(noteText.trim(), selectedTags);
      setNoteText("");
      setSelectedTags([]);
      setNoteExpanded(false);
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        {/* Header */}
        <div className="w-full mb-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-16 w-16 border-2 border-border">
                <AvatarImage src={student.avatar || undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                  {getInitials(`${student.firstName} ${student.lastName}`)}
                </AvatarFallback>
              </Avatar>
              {saving && (
                <div className="absolute -top-1 -right-1">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-foreground">
                {student.firstName} {student.lastName}
              </h3>
              <p className="text-sm text-muted-foreground">
                Grade {student.grade || "N/A"}
              </p>
              {streak > 0 && (
                <Badge variant="secondary" className="mt-1">
                  <Zap className="h-3 w-3 mr-1" />
                  {streak} week streak!
                </Badge>
              )}
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Attendance */}
        <div className="w-full mb-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Attendance
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["PRESENT", "ABSENT", "EXCUSED"] as const).map((status) => (
                <Button
                  key={status}
                  onClick={() => onAttendanceChange(status)}
                  variant="outline"
                  className={cn(
                    "transition-all",
                    currentAttendance === status
                      ? ATTENDANCE_COLORS[status]
                      : "hover:bg-accent"
                  )}
                >
                  {status === "PRESENT" && <Check className="h-4 w-4 mr-1" />}
                  {status === "ABSENT" && <X className="h-4 w-4 mr-1" />}
                  {status === "EXCUSED" && <AlertCircle className="h-4 w-4 mr-1" />}
                  {status.charAt(0) + status.slice(1).toLowerCase()}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Performance Rating */}
        <div className="w-full mb-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Award className="h-4 w-4" />
              Performance Rating
              {lastWeekRating && (
                <span className="text-xs text-muted-foreground">
                  (Last week: {lastWeekRating}/5)
                </span>
              )}
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => onRatingChange(rating)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={cn(
                      "h-8 w-8 transition-colors",
                      rating <= currentRating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted hover:text-muted-foreground"
                    )}
                  />
                </button>
              ))}
            </div>
            {currentRating > 0 && (
              <p className="text-xs text-muted-foreground italic">
                {RATING_DESCRIPTORS[currentRating]}
              </p>
            )}
          </div>
        </div>

        {/* X-Factor Notes */}
        <div className="w-full mb-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              X-Factor Notes
            </label>
            {!noteExpanded ? (
              <Button
                onClick={() => setNoteExpanded(true)}
                variant="outline"
                className="w-full border-dashed"
              >
                Add Note
              </Button>
            ) : (
              <div className="space-y-2">
                <Textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value.slice(0, 280))}
                  placeholder="What stood out today?"
                  className="min-h-[80px]"
                />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{noteText.length}/280</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {XFACTOR_TAGS.map((tag) => (
                    <Badge
                      key={tag}
                      onClick={() => handleTagClick(tag)}
                      variant={selectedTags.includes(tag) ? "default" : "outline"}
                      className="cursor-pointer transition-all"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleNoteSave}
                    disabled={!noteText.trim()}
                    className="flex-1"
                  >
                    Save Note
                  </Button>
                  <Button
                    onClick={() => {
                      setNoteExpanded(false);
                      setNoteText("");
                      setSelectedTags([]);
                    }}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
            {student.xFactorNotes.length > 0 && (
              <div className="mt-2 space-y-1 max-h-20 overflow-y-auto">
                {student.xFactorNotes.slice(0, 3).map((note) => (
                  <div
                    key={note.id}
                    className="text-xs text-muted-foreground bg-muted p-2 rounded"
                  >
                    {note.note}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Work Progress */}
        <div className="w-full">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Work Progress
              </label>
              <span className="text-xs text-muted-foreground">
                {completedTasks}/{student.tasks.length} completed
              </span>
            </div>
            <Progress
              value={progressPercent}
              className="h-2"
            />
            {student.tasks.length > 0 && (
              <Button
                onClick={() => setShowTasks(!showTasks)}
                variant="ghost"
                size="sm"
                className="w-full text-xs"
              >
                {showTasks ? "Hide" : "Show"} Tasks
              </Button>
            )}
            {showTasks && (
              <div className="space-y-1">
                {student.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-2 text-sm"
                  >
                    <button
                      onClick={() =>
                        onTaskToggle(task.id, task.status !== "COMPLETED")
                      }
                      className="flex-shrink-0"
                    >
                      {task.status === "COMPLETED" ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <Circle className="h-4 w-4 text-muted" />
                      )}
                    </button>
                    <span
                      className={cn(
                        "flex-1 text-xs",
                        task.status === "COMPLETED"
                          ? "line-through text-muted-foreground"
                          : "text-foreground"
                      )}
                    >
                      {task.title}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Main Page Component
export default function StudentStatsPage() {
  const [sessionDate, setSessionDate] = useState<Date>(getNextSaturday());
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingStates, setSavingStates] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [filterActive, setFilterActive] = useState(false);
  const { toast } = useToast();

  // Load session data
  const loadSessionData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSessionData(sessionDate);
      setSessionData(data as SessionData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load session data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [sessionDate, toast]);

  useEffect(() => {
    loadSessionData();
  }, [loadSessionData]);

  // Auto-save helper with optimistic updates
  const autoSave = useCallback(
    async (
      studentId: string,
      action: () => Promise<{ success: boolean; error?: string }>
    ) => {
      setSavingStates((prev) => ({ ...prev, [studentId]: true }));
      try {
        const result = await action();
        if (!result.success) {
          toast({
            title: "Error",
            description: result.error || "Failed to save",
            variant: "destructive",
          });
          // Reload data on error
          await loadSessionData();
        }
      } finally {
        setSavingStates((prev) => ({ ...prev, [studentId]: false }));
      }
    },
    [toast, loadSessionData]
  );

  // Handlers
  const handleAttendanceChange = useCallback(
    (studentId: string, status: "PRESENT" | "ABSENT" | "EXCUSED") => {
      // Optimistic update
      setSessionData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          students: prev.students.map((s) =>
            s.id === studentId
              ? {
                  ...s,
                  attendance: {
                    id: s.attendance?.id || "",
                    status,
                    notes: s.attendance?.notes || null,
                  },
                }
              : s
          ),
        };
      });

      autoSave(studentId, () =>
        recordAttendance({
          studentId,
          date: sessionDate,
          status,
        })
      );
    },
    [sessionDate, autoSave]
  );

  const handleRatingChange = useCallback(
    (studentId: string, rating: number) => {
      // Optimistic update
      setSessionData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          students: prev.students.map((s) =>
            s.id === studentId
              ? {
                  ...s,
                  performance: {
                    id: s.performance?.id || "",
                    rating,
                    notes: s.performance?.notes || null,
                  },
                }
              : s
          ),
        };
      });

      autoSave(studentId, () =>
        recordPerformanceRating({
          studentId,
          date: sessionDate,
          rating,
        })
      );
    },
    [sessionDate, autoSave]
  );

  const handleNoteAdd = useCallback(
    (studentId: string, note: string, tags: string[]) => {
      autoSave(studentId, async () => {
        const result = await saveXFactorNote({
          studentId,
          date: sessionDate,
          note,
          tags,
        });
        if (result.success) {
          await loadSessionData();
        }
        return result;
      });
    },
    [sessionDate, autoSave, loadSessionData]
  );

  const handleTaskToggle = useCallback(
    (studentId: string, taskId: string, completed: boolean) => {
      const student = sessionData?.students.find((s) => s.id === studentId);
      if (!student) return;

      const taskIds = student.tasks.map((t) => t.id);
      const completedIds = student.tasks
        .filter((t) => t.status === "COMPLETED" || (t.id === taskId && completed))
        .map((t) => t.id);

      autoSave(studentId, () =>
        updateWorkProgress({
          studentId,
          date: sessionDate,
          taskIds,
          completedTaskIds: completedIds,
        })
      );
    },
    [sessionData, sessionDate, autoSave]
  );

  const handleBulkMarkPresent = useCallback(async () => {
    if (!sessionData) return;
    const studentIds = sessionData.students.map((s) => s.id);

    setLoading(true);
    const result = await bulkMarkAllPresent(sessionDate, studentIds);
    if (result.success) {
      toast({
        title: "Success",
        description: "Marked all students as present",
      });
      await loadSessionData();
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to mark all present",
        variant: "destructive",
      });
    }
    setLoading(false);
  }, [sessionData, sessionDate, toast, loadSessionData]);

  // Filtered students
  const filteredStudents = useMemo(() => {
    if (!sessionData) return [];
    let students = sessionData.students;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      students = students.filter(
        (s) =>
          s.firstName.toLowerCase().includes(query) ||
          s.lastName.toLowerCase().includes(query)
      );
    }

    return students;
  }, [sessionData, searchQuery]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Implement keyboard shortcuts here
      // 1-5 for ratings, P/A/E for attendance
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  if (loading && !sessionData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading session data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Student Stats Quick-Entry
              </h1>
              <p className="text-muted-foreground mt-1">
                Saturday Session: {formatSaturdayDate(sessionDate)}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    Change Date
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={sessionDate}
                    onSelect={(date) => date && isSaturday(date) && setSessionDate(date)}
                    disabled={(date) => !isSaturday(date)}
                    className="rounded-md"
                  />
                </PopoverContent>
              </Popover>

              <Button
                onClick={handleBulkMarkPresent}
                variant="outline"
              >
                <Users className="h-4 w-4 mr-2" />
                Mark All Present
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mt-4 flex items-center gap-2">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search students..."
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Students Grid */}
      <div className="container mx-auto px-4 py-8">
        {filteredStudents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No students found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudents.map((student) => (
              <StudentStatsCard
                key={student.id}
                student={student}
                onAttendanceChange={(status) =>
                  handleAttendanceChange(student.id, status)
                }
                onRatingChange={(rating) =>
                  handleRatingChange(student.id, rating)
                }
                onNoteAdd={(note, tags) =>
                  handleNoteAdd(student.id, note, tags)
                }
                onTaskToggle={(taskId, completed) =>
                  handleTaskToggle(student.id, taskId, completed)
                }
                streak={0} // TODO: Load from API
                lastWeekRating={null} // TODO: Load from API
                saving={savingStates[student.id] || false}
              />
            ))}
          </div>
        )}
      </div>

      {/* Status Indicator */}
      <div className="fixed bottom-8 right-8 z-50">
        <Button variant="default" className="shadow-lg">
          <Save className="h-5 w-5 mr-2" />
          All Changes Saved
        </Button>
      </div>
    </div>
  );
}
