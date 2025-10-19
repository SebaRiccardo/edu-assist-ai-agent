'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Mail, Check, Trash2 } from 'lucide-react';

interface ConnectedInbox {
  id: string;
  email: string;
  unreadCount?: number;
}

interface ConnectedInboxesCardProps {
  inboxes: ConnectedInbox[];
  onDisconnect: (inboxId: string) => void;
}

export function ConnectedInboxesCard({ inboxes, onDisconnect }: ConnectedInboxesCardProps) {
  if (!inboxes || inboxes.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-green-100 p-2 dark:bg-green-900/50">
            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <CardTitle className="text-lg">Connected Inboxes</CardTitle>
            <CardDescription>
              {inboxes.length} email account{inboxes.length !== 1 ? 's' : ''} connected to this course
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {inboxes.map(inbox => (
            <div key={inbox.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
              <div className="flex items-center gap-3">
                <Check className="h-4 w-4 text-green-600" />
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{inbox.email}</span>
              </div>
              <div className="flex items-center gap-2">
                {inbox.unreadCount !== undefined && <span className="text-sm text-muted-foreground">{inbox.unreadCount} unread</span>}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDisconnect(inbox.id)}
                  className="px-3 hover:bg-destructive hover:text-destructive-foreground"
                  title="Disconnect"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
