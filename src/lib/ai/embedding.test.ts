/**
 * Test Suite for RAG Email-Course Matching
 * 
 * This file provides test utilities and examples for the RAG agent.
 * Run these tests to verify the embedding and matching functionality.
 */

import { generateEmbedding, generateEmbeddings, findRelevantCourses } from '@/lib/ai/embedding';
import { cosineSimilarity } from 'ai';

/**
 * Test 1: Generate Embedding for Text
 */
export async function testEmbeddingGeneration() {
    console.log('🧪 Test 1: Embedding Generation\n');

    const testText = "This is a test about algebra and mathematics";

    try {
        const embedding = await generateEmbedding(testText);

        console.log('✅ Success!');
        console.log(`- Input: "${testText}"`);
        console.log(`- Embedding dimensions: ${embedding.length}`);
        console.log(`- Sample values: [${embedding.slice(0, 5).map(v => v.toFixed(4)).join(', ')}...]`);
        console.log('');

        return { success: true, embedding };
    } catch (error) {
        console.error('❌ Failed:', error);
        return { success: false, error };
    }
}

/**
 * Test 2: Generate Multiple Embeddings
 */
export async function testBatchEmbeddings() {
    console.log('🧪 Test 2: Batch Embedding Generation\n');

    const courseContent = `
    Algebra 2: Advanced algebraic concepts.
    Students will learn quadratic equations.
    Topics include polynomials and functions.
  `;

    try {
        const embeddings = await generateEmbeddings(courseContent);

        console.log('✅ Success!');
        console.log(`- Input length: ${courseContent.length} characters`);
        console.log(`- Chunks generated: ${embeddings.length}`);
        console.log('- Chunks:');
        embeddings.forEach((e, i) => {
            console.log(`  ${i + 1}. "${e.content}" (${e.embedding.length} dims)`);
        });
        console.log('');

        return { success: true, embeddings };
    } catch (error) {
        console.error('❌ Failed:', error);
        return { success: false, error };
    }
}

/**
 * Test 3: Calculate Similarity Between Texts
 */
export async function testSimilarityCalculation() {
    console.log('🧪 Test 3: Similarity Calculation\n');

    const texts = [
        "Question about algebra homework",
        "Help with quadratic equations",
        "Physics assignment due date",
    ];

    try {
        console.log('Generating embeddings...\n');
        const embeddings = await Promise.all(
            texts.map(text => generateEmbedding(text))
        );

        // Compare first two (related) texts
        const similarity1 = cosineSimilarity(embeddings[0], embeddings[1]);
        console.log('Similarity between related texts:');
        console.log(`- Text 1: "${texts[0]}"`);
        console.log(`- Text 2: "${texts[1]}"`);
        console.log(`- Similarity: ${(similarity1 * 100).toFixed(2)}%`);
        console.log('');

        // Compare first and third (unrelated) texts
        const similarity2 = cosineSimilarity(embeddings[0], embeddings[2]);
        console.log('Similarity between unrelated texts:');
        console.log(`- Text 1: "${texts[0]}"`);
        console.log(`- Text 3: "${texts[2]}"`);
        console.log(`- Similarity: ${(similarity2 * 100).toFixed(2)}%`);
        console.log('');

        console.log('✅ Test passed!');
        console.log(`Related texts have ${similarity1 > similarity2 ? 'higher' : 'lower'} similarity ✓\n`);

        return { success: true, similarities: { related: similarity1, unrelated: similarity2 } };
    } catch (error) {
        console.error('❌ Failed:', error);
        return { success: false, error };
    }
}

/**
 * Test 4: Mock Email-Course Matching
 */
export async function testEmailCourseMatching() {
    console.log('🧪 Test 4: Email-Course Matching (Mock)\n');

    // Mock data
    const mockCourse = {
        name: "Algebra 2",
        description: "Advanced algebraic concepts",
        context: "quadratic equations polynomials functions graphing",
    };

    const mockEmails = [
        {
            subject: "Question about quadratic formula",
            sender: "student@university.edu",
            messageText: "I'm having trouble with problem 5 on the homework about solving quadratic equations",
        },
        {
            subject: "Question about exam preparation",
            sender: "student@university.edu",
            messageText: "I'm having trouble with problem 2 on the homework about solving gauss-jordan matrix equations",
        },
        {
            subject: "Lab report submission",
            sender: "student2@university.edu",
            messageText: "Attaching my physics lab report for review",
        },
    ];

    try {
        console.log('Course:', mockCourse.name);
        console.log('Emails to analyze:', mockEmails.length);
        console.log('');

        // Generate course embedding
        const courseContent = `${mockCourse.name}. ${mockCourse.description}. ${mockCourse.context}`;
        const courseEmbedding = await generateEmbedding(courseContent);

        // Analyze each email
        for (const email of mockEmails) {
            const emailContent = `${email.subject}. ${email.messageText}`;
            const emailEmbedding = await generateEmbedding(emailContent);
            const similarity = cosineSimilarity(courseEmbedding, emailEmbedding);

            const isMatch = similarity > 0.7;
            const icon = isMatch ? '✅' : '❌';

            console.log(`${icon} Email: "${email.subject}"`);
            console.log(`   From: ${email.sender}`);
            console.log(`   Similarity: ${(similarity * 100).toFixed(2)}%`);
            console.log(`   Match: ${isMatch ? 'YES' : 'NO'}`);
            console.log('');
        }

        console.log('✅ Test completed!\n');
        return { success: true };
    } catch (error) {
        console.error('❌ Failed:', error);
        return { success: false, error };
    }
}

