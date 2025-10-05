import { Course } from '@/types';
import { Users, Mail, Clock } from 'lucide-react';

interface CourseInfoCardsProps {
  course: Course;
}

export function CourseInfoCards({ course }: CourseInfoCardsProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Students Card */}
      <div className="flex items-center gap-3 p-4 bg-background/80 backdrop-blur rounded-xl border-none shadow-none">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
          <Users className="h-5 w-5 text-primary" />
        </div>
        <div>
          <div className="text-lg font-bold text-foreground">
            {course.studentCount}
          </div>
          <div className="text-xs text-muted-foreground">Students</div>
        </div>
      </div>

      {/* Unread Emails Card */}
      <div className="flex items-center gap-3 p-4 bg-background/80 backdrop-blur rounded-xl border-none shadow-none">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-chart-1/10">
          <Mail className="h-5 w-5 text-chart-1" />
        </div>
        <div>
          <div className="text-lg font-bold text-foreground">
            {course.unreadEmailCount}
          </div>
          <div className="text-xs text-muted-foreground">Unread</div>
        </div>
      </div>

      {/* Last Updated Card */}
      <div className="flex items-center gap-3 p-4 bg-background/80 backdrop-blur rounded-xl border-none shadow-none">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-chart-2/10">
          <Clock className="h-5 w-5 text-chart-2" />
        </div>
        <div>
          <div className="text-sm font-semibold text-foreground">
            {new Date(course.updatedAt).toLocaleDateString()}
          </div>
          <div className="text-xs text-muted-foreground">Last Analyzed</div>
        </div>
      </div>
    </div>
  );
}
