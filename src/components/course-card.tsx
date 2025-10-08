'use client';

import { useRouter } from 'next/navigation';
import { DomainCourse } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  BookOpen,
  Mail,
  Users,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
} from 'lucide-react';
import { Course } from '@/lib/supabase/types/courses.types';

interface CourseCardProps {
  course: Course;
  onEdit: (course: Course) => void;
  onDelete: (courseId: string) => void;
}

export function CourseCard({ course, onEdit, onDelete }: CourseCardProps) {
  const router = useRouter();

  const handleViewDetails = () => {
    router.push(`/dashboard/courses/${course.id}`);
  };

  return (
    <Card
      className="bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-none shadow-none hover:bg-background/70 transition-all cursor-pointer group relative"
      onClick={handleViewDetails}
    >
      {/* Unread Badge - Top Right */}
      {/* {course.unreadEmailCount > 0 && (
        <div className="absolute -top-2 -right-2 z-10">
          <Badge
            variant="destructive"
            className="h-8 p-3 flex items-center gap-1.5 shadow-lg rounded-full"
          >
            <span className="font-bold">{course.unreadEmailCount}</span>
          </Badge>
        </div>
      )} */}

      <CardHeader>
        {/* Icon with Course Icon */}
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
          <BookOpen className="h-6 w-6 text-primary" />
        </div>
        <div className="flex items-start justify-between">
          <div className="flex-1 pr-8">
            <CardTitle className="text-xl font-bold mb-2">
              {course.title}
            </CardTitle>
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {course.description}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg hover:bg-background/50"
              >
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">More actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/90"
            >
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={e => {
                  e.stopPropagation();
                  handleViewDetails();
                }}
              >
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={e => {
                  e.stopPropagation();
                  onEdit(course);
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Course
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={e => {
                  e.stopPropagation();
                  onDelete(course.id);
                }}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Course
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="flex items-center gap-6 pt-4 border-t border-border/50">
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold">{course.student_count}</span>
            <span className="text-muted-foreground">students</span>
          </div>
        </div>

        <div className="text-xs text-muted-foreground pt-2">
          Updated {new Date(course.updated_at).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  );
}