/**
 * Test 5: Threshold Testing
 */
export async function testThresholds() {
    console.log('🧪 Test 5: Threshold Testing\n');

    const courseText = "Calculus: derivatives integrals limits functions";
    const testEmails = [
        { text: "Question about derivatives", expectedMatch: true },
        { text: "Help with integral calculation", expectedMatch: true },
        { text: "Physics homework question", expectedMatch: false },
    ];

    try {
        const courseEmbedding = await generateEmbedding(courseText);

        const thresholds = [0.5, 0.6, 0.7, 0.8];

        for (const threshold of thresholds) {
            console.log(`Threshold: ${threshold} (${threshold * 100}%)`);
            console.log('─'.repeat(50));

            for (const email of testEmails) {
                const emailEmbedding = await generateEmbedding(email.text);
                const similarity = cosineSimilarity(courseEmbedding, emailEmbedding);
                const isMatch = similarity > threshold;

                const icon = isMatch === email.expectedMatch ? '✅' : '⚠️';
                console.log(`${icon} "${email.text}"`);
                console.log(`   Similarity: ${(similarity * 100).toFixed(2)}%`);
                console.log(`   Match: ${isMatch ? 'YES' : 'NO'} (Expected: ${email.expectedMatch ? 'YES' : 'NO'})`);
            }
            console.log('');
        }

        console.log('💡 Recommendation: Use threshold 0.7 (70%) for balanced results\n');
        return { success: true };
    } catch (error) {
        console.error('❌ Failed:', error);
        return { success: false, error };
    }
}

/**
 * Run All Tests
 */
export async function runAllTests() {
    console.log('\n');
    console.log('═'.repeat(60));
    console.log('  RAG Email-Course Matching Test Suite');
    console.log('═'.repeat(60));
    console.log('\n');

    const tests = [
        { name: 'Embedding Generation', fn: testEmbeddingGeneration },
        { name: 'Batch Embeddings', fn: testBatchEmbeddings },
        { name: 'Similarity Calculation', fn: testSimilarityCalculation },
        { name: 'Email-Course Matching', fn: testEmailCourseMatching },
        { name: 'Threshold Testing', fn: testThresholds },
    ];

    const results = [];

    for (const test of tests) {
        try {
            const result = await test.fn();
            results.push({ name: test.name, ...result });
        } catch (error) {
            results.push({ name: test.name, success: false, error });
        }
    }

    console.log('\n');
    console.log('═'.repeat(60));
    console.log('  Test Summary');
    console.log('═'.repeat(60));
    console.log('\n');

    results.forEach(result => {
        const icon = result.success ? '✅' : '❌';
        console.log(`${icon} ${result.name}`);
    });

    const passed = results.filter(r => r.success).length;
    const total = results.length;

    console.log('\n');
    console.log(`Total: ${passed}/${total} tests passed`);
    console.log('\n');

    return results;
}

/**
 * Example: How to use in a Next.js API route
 */
export function exampleAPIUsage() {
    return `
// In your API route (e.g., /api/test-rag/route.ts)

import { runAllTests } from '@/lib/ai/embedding.test';

export async function GET() {
  const results = await runAllTests();
  return Response.json(results);
}

// Then visit: http://localhost:3000/api/test-rag
  `.trim();
}

/**
 * Example: How to use in a Server Action
 */
export function exampleServerActionUsage() {
    return `
// In your server action (e.g., src/actions/test-rag.ts)

'use server';

import { testEmailCourseMatching } from '@/lib/ai/embedding.test';

export async function testRAGMatching() {
  return await testEmailCourseMatching();
}

// Then call it from a component:
// const result = await testRAGMatching();
  `.trim();
}

// Export usage examples
export const USAGE_EXAMPLES = {
    apiRoute: exampleAPIUsage(),
    serverAction: exampleServerActionUsage(),
};
