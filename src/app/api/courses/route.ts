import { NextRequest, NextResponse } from 'next/server';
import { courseStore } from '@/lib/course-store';
import { getCurrentUser } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// GET - Get all courses for a professor
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const courses = courseStore.getCourses(user.id);
    return NextResponse.json({ courses });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}

// POST - Create a new course
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, professorId, studentCount = 0 } = body;

    if (!title || !description || !professorId) {
      return NextResponse.json(
        { error: 'Title, description, and professorId are required' },
        { status: 400 }
      );
    }

    const course = courseStore.createCourse({
      name: title,
      title,
      description,
      professorId,
      studentCount,
      unreadEmailCount: 0,
    });

    return NextResponse.json({ course }, { status: 201 });
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 }
    );
  }
}

// PUT - Update a course
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { courseId, title, description, studentCount } = body;

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      );
    }

    const updates: any = {};
    if (title) {
      updates.title = title;
      updates.name = title;
    }
    if (description) updates.description = description;
    if (studentCount !== undefined) updates.studentCount = studentCount;

    const course = courseStore.updateCourse(courseId, updates);

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    return NextResponse.json({ course });
  } catch (error) {
    console.error('Error updating course:', error);
    return NextResponse.json(
      { error: 'Failed to update course' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a course
export async function DELETE(req: NextRequest) {
  try {
    const courseId = req.nextUrl.searchParams.get('courseId');

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      );
    }

    const success = courseStore.deleteCourse(courseId);

    if (!success) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting course:', error);
    return NextResponse.json(
      { error: 'Failed to delete course' },
      { status: 500 }
    );
  }
}
