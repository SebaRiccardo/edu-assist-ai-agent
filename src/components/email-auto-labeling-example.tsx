/**
 * Email Auto-Labeling Component Example
 * 
 * This example demonstrates how to integrate the email labeling system
 * into a dashboard or inbox management interface.
 */

'use client';

import { useState } from 'react';
import { analyzeInbox, labelEmails } from '@/actions';
import type { Course } from '@/lib/supabase/types/courses.types';
import type { InboxAnalysisResult } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Check, X, Tag, Loader2 } from 'lucide-react';

interface EmailAutoLabelingProps {
    course: Course;
    connectedAccountId: string;
}

export function EmailAutoLabeling({ course, connectedAccountId }: EmailAutoLabelingProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [currentStep, setCurrentStep] = useState<'idle' | 'analyzing' | 'labeling' | 'complete'>('idle');
    const [analysisResult, setAnalysisResult] = useState<InboxAnalysisResult | null>(null);
    const [labelingProgress, setLabelingProgress] = useState({
        total: 0,
        processed: 0,
        successful: 0,
        failed: 0,
        summary: ''
    });

    const handleAutoLabel = async () => {
        setIsProcessing(true);
        setCurrentStep('analyzing');

        try {
            // Step 1: Analyze inbox
            const analysis = await analyzeInbox({
                course,
                connectedAccountId,
                maxEmails: 50,
                includeRead: false,
                reasoningLanguage: 'Spanish',
                withPriorityClassification: true,
                verbose: true
            });

            if (!analysis.success) {
                throw new Error(analysis.error || 'Failed to analyze inbox');
            }

            setAnalysisResult(analysis.data!);
            setCurrentStep('labeling');

            // Step 2: Apply labels
            const labeling = await labelEmails({
                connectedAccountId,
                emails: analysis.data!.emails as any, // Cast to CategorizedEmailWithPriority
                courseName: analysis.data!.courseName,
                createLabelsIfMissing: true,
                reasoningLanguage: 'Spanish',
                verbose: true
            });

            if (!labeling.success) {
                throw new Error(labeling.error || 'Failed to label emails');
            }

            // Update progress
            setLabelingProgress({
                total: labeling.data!.totalProcessed,
                processed: labeling.data!.totalProcessed,
                successful: labeling.data!.successCount,
                failed: labeling.data!.failureCount,
                summary: labeling.data!.summary
            });

            setCurrentStep('complete');
        } catch (error) {
            console.error('Error in auto-labeling:', error);
            setCurrentStep('idle');
        } finally {
            setIsProcessing(false);
        }
    };

    const progressPercentage = labelingProgress.total > 0
        ? (labelingProgress.processed / labelingProgress.total) * 100
        : 0;

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Tag className="h-5 w-5" />
                            Auto-Label Emails
                        </CardTitle>
                        <CardDescription>
                            Automatically categorize and label course-related emails
                        </CardDescription>
                    </div>
                    <Button
                        onClick={handleAutoLabel}
                        disabled={isProcessing}
                        size="lg"
                    >
                        {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {currentStep === 'idle' && 'Start Auto-Labeling'}
                        {currentStep === 'analyzing' && 'Analyzing...'}
                        {currentStep === 'labeling' && 'Applying Labels...'}
                        {currentStep === 'complete' && 'Complete!'}
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Course Info */}
                <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium">Course: {course.name}</p>
                    <p className="text-xs text-muted-foreground">{course.description}</p>
                </div>

                {/* Progress Steps */}
                <div className="space-y-4">
                    {/* Step 1: Analysis */}
                    <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${currentStep === 'analyzing' ? 'bg-blue-500 animate-pulse' :
                                ['labeling', 'complete'].includes(currentStep) ? 'bg-green-500' :
                                    'bg-gray-200'
                            }`}>
                            {['labeling', 'complete'].includes(currentStep) ? (
                                <Check className="h-5 w-5 text-white" />
                            ) : (
                                <span className="text-white text-sm">1</span>
                            )}
                        </div>
                        <div className="flex-1">
                            <p className="font-medium">Analyze Inbox</p>
                            <p className="text-xs text-muted-foreground">
                                {analysisResult
                                    ? `Found ${analysisResult.totalAnalyzed} course-related emails`
                                    : 'Scanning and categorizing emails...'}
                            </p>
                        </div>
                    </div>

                    {/* Step 2: Labeling */}
                    <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${currentStep === 'labeling' ? 'bg-blue-500 animate-pulse' :
                                currentStep === 'complete' ? 'bg-green-500' :
                                    'bg-gray-200'
                            }`}>
                            {currentStep === 'complete' ? (
                                <Check className="h-5 w-5 text-white" />
                            ) : (
                                <span className="text-white text-sm">2</span>
                            )}
                        </div>
                        <div className="flex-1">
                            <p className="font-medium">Apply Labels</p>
                            <p className="text-xs text-muted-foreground">
                                {currentStep === 'complete'
                                    ? `Applied labels to ${labelingProgress.successful} emails`
                                    : currentStep === 'labeling'
                                        ? 'Creating and applying Gmail labels...'
                                        : 'Waiting for analysis...'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                {['labeling', 'complete'].includes(currentStep) && (
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{Math.round(progressPercentage)}%</span>
                        </div>
                        <Progress value={progressPercentage} />
                    </div>
                )}

                {/* Results Summary */}
                {currentStep === 'complete' && (
                    <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-green-900">Labeling Complete!</h4>
                            <div className="flex gap-2">
                                <Badge variant="default" className="bg-green-600">
                                    <Check className="mr-1 h-3 w-3" />
                                    {labelingProgress.successful} Success
                                </Badge>
                                {labelingProgress.failed > 0 && (
                                    <Badge variant="destructive">
                                        <X className="mr-1 h-3 w-3" />
                                        {labelingProgress.failed} Failed
                                    </Badge>
                                )}
                            </div>
                        </div>

                        {/* AI Summary */}
                        <div className="text-sm text-green-800 bg-white p-3 rounded border border-green-300">
                            {labelingProgress.summary}
                        </div>

                        {/* Analysis Stats */}
                        {analysisResult && (
                            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-green-300">
                                <div>
                                    <p className="text-xs text-green-700">Total Analyzed</p>
                                    <p className="text-2xl font-bold text-green-900">
                                        {analysisResult.totalAnalyzed}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-green-700">Successfully Labeled</p>
                                    <p className="text-2xl font-bold text-green-900">
                                        {labelingProgress.successful}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Priority Breakdown (if available) */}
                        {analysisResult && 'priorityAnalysis' in analysisResult && (
                            <div className="pt-3 border-t border-green-300">
                                <p className="text-xs font-semibold text-green-700 mb-2">Priority Distribution</p>
                                <div className="grid grid-cols-4 gap-2">
                                    <Badge variant="outline" className="justify-center border-red-300 text-red-700">
                                        Critical: {(analysisResult as any).priorityAnalysis?.critical || 0}
                                    </Badge>
                                    <Badge variant="outline" className="justify-center border-orange-300 text-orange-700">
                                        High: {(analysisResult as any).priorityAnalysis?.high || 0}
                                    </Badge>
                                    <Badge variant="outline" className="justify-center border-yellow-300 text-yellow-700">
                                        Medium: {(analysisResult as any).priorityAnalysis?.medium || 0}
                                    </Badge>
                                    <Badge variant="outline" className="justify-center border-blue-300 text-blue-700">
                                        Low: {(analysisResult as any).priorityAnalysis?.low || 0}
                                    </Badge>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Error State */}
                {currentStep === 'idle' && isProcessing === false && labelingProgress.failed > 0 && (
                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                        <h4 className="font-semibold text-red-900 mb-2">Some emails failed to label</h4>
                        <p className="text-sm text-red-700">
                            {labelingProgress.failed} emails could not be labeled. Please try again or check your Gmail connection.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
