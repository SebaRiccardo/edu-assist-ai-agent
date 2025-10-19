/**
 * Multi-Language Response Generation Example
 *
 * This example demonstrates how to generate email responses in different languages
 * using the enhanced response generation agent.
 */

import { generateEmailResponse, generateBatchResponses } from '@/agents/generate-responses';
import type { EmailInfo, PriorityInfo } from '@/agents/generate-responses';

// ============================================================================
// Example 1: Generate Response in Spanish
// ============================================================================

async function generateSpanishResponse() {
  const email: EmailInfo = {
    id: 'msg_001',
    from: 'juan.perez@universidad.edu',
    subject: 'Pregunta sobre la tarea 3',
    body: 'Hola Profesor, tengo una pregunta sobre el problema 2 de la tarea 3. No entiendo cómo implementar el algoritmo de búsqueda binaria. ¿Podría explicarlo?',
    category: 'student_question',
  };

  const priority: PriorityInfo = {
    priority: 'high',
    responseDeadline: '2025-10-05 5:00 PM',
    reasoning: 'Assignment due tomorrow',
  };

  const response = await generateEmailResponse({
    email,
    priority,
    courseName: 'CS 101: Introducción a la Programación',
    professorName: 'Dr. García',
    language: 'Spanish', // ✨ Generate response in Spanish
  });

  console.log('Spanish Response:', response.draftResponse);
}

// ============================================================================
// Example 2: Generate Response in French
// ============================================================================

async function generateFrenchResponse() {
  const email: EmailInfo = {
    id: 'msg_002',
    from: 'marie.dupont@universite.fr',
    subject: 'Question sur le projet final',
    body: 'Bonjour Professeur, je voudrais savoir si nous pouvons travailler en groupe pour le projet final. Merci!',
    category: 'student_question',
  };

  const priority: PriorityInfo = {
    priority: 'medium',
    responseDeadline: '2025-10-08 12:00 PM',
    reasoning: 'Project planning inquiry',
  };

  const response = await generateEmailResponse({
    email,
    priority,
    courseName: 'INFO 201: Structures de Données',
    professorName: 'Prof. Martin',
    language: 'French', // ✨ Generate response in French
  });

  console.log('French Response:', response.draftResponse);
}

// ============================================================================
// Example 3: Generate Response in German
// ============================================================================

async function generateGermanResponse() {
  const email: EmailInfo = {
    id: 'msg_003',
    from: 'hans.mueller@uni.de',
    subject: 'Frage zur Klausur',
    body: 'Guten Tag, ich wollte fragen, ob die Klausur auch Themen aus Kapitel 10 umfasst. Vielen Dank!',
    category: 'grade_inquiry',
  };

  const priority: PriorityInfo = {
    priority: 'high',
    responseDeadline: '2025-10-06 3:00 PM',
    reasoning: 'Exam preparation question',
  };

  const response = await generateEmailResponse({
    email,
    priority,
    courseName: 'Informatik 101: Algorithmen',
    professorName: 'Prof. Dr. Schmidt',
    language: 'German', // ✨ Generate response in German
  });

  console.log('German Response:', response.draftResponse);
}

// ============================================================================
// Example 4: Generate Response in Italian
// ============================================================================

async function generateItalianResponse() {
  const email: EmailInfo = {
    id: 'msg_004',
    from: 'luca.rossi@universita.it',
    subject: 'Domanda sul laboratorio',
    body: "Buongiorno Professore, ho avuto problemi con l'ambiente di sviluppo. Posso venire al ricevimento studenti?",
    category: 'technical_support',
  };

  const priority: PriorityInfo = {
    priority: 'medium',
    responseDeadline: '2025-10-07 2:00 PM',
    reasoning: 'Technical issue affecting lab work',
  };

  const response = await generateEmailResponse({
    email,
    priority,
    courseName: 'Informatica 202: Programmazione Avanzata',
    professorName: 'Prof. Bianchi',
    language: 'Italian', // ✨ Generate response in Italian
  });

  console.log('Italian Response:', response.draftResponse);
}

// ============================================================================
// Example 5: Batch Responses in Multiple Languages
// ============================================================================

