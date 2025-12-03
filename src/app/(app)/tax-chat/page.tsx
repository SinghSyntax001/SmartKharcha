
'use client'

import { useLocalStorage } from '@/lib/hooks/use-local-storage';
import { UserProfile } from '@/lib/types';
import ChatInterface from '@/components/app/chat-interface';
import { useState } from 'react';
import ProfileForm from '@/components/app/profile-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useUser } from '@/firebase';

export default function TaxChatPage() {
    const [profile] = useLocalStorage<UserProfile | null>('user-profile', null);
    const [isProfileFormOpen, setIsProfileFormOpen] = useState(false);
    const { user } = useUser();

    const handleProfileCreated = () => {
        setIsProfileFormOpen(false);
    };

    const handleNewProfile = () => {
        setIsProfileFormOpen(true);
    };

    return (
        <div className="flex flex-col h-screen">
            <header className="p-4 border-b">
                 <h2 className="text-2xl font-bold tracking-tight">Tax Chatbot</h2>
                 <p className="text-muted-foreground">Your AI assistant for Indian tax law. Powered by a specialized knowledge base.</p>
            </header>
            <div className="flex-grow">
                 <ChatInterface 
                    userProfile={profile}
                    user={user}
                    onNewProfile={handleNewProfile}
                    initialMessage={{
                        id: 'init-tax',
                        role: 'assistant',
                        content: "Hello! I am your specialized tax advisor. Ask me any questions about Indian tax regulations, deductions, or filing procedures."
                    }}
                />
            </div>
             <Dialog open={isProfileFormOpen} onOpenChange={setIsProfileFormOpen}>
              <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create Profile</DialogTitle>
                  </DialogHeader>
                  <ProfileForm onProfileCreated={handleProfileCreated} />
              </DialogContent>
          </Dialog>
        </div>
    );
}
