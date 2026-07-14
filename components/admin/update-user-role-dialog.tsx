'use client';
import { useState, useTransition } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { USER_ROLES } from '@/lib/constants';
import { updateUserRole } from '@/lib/actions/user.actions';

const UpdateUserRoleDialog = ({
  userId,
  currentRole,
}: {
  userId: string;
  currentRole: string;
}) => {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState(currentRole);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleSaveClick = () => {
    startTransition(async () => {
      const res = await updateUserRole(userId, role);

      if (!res.success) {
        toast({
          variant: 'destructive',
          description: res.message,
        });
      } else {
        setOpen(false);
        toast({
          description: res.message,
        });
      }
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setRole(currentRole);
        setOpen(value);
      }}
    >
      <DialogTrigger asChild>
        <Button size='sm' variant='outline'>
          Change Role
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change user role</DialogTitle>
          <DialogDescription>
            Select the new role for this user.
          </DialogDescription>
        </DialogHeader>
        <RadioGroup value={role} onValueChange={setRole} className='gap-3'>
          {USER_ROLES.map((r) => (
            <div key={r} className='flex items-center space-x-3 space-y-0'>
              <RadioGroupItem value={r} id={`role-${r}`} />
              <Label htmlFor={`role-${r}`} className='font-normal capitalize'>
                {r}
              </Label>
            </div>
          ))}
        </RadioGroup>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant='outline' disabled={isPending}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            disabled={isPending || role === currentRole}
            onClick={handleSaveClick}
          >
            {isPending ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateUserRoleDialog;
