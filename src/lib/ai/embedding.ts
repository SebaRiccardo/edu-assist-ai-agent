import { embed, embedMany, cosineSimilarity } from 'ai';
import { google } from '@ai-sdk/google';
import { createClient } from '@/lib/supabase/server';

// Use Google's embedding model (text-embedding-004)
const embeddingModel = google.textEmbeddingModel('text-embedding-004');

/**
 * Generate chunks from input text
 * Splits by sentences and filters out empty chunks
 */
const generateChunks = (input: string): string[] => {
    return input
        .trim()
        .split(/[.!?]+/)
        .map(chunk => chunk.trim())
        .filter(chunk => chunk.length > 0);
};

/**
 * Generate embeddings for multiple chunks of text
 * Useful for embedding course content
 */
export const generateEmbeddings = async (value: string): Promise<Array<{ embedding: number[]; content: string }>> => {
    const chunks = generateChunks(value);
    const { embeddings } = await embedMany({
        model: embeddingModel,
        values: chunks,
    });
    return embeddings.map((e, i) => ({ content: chunks[i], embedding: e }));
};

/**
 * Generate a single embedding from input text
 * Useful for embedding queries
 */
export const generateEmbedding = async (value: string): Promise<number[]> => {
    const input = value.replaceAll('\\n', ' ');
    const { embedding } = await embed({
        model: embeddingModel,
        value: input,
    });
    return embedding;
};

/**
 * Find relevant courses based on email content
 * Uses cosine similarity to match email content with course embeddings
 */
export const findRelevantCourses = async (emailContent: string, professorId: string) => {
    try {
        const supabase = await createClient();

        // Generate embedding for email content
        const emailEmbedding = await generateEmbedding(emailContent);

        // Fetch all courses for the professor with embeddings
        const { data: courses, error } = await supabase
            .from('courses')
            .select('id, name, description, context, embedding')
            .eq('professor_id', professorId)
            .not('embedding', 'is', null);

        if (error) {
            console.error('Error fetching courses:', error);
            return [];
        }

        if (!courses || courses.length === 0) {
            return [];
        }

        // Calculate similarity scores
        const coursesWithScores = courses.map(course => {
            try {
                // Parse the embedding from string to number array
                const courseEmbedding = JSON.parse(course.embedding as string) as number[];
                const similarity = cosineSimilarity(emailEmbedding, courseEmbedding);

                return {
                    id: course.id,
                    name: course.name,
                    description: course.description,
                    context: course.context,
                    similarity,
                };
            } catch (err) {
                console.error(`Error calculating similarity for course ${course.id}:`, err);
                return {
                    id: course.id,
                    name: course.name,
                    description: course.description,
                    context: course.context,
                    similarity: 0,
                };
            }
        });

        // Filter by similarity threshold (0.7 = 70% similar)
        const relevantCourses = coursesWithScores
            .filter(course => course.similarity > 0.7)
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, 5); // Return top 5 matches

        return relevantCourses;
    } catch (error) {
        console.error('Error finding relevant courses:', error);
        return [];
    }
};

/**
 * Generate and store embedding for a course
 */
export const generateAndStoreCourseEmbedding = async (courseId: string, courseContent: string) => {
    try {
        const supabase = await createClient();

        // Generate embedding for course content
        const embedding = await generateEmbedding(courseContent);

        // Store embedding in database
        const { error } = await supabase
            .from('courses')
            .update({ embedding: JSON.stringify(embedding) })
            .eq('id', courseId);

        if (error) {
            console.error('Error storing course embedding:', error);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error) {
        console.error('Error generating course embedding:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
};

/**
 * Batch generate embeddings for all courses without embeddings
 */
export const batchGenerateCourseEmbeddings = async (professorId: string) => {
    try {
        const supabase = await createClient();

        // Fetch courses without embeddings
        const { data: courses, error: fetchError } = await supabase
            .from('courses')
            .select('id, name, description, context')
            .eq('professor_id', professorId)
            .is('embedding', null);

        if (fetchError) {
            return { success: false, error: fetchError.message, processed: 0 };
        }

        if (!courses || courses.length === 0) {
            return { success: true, message: 'No courses need embeddings', processed: 0 };
        }

        let processed = 0;
        let failed = 0;

        // Process each course
        for (const course of courses) {
            const courseContent = `${course.name}. ${course.description}. ${course.context}`;
            const result = await generateAndStoreCourseEmbedding(course.id, courseContent);

            if (result.success) {
                processed++;
            } else {
                failed++;
            }
        }

        return {
            success: true,
            processed,
            failed,
            total: courses.length,
            message: `Processed ${processed} courses successfully${failed > 0 ? `, ${failed} failed` : ''}`,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            processed: 0,
        };
    }
};
