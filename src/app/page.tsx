
'use client';

import { useState } from 'react';
import { useLocalStorage } from '@/lib/hooks/use-local-storage';
import type { UserProfile } from '@/lib/types';
import ProfileForm from '@/components/app/profile-form';
import ChatInterface from '@/components/app/chat-interface';
import Logo from '@/components/app/logo';
import { Button } from '@/components/ui/button';

export default function Home() {
  const [profile, setProfile] = useLocalStorage<UserProfile | null>('user-profile', null);
  const [view, setView] = useState<'form' | 'chat' | null>(null);

  const handleProfileCreated = (newProfile: UserProfile) => {
    setProfile(newProfile);
    setView('chat');
  };

  const handleLogout = () => {
    setProfile(null);
    setView('form');
  };
  
  const currentView = view || (profile ? 'chat' : 'form');

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Logo className="h-10 w-10 text-primary" />
            <div>
              <h1 className="text-2xl md:text-3xl font-headline font-bold text-primary">
                SmartKharcha AI
              </h1>
              <p className="text-sm text-muted-foreground">
                Your Personalized Financial Advisor
              </p>
            </div>
          </div>
          {currentView === 'chat' && (
            <Button variant="outline" size="sm" onClick={handleLogout}>
              New Profile
            </Button>
          )}
        </header>

        <div className="w-full">
          {currentView === 'form' ? (
            <ProfileForm onProfileCreated={handleProfileCreated} />
          ) : profile ? (
            <ChatInterface userProfile={profile} />
          ) : (
             <ProfileForm onProfileCreated={handleProfileCreated} />
          )}
        </div>
        
        <footer className="text-center mt-12">
            <p className="text-xs text-muted-foreground">
              Disclaimer: This is an AI-powered prototype. Not real financial advice.
            </p>
        </footer>
      </div>
    </main>
  );
}
