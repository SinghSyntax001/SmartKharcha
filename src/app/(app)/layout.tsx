
'use client'

import { useState, useEffect } from 'react';
import { useLocalStorage } from '@/lib/hooks/use-local-storage';
import type { UserProfile } from '@/lib/types';
import AppSidebar from '@/components/app/sidebar';
import ProfileForm from '@/components/app/profile-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AnimatePresence, motion } from 'framer-motion';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [profile, setProfile] = useLocalStorage<UserProfile | null>('user-profile', null);
  const [isProfileFormOpen, setIsProfileFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // The profile is loaded from localStorage on the client, so we can stop loading.
    setLoading(false);
  }, []);


  const handleProfileCreated = (newProfile: UserProfile) => {
    setProfile(newProfile);
    setIsProfileFormOpen(false);
  };
  
  const handleNewProfile = () => {
    setIsProfileFormOpen(true);
  };

  const LayoutComponent = (
    <div className="flex h-screen bg-background">
        <AppSidebar userProfile={profile} onNewProfile={handleNewProfile} />
        <main className="flex-1 flex flex-col h-screen">
            {children}
        </main>
        
        <Dialog open={isProfileFormOpen} onOpenChange={setIsProfileFormOpen}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="sr-only">Create or Edit Profile</DialogTitle>
                </DialogHeader>
                <ProfileForm onProfileCreated={handleProfileCreated} />
            </DialogContent>
        </Dialog>
    </div>
  );

  const LoaderComponent = (
      <div className="w-full h-screen flex items-center justify-center">
          <p>Loading...</p>
      </div>
  )

  if (loading) {
      return LoaderComponent;
  }

  return (
    <AnimatePresence mode="wait">
        <motion.div
            key={profile ? "app" : "app"} // Use same key to avoid re-animation on profile change
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
        >
            { LayoutComponent }
        </motion.div>
    </AnimatePresence>
  );
}
