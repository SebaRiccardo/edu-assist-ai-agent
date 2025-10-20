'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { EmailAutoLabeling } from '@/components/email-auto-labeling-example';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useCourse } from '@/hooks/use-courses';
import { useConnections } from '@/hooks/use-connections';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import type { Course } from '@/lib/supabase/types/courses.types';

export default function AutoLabelPage() {
    const router = useRouter();
    const params = useParams();
    const t = useTranslations('CourseDetails');

    const courseId = params.id as string;
    const { user } = useCurrentUser();

    const [selectedAccountId, setSelectedAccountId] = React.useState<string>('');

    // Data fetching hooks
    const { data: courseData, isLoading: isLoadingCourse, isError: isErrorCourse } = useCourse(courseId);
    const { data: connections, isLoading: isLoadingConnections } = useConnections();

    // Set initial selected account when connections load
    React.useEffect(() => {
        if (!selectedAccountId && connections && connections.length > 0) {
            const activeConnection = connections.find(conn => conn.status === 'ACTIVE' && conn.email);
            if (activeConnection) {
                setSelectedAccountId(activeConnection.id);
            }
        }
    }, [connections, selectedAccountId]);

    // Redirect if course not found
    if (isErrorCourse) {
        router.push('/dashboard/courses');
        return null;
    }

    if (isLoadingCourse || isLoadingConnections || !courseData) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const activeConnections = connections?.filter(conn => conn.status === 'ACTIVE' && conn.email) || [];
    const hasNoConnections = activeConnections.length === 0;

    return (
        <div className="flex flex-1 flex-col my-5">
            {/* Header */}
            <div className="mx-auto max-w-7xl w-full px-6 mb-6">
                <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 rounded-3xl p-8 border-none shadow-none">
                    <div className="space-y-4">
                        {/* Back Button and Title */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => router.push(`/dashboard/courses/${courseId}`)}
                                >
                                    <ArrowLeft className="h-5 w-5" />
                                </Button>
                                <div>
                                    <h1 className="text-2xl font-bold">Auto-Label Emails</h1>
                                    <p className="text-sm text-muted-foreground">
                                        Automatically categorize and label course-related emails
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Course Info */}
                        <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                            <div>
                                <p className="font-semibold text-lg">{courseData.name}</p>
                                <p className="text-sm text-muted-foreground">{courseData.description}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 mx-auto max-w-7xl w-full px-6 pb-8">
                <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 rounded-3xl p-8 border-none shadow-none space-y-6">

                    {/* No Connections State */}
                    {hasNoConnections ? (
                        <Card className="border-dashed">
                            <CardHeader>
                                <CardTitle>No Email Accounts Connected</CardTitle>
                                <CardDescription>
                                    You need to connect a Gmail account before you can use auto-labeling.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button onClick={() => router.push(`/dashboard/courses/${courseId}`)}>
                                    Go to Course Settings
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <>
                            {/* Account Selector */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Select Email Account</CardTitle>
                                    <CardDescription>
                                        Choose the connected email account you want to analyze and label
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <Label htmlFor="account-select">Connected Account</Label>
                                        <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                                            <SelectTrigger id="account-select" className="w-full">
                                                <SelectValue placeholder="Select an account..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {activeConnections.map(account => (
                                                    <SelectItem key={account.id} value={account.id}>
                                                        <div className="flex items-center gap-2">
                                                            <span>{account.email || account.id}</span>
                                                            {account.status === 'ACTIVE' && (
                                                                <Badge variant="default" className="ml-2">Active</Badge>
                                                            )}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Auto-Labeling Component */}
                            {selectedAccountId && (
                                <EmailAutoLabeling
                                    course={courseData as Course}
                                    connectedAccountId={selectedAccountId}
                                />
                            )}

                            {/* Info Card */}
                            <Card className="border-blue-200 bg-blue-50/50">
                                <CardHeader>
                                    <CardTitle className="text-blue-900">How It Works</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm text-blue-800">
                                    <div className="flex gap-2">
                                        <span className="font-semibold">1.</span>
                                        <p>
                                            <strong>Analysis:</strong> The system scans your inbox and identifies emails
                                            related to this course using AI.
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="font-semibold">2.</span>
                                        <p>
                                            <strong>Categorization:</strong> Each email is categorized (e.g., student questions,
                                            assignments, administrative) and assigned a priority level.
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="font-semibold">3.</span>
                                        <p>
                                            <strong>Labeling:</strong> Gmail labels are automatically created and applied
                                            to organize your emails efficiently.
                                        </p>
                                    </div>
                                    <div className="flex gap-2 mt-4 p-3 bg-blue-100 rounded-lg">
                                        <p className="text-xs">
                                            <strong>Note:</strong> Labels will be created in your Gmail account if they
                                            don't exist. You can manage them directly in Gmail afterward.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
