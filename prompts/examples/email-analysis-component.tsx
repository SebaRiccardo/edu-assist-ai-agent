/**
 * Frontend Example - Using the Refactored Email Agent
 *
 * This shows how to call the email agent from a React component
 */

'use client';

import { useState } from 'react';

interface EmailAnalysisResult {
  success: boolean;
  data?: {
    emails: Array<{
      id: string;
      from: string;
      subject: string;
      category: string;
      isRelated: boolean;
      confidence: number;
      suggestedLabel: string;
      reasoning: string;
      receivedAt: string;
    }>;
    analysis: {
      summary: string;
      stats: {
        totalAnalyzed: number;
        courseRelated: number;
        avgConfidence: number;
        categoryBreakdown: Record<string, number>;
      };
    };
    totalAnalyzed: number;
    courseName: string;
    courseId: string;
  };
  error?: string;
  authRequired?: boolean;
}

export function EmailAnalysisComponent() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EmailAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function analyzeEmails(courseId: string) {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/get-emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'user-connection-id', // Get from user session
          courseId: courseId,
          maxEmails: 20,
          includeRead: false,
        }),
      });

      const data: EmailAnalysisResult = await response.json();

      if (!response.ok) {
        if (data.authRequired) {
          // Redirect to Gmail auth
          window.location.href = '/api/gmail-auth?userId=user-connection-id';
          return;
        }
        throw new Error(data.error || 'Failed to analyze emails');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Action Button */}
      <button
        onClick={() => analyzeEmails('1')}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Analyzing Emails...' : 'Analyze Course Emails'}
      </button>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded">
          <p className="text-red-800">❌ {error}</p>
        </div>
      )}

      {/* Results Display */}
      {result?.success && result.data && (
        <div className="space-y-6">
          {/* Statistics */}
          <div className="p-6 bg-white border rounded-lg shadow">
            <h3 className="text-xl font-bold mb-4">📊 Analysis Results</h3>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-4 bg-blue-50 rounded">
                <div className="text-3xl font-bold text-blue-600">
                  {result.data.analysis.stats.totalAnalyzed}
                </div>
                <div className="text-sm text-gray-600">Total Emails</div>
              </div>

              <div className="text-center p-4 bg-green-50 rounded">
                <div className="text-3xl font-bold text-green-600">
                  {result.data.analysis.stats.courseRelated}
                </div>
                <div className="text-sm text-gray-600">Course Related</div>
              </div>

              <div className="text-center p-4 bg-purple-50 rounded">
                <div className="text-3xl font-bold text-purple-600">
                  {result.data.analysis.stats.avgConfidence}%
                </div>
                <div className="text-sm text-gray-600">Avg Confidence</div>
              </div>
            </div>

            {/* Summary */}
            <div className="p-4 bg-gray-50 rounded">
              <p className="text-sm text-gray-700">
                <strong>AI Summary:</strong> {result.data.analysis.summary}
              </p>
            </div>

            {/* Category Breakdown */}
            <div className="mt-4">
              <h4 className="font-semibold mb-2">Category Breakdown:</h4>
              <div className="space-y-2">
                {Object.entries(
                  result.data.analysis.stats.categoryBreakdown
                ).map(([category, count]) => {
                  const percentage = (
                    (count / result.data!.analysis.stats.totalAnalyzed) *
                    100
                  ).toFixed(1);
                  return (
                    <div key={category} className="flex items-center gap-2">
                      <div className="w-32 text-sm">{category}</div>
                      <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                        <div
                          className="bg-blue-600 h-full flex items-center justify-end pr-2 text-white text-xs"
                          style={{ width: `${percentage}%` }}
                        >
                          {count}
                        </div>
                      </div>
                      <div className="w-16 text-sm text-right">
                        {percentage}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Email List */}
          <div className="space-y-3">
            <h3 className="text-xl font-bold">📧 Categorized Emails</h3>

            {result.data.emails.map((email, index) => (
              <div
                key={email.id}
                className={`p-4 border rounded-lg ${
                  email.isRelated
                    ? 'bg-green-50 border-green-200'
                    : 'bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg">{email.subject}</h4>
                    <p className="text-sm text-gray-600">From: {email.from}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {email.isRelated && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                        ✅ Related
                      </span>
                    )}
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      {email.category}
                    </span>
                  </div>
                </div>

                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Confidence:</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden max-w-xs">
                      <div
                        className="bg-purple-600 h-full"
                        style={{ width: `${email.confidence}%` }}
                      />
                    </div>
                    <span>{email.confidence}%</span>
                  </div>

                  <div>
                    <span className="font-medium">Label:</span>{' '}
                    <span className="px-2 py-0.5 bg-gray-200 rounded text-xs">
                      {email.suggestedLabel}
                    </span>
                  </div>

                  <div>
                    <span className="font-medium">Reasoning:</span>{' '}
                    <span className="text-gray-700">{email.reasoning}</span>
                  </div>

                  <div className="text-gray-500">
                    {new Date(email.receivedAt).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Example usage in a page
export default function CourseEmailsPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Course Email Analysis</h1>
      <EmailAnalysisComponent />
    </div>
  );
}
