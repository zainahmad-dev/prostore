import { Metadata } from 'next';
import { auth } from '@/auth';
import { SessionProvider } from 'next-auth/react';
import ProfileForm from './profile-form';
import PasswordForm from './password-form';

export const metadata: Metadata = {
  title: 'Customer Profile',
};

const Profile = async () => {
  const session = await auth();

  return (
    <SessionProvider session={session}>
      <div className='max-w-md mx-auto space-y-8'>
        <section className='space-y-4'>
          <h2 className='h2-bold'>Profile</h2>
          <ProfileForm />
        </section>
        <section className='space-y-4'>
          <h2 className='h2-bold'>Change Password</h2>
          <PasswordForm />
        </section>
      </div>
    </SessionProvider>
  );
};

export default Profile;
