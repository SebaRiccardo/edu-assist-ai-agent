'use client';

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface DeleteConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: string | undefined;
  isDeleting: boolean;
  onConfirm: () => void;
}

export const DeleteConfirmationDialog = ({ open, onOpenChange, email, isDeleting, onConfirm }: DeleteConfirmationDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Email Connection?</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the connection to <span className="font-semibold">{email}</span>? This action cannot be undone and will
            remove access to this account.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete Connection'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