async function generateMultilingualBatchResponses() {
  // Spanish emails
  const spanishEmails = [
    {
      email: {
        id: 'msg_es_001',
        from: 'estudiante1@uni.es',
        subject: 'Pregunta sobre examen',
        body: '¿Cuándo es el examen final?',
        category: 'general',
      },
      priority: {
        priority: 'medium' as const,
        responseDeadline: '2025-10-08',
        reasoning: 'General inquiry',
      },
    },
    {
      email: {
        id: 'msg_es_002',
        from: 'estudiante2@uni.es',
        subject: 'Duda sobre tarea',
        body: 'No entiendo el ejercicio 5',
        category: 'student_question',
      },
      priority: {
        priority: 'high' as const,
        responseDeadline: '2025-10-05',
        reasoning: 'Assignment question',
      },
    },
  ];

  // Generate all responses in Spanish
  const spanishResponses = await generateBatchResponses(spanishEmails, 'CS 101: Programación', {
    language: 'Spanish', // ✨ All responses in Spanish
    professorName: 'Dr. Rodríguez',
  });

  console.log(`Generated ${spanishResponses.length} Spanish responses`);

  // French emails
  const frenchEmails = [
    {
      email: {
        id: 'msg_fr_001',
        from: 'etudiant1@uni.fr',
        subject: 'Question sur le cours',
        body: 'Où puis-je trouver les slides?',
        category: 'general',
      },
      priority: {
        priority: 'low' as const,
        responseDeadline: '2025-10-10',
        reasoning: 'Resource request',
      },
    },
  ];

  // Generate all responses in French
  const frenchResponses = await generateBatchResponses(frenchEmails, "INFO 101: Introduction à l'Informatique", {
    language: 'French', // ✨ All responses in French
    professorName: 'Prof. Dubois',
  });

  console.log(`Generated ${frenchResponses.length} French responses`);
}

// ============================================================================
// Example 6: Mixed Language Handling (Process emails in their original language)
// ============================================================================

async function handleMixedLanguageEmails() {
  interface EmailWithLanguage {
    email: EmailInfo;
    priority: PriorityInfo;
    detectedLanguage: string;
  }

  const mixedEmails: EmailWithLanguage[] = [
    {
      email: {
        id: 'msg_001',
        from: 'student@uni.edu',
        subject: 'Question about homework',
        body: 'Can I submit late?',
      },
      priority: {
        priority: 'high',
        responseDeadline: '2025-10-05',
        reasoning: 'Late submission',
      },
      detectedLanguage: 'English',
    },
    {
      email: {
        id: 'msg_002',
        from: 'estudiante@uni.es',
        subject: 'Pregunta sobre tarea',
        body: '¿Puedo entregar tarde?',
      },
      priority: {
        priority: 'high',
        responseDeadline: '2025-10-05',
        reasoning: 'Entrega tardía',
      },
      detectedLanguage: 'Spanish',
    },
    {
      email: {
        id: 'msg_003',
        from: 'etudiant@uni.fr',
        subject: 'Question sur le devoir',
        body: 'Puis-je soumettre en retard?',
      },
      priority: {
        priority: 'high',
        responseDeadline: '2025-10-05',
        reasoning: 'Soumission tardive',
      },
      detectedLanguage: 'French',
    },
  ];

  console.log('Processing emails in their detected languages...\n');

  const responses = [];

  for (const { email, priority, detectedLanguage } of mixedEmails) {
    const response = await generateEmailResponse({
      email,
      priority,
      courseName: 'CS 101: Introduction to Computer Science',
      language: detectedLanguage, // ✨ Respond in the email's language
    });

    responses.push(response);
    console.log(`✅ Responded to ${email.from} in ${detectedLanguage}`);
  }

  return responses;
}

// ============================================================================
// Example 7: Supported Languages
// ============================================================================

const SUPPORTED_LANGUAGES = [
  'English',
  'Spanish',
  'French',
  'German',
  'Italian',
  'Portuguese',
  'Chinese',
  'Japanese',
  'Korean',
  'Russian',
  'Arabic',
  'Hindi',
  'Dutch',
  'Polish',
  'Turkish',
  'Vietnamese',
  // Add more as needed - Gemini supports 100+ languages
];

async function generateResponseInAnyLanguage(languageCode: string) {
  const email: EmailInfo = {
    id: 'msg_custom',
    from: 'student@university.edu',
    subject: 'Question about the course',
    body: 'I have a question about the final exam schedule.',
  };

  const priority: PriorityInfo = {
    priority: 'medium',
    responseDeadline: '2025-10-10',
    reasoning: 'General inquiry',
  };

  const response = await generateEmailResponse({
    email,
    priority,
    courseName: 'CS 101: Introduction to Computer Science',
    language: languageCode, // ✨ Any language supported by Gemini
  });

  return response;
}

// ============================================================================
// Usage Examples
// ============================================================================

export async function runExamples() {
  console.log('=== Multi-Language Response Generation Examples ===\n');

  // Example 1: Spanish
  await generateSpanishResponse();

  // Example 2: French
  await generateFrenchResponse();

  // Example 3: German
  await generateGermanResponse();

  // Example 4: Italian
  await generateItalianResponse();

  // Example 5: Batch in multiple languages
  await generateMultilingualBatchResponses();

  // Example 6: Mixed language handling
  await handleMixedLanguageEmails();

  // Example 7: Custom language
  const portugueseResponse = await generateResponseInAnyLanguage('Portuguese');
  console.log('Portuguese Response:', portugueseResponse.draftResponse);
}

// Export for use in other files
export {
  generateSpanishResponse,
  generateFrenchResponse,
  generateGermanResponse,
  generateItalianResponse,
  generateMultilingualBatchResponses,
  handleMixedLanguageEmails,
  generateResponseInAnyLanguage,
  SUPPORTED_LANGUAGES,
};
