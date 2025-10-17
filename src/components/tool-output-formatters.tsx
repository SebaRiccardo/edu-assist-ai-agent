import { Response } from '@/components/ai-elements/response';
import { Badge } from '@/components/ui/badge';
import { Mail, Calendar, User, Tag } from 'lucide-react';

interface Email {
  messageId?: string;
  sender?: string;
  subject?: string;
  messageText?: string;
  messageTimestamp?: string;
  labelIds?: string[];
}

interface GmailToolOutputProps {
  output: {
    data: {
      messages?: Email[];
    };
    resultSizeEstimate?: number;
    nextPageToken?: string;
  };
}

export function GmailToolOutput({ output }: GmailToolOutputProps) {
  const emails = output.data?.messages || [];

  if (emails.length === 0) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        No emails found matching your criteria.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {emails.map((email, index) => (
        <div
          key={email.messageId || index}
          className="rounded-lg border bg-card p-4 space-y-2 hover:bg-accent/50 transition-colors"
        >
          {/* Sender */}
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{email.sender || 'Unknown'}</span>
          </div>

          {/* Subject */}
          {email.subject && (
            <div className="flex items-start gap-2">
              <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
              <p className="font-semibold text-sm flex-1">{email.subject}</p>
            </div>
          )}

          {/* Message Preview */}
          {email.messageText && (
            <div className="pl-6">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {email.messageText}
              </p>
            </div>
          )}

          {/* Metadata */}
          <div className="flex items-center gap-3 pl-6 text-xs text-muted-foreground">
            {email.messageTimestamp && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{new Date(email.messageTimestamp).toLocaleString()}</span>
              </div>
            )}

            {email.labelIds && email.labelIds.length > 0 && (
              <div className="flex items-center gap-1 flex-wrap">
                <Tag className="h-3 w-3" />
                {email.labelIds.slice(0, 3).map(label => (
                  <Badge
                    key={label}
                    variant="secondary"
                    className="text-xs h-5"
                  >
                    {label}
                  </Badge>
                ))}
                {email.labelIds.length > 3 && (
                  <span className="text-muted-foreground">
                    +{email.labelIds.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Summary */}
      {output.resultSizeEstimate !== undefined && (
        <div className="pt-2 text-xs text-muted-foreground text-center">
          Showing {emails.length} of ~{output.resultSizeEstimate} emails
        </div>
      )}
    </div>
  );
}

interface CourseToolOutputProps {
  output: {
    courses?: Array<{
      id: string;
      name: string;
      description?: string;
      year?: string;
      studentCount?: number;
    }>;
    count?: number;
  };
}

export function CourseToolOutput({ output }: CourseToolOutputProps) {
  const courses = output.courses || [];

  if (courses.length === 0) {
    return (
      <div className="p-4 text-sm text-muted-foreground">No courses found.</div>
    );
  }

  return (
    <div className="space-y-3">
      {courses.map(course => (
        <div
          key={course.id}
          className="rounded-lg border bg-card p-4 space-y-2 hover:bg-accent/50 transition-colors"
        >
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-semibold text-sm">{course.name}</h4>
            {course.year && (
              <Badge variant="outline" className="text-xs">
                {course.year}
              </Badge>
            )}
          </div>

          {course.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {course.description}
            </p>
          )}

          {course.studentCount !== undefined && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <User className="h-3 w-3" />
              <span>{course.studentCount} students</span>
            </div>
          )}
        </div>
      ))}

      {output.count !== undefined && (
        <div className="pt-2 text-xs text-muted-foreground text-center">
          Total: {output.count} course{output.count !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}
