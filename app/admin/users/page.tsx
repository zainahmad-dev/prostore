import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Metadata } from 'next';
import { deleteUser, getAllUsers } from '@/lib/actions/user.actions';
import { formatId } from '@/lib/utils';
import Pagination from '@/components/shared/pagination';
import DeleteDialog from '@/components/shared/delete-dialog';
import UpdateUserRoleDialog from '@/components/admin/update-user-role-dialog';
import { requireAdmin } from '@/lib/auth-guard';
import { auth } from '@/auth';

export const metadata: Metadata = {
  title: 'Admin Users',
};

const AdminUsersPage = async (props: {
  searchParams: Promise<{ page: string; query: string }>;
}) => {
  const { page = '1', query: searchText } = await props.searchParams;

  await requireAdmin();
  const session = await auth();

  const users = await getAllUsers({
    page: Number(page),
    query: searchText,
  });

  return (
    <div className='space-y-2'>
      <div className='flex items-center gap-3'>
        <h1 className='h2-bold'>Users</h1>
        {searchText && (
          <div>
            Filtered by <i>&quot;{searchText}&quot;</i>{' '}
            <Link href='/admin/users'>
              <Button variant='outline' size='sm'>
                Remove Filter
              </Button>
            </Link>
          </div>
        )}
      </div>
      <div className='overflow-x-auto'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>NAME</TableHead>
              <TableHead>EMAIL</TableHead>
              <TableHead>ROLE</TableHead>
              <TableHead className='w-[220px]'>ACTIONS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.data.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{formatId(user.id)}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  {user.role === 'admin' ? (
                    <Badge variant='secondary'>admin</Badge>
                  ) : (
                    <Badge variant='outline'>user</Badge>
                  )}
                </TableCell>
                <TableCell className='flex flex-wrap gap-1'>
                  {user.id === session?.user?.id ? (
                    <span className='text-sm text-muted-foreground'>
                      (You)
                    </span>
                  ) : (
                    <>
                      <UpdateUserRoleDialog
                        userId={user.id}
                        currentRole={user.role}
                      />
                      <DeleteDialog id={user.id} action={deleteUser} />
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {users.totalPages > 1 && (
          <Pagination page={Number(page) || 1} totalPages={users.totalPages} />
        )}
      </div>
    </div>
  );
};

export default AdminUsersPage;
