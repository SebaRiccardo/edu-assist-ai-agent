'use client';

import { useState, useEffect } from 'react';
import { Course } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface CourseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course?: Course | null;
  onSubmit: (data: { title: string; description: string; studentCount: number }) => void;
  isLoading?: boolean;
}

export function CourseFormDialog({
  open,
  onOpenChange,
  course,
  onSubmit,
  isLoading = false,
}: CourseFormDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [studentCount, setStudentCount] = useState(0);

  useEffect(() => {
    if (course) {
      setTitle(course.title);
      setDescription(course.description);
      setStudentCount(course.studentCount);
    } else {
      setTitle('');
      setDescription('');
      setStudentCount(0);
    }
  }, [course, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ title, description, studentCount });
  };

  const isEdit = !!course;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Edit Course' : 'Create New Course'}</DialogTitle>
            <DialogDescription>
              {isEdit
                ? 'Update the course information below.'
                : 'Fill in the details to create a new course.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">
                Course Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                placeholder="e.g., Introduction to Calculus"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">
                Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Provide a detailed description of the course, including topics covered, prerequisites, and learning objectives..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={8}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                This description will help the AI categorize emails related to this course.
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="studentCount">Number of Students</Label>
              <Input
                id="studentCount"
                type="number"
                min="0"
                placeholder="0"
                value={studentCount}
                onChange={(e) => setStudentCount(parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !title || !description}>
              {isLoading ? 'Saving...' : isEdit ? 'Update Course' : 'Create Course'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
