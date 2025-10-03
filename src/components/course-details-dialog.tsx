'use client';

import { useState } from 'react';
import { Course, CategorizedEmail } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmailCard } from '@/components/email-card';
import {
  BookOpen,
  Users,
  Mail,
  RefreshCw,
  Loader2,
  ArrowLeft,
  Calendar,
} from 'lucide-react';

interface CourseDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: Course | null;
}

export function CourseDetailsDialog({
  open,
  onOpenChange,
  course,
}: CourseDetailsDialogProps) {
  const [emails, setEmails] = useState<CategorizedEmail[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<{
    totalAnalyzed: number;
    totalCategorized: number;
  } | null>(null);

  const handleCheckEmails = async () => {
    if (!course) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/check-emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId: course.id,
          userId: course.professorId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to check emails');
      }

      const data = await response.json();
      setEmails(data.emails);
      setStats({
        totalAnalyzed: data.totalAnalyzed,
        totalCategorized: data.totalCategorized,
      });
    } catch (error) {
      console.error('Error checking emails:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = (emailId: string) => {
    setEmails((prev) =>
      prev.map((email) =>
        email.id === emailId ? { ...email, isUnread: false } : email
      )
    );
  };

  const handleArchive = (emailId: string) => {
    setEmails((prev) => prev.filter((email) => email.id !== emailId));
  };

  const handleDelete = (emailId: string) => {
    setEmails((prev) => prev.filter((email) => email.id !== emailId));
  };

  if (!course) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-primary" />
                {course.title}
              </DialogTitle>
              <DialogDescription className="mt-2">
                {course.description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Course Stats */}
        <div className="grid grid-cols-3 gap-4 py-4 border-y">
          <div className="flex flex-col items-center justify-center p-4 bg-secondary/20 rounded-lg">
            <Users className="h-5 w-5 text-muted-foreground mb-2" />
            <div className="text-2xl font-bold">{course.studentCount}</div>
            <div className="text-sm text-muted-foreground">Students</div>
          </div>
          
          <div className="flex flex-col items-center justify-center p-4 bg-secondary/20 rounded-lg">
            <Mail className="h-5 w-5 text-muted-foreground mb-2" />
            <div className="text-2xl font-bold">{course.unreadEmailCount}</div>
            <div className="text-sm text-muted-foreground">Unread Emails</div>
          </div>
          
          <div className="flex flex-col items-center justify-center p-4 bg-secondary/20 rounded-lg">
            <Calendar className="h-5 w-5 text-muted-foreground mb-2" />
            <div className="text-sm font-semibold">
              {new Date(course.createdAt).toLocaleDateString()}
            </div>
            <div className="text-sm text-muted-foreground">Created</div>
          </div>
        </div>

        {/* Email Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Course Emails</h3>
            <Button
              onClick={handleCheckEmails}
              disabled={isLoading}
              size="sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Check Emails
                </>
              )}
            </Button>
          </div>

          {/* Stats */}
          {stats && (
            <div className="flex gap-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <div className="text-sm text-muted-foreground">Total Analyzed</div>
                <div className="text-2xl font-bold">{stats.totalAnalyzed}</div>
              </div>
              <div className="border-l pl-4">
                <div className="text-sm text-muted-foreground">Course Related</div>
                <div className="text-2xl font-bold text-green-600">
                  {stats.totalCategorized}
                </div>
              </div>
            </div>
          )}

          {/* Emails */}
          {emails.length > 0 && (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {emails.map((email) => (
                <EmailCard
                  key={email.id}
                  email={email}
                  onMarkAsRead={handleMarkAsRead}
                  onArchive={handleArchive}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && emails.length === 0 && !stats && (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">
                Click "Check Emails" to analyze unread emails for this course
              </p>
            </div>
          )}

          {/* No Results */}
          {!isLoading && emails.length === 0 && stats && stats.totalCategorized === 0 && (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">
                No course-related emails found
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Analyzed {stats.totalAnalyzed} emails, none matched this course
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
