
'use client'

import { useLocalStorage } from '@/lib/hooks/use-local-storage';
import { UserProfile } from '@/lib/types';
import ChatInterface from '@/components/app/chat-interface';
import { useState } from 'react';
import ProfileForm from '@/components/app/profile-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getInsuranceAdvice } from '@/app/actions';

export default function InsurancePage() {
    const [profile] = useLocalStorage<UserProfile | null>('user-profile', null);
    const [isProfileFormOpen, setIsProfileFormOpen] = useState(false);

    const handleProfileCreated = () => {
        setIsProfileFormOpen(false);
    };

    const handleNewProfile = () => {
        setIsProfileFormOpen(true);
    };

    return (
        <div className="flex flex-col h-screen">
            <header className="p-4 border-b">
                 <h2 className="text-2xl font-bold tracking-tight">AI Insurance Advisor</h2>
                 <p className="text-muted-foreground">Get personalized insurance recommendations based on your profile.</p>
            </header>
            <div className="flex-grow">
                 <ChatInterface 
                    userProfile={profile}
                    onNewProfile={handleNewProfile}
                    aiAction={getInsuranceAdvice}
                    initialMessage={{
                        id: 'init-insurance',
                        role: 'assistant',
                        content: "Hello! I'm your dedicated insurance advisor. Tell me what kind of insurance you're looking for (e.g., 'term insurance for my family' or 'health insurance for myself')."
                    }}
                />
            </div>
             <Dialog open={isProfileFormOpen} onOpenChange={setIsProfileFormOpen}>
              <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="sr-only">Create Profile</DialogTitle>
                  </DialogHeader>
                  <ProfileForm onProfileCreated={handleProfileCreated} />
              </DialogContent>
          </Dialog>
        </div>
    );
}
