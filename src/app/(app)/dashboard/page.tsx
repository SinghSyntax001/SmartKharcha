
'use client'

import { useLocalStorage } from '@/lib/hooks/use-local-storage';
import { UserProfile } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { DollarSign, Shield, TrendingUp, HandHelping, FileText, Calculator } from 'lucide-react';
import ChatInterface from '@/components/app/chat-interface';
import { useState } from 'react';
import ProfileForm from '@/components/app/profile-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Link from 'next/link';

const featureCards = [
  { 
    icon: Shield, 
    title: 'AI Insurance Advisor', 
    description: 'Find the best insurance policies tailored to your profile.',
    href: '/insurance'
  },
  { 
    icon: HandHelping, 
    title: 'RAG-Powered Tax Chatbot', 
    description: 'Ask complex tax questions and get accurate, context-aware answers.',
    href: '/tax-chat'
  },
   { 
    icon: Calculator, 
    title: 'Tax Calculator & Advisor', 
    description: 'Compare Old vs. New tax regimes and get personalized advice.',
    href: '/calculator'
  },
  { 
    icon: FileText, 
    title: 'Document Intelligence', 
    description: 'Upload financial documents for AI-powered analysis.',
    href: '/documents'
  },
];


export default function DashboardPage() {
    const [profile] = useLocalStorage<UserProfile | null>('user-profile', null);
    const [isProfileFormOpen, setIsProfileFormOpen] = useState(false);

    const handleProfileCreated = () => {
        // This will be handled by the layout now
        setIsProfileFormOpen(false);
    };

    const handleNewProfile = () => {
        setIsProfileFormOpen(true);
    };


    const welcomeMessage = profile ? `Welcome back, ${profile.name}!` : "Welcome to SmartKharcha AI!";
    const welcomeDescription = profile ? "Here's a quick overview of your financial toolkit." : "Create a profile to get started with personalized financial advice.";

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">{welcomeMessage}</h2>
                    <p className="text-muted-foreground">{welcomeDescription}</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {featureCards.map(feature => (
                    <Link href={feature.href} key={feature.title}>
                        <Card className="relative hover:shadow-md transition-shadow h-full">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {feature.title}
                                </CardTitle>
                                <feature.icon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-xs text-muted-foreground">{feature.description}</div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            <Card className="h-[calc(100vh-270px)]">
                 <ChatInterface 
                    userProfile={profile}
                    onNewProfile={handleNewProfile}
                    initialMessage={{
                        id: 'init-dash',
                        role: 'assistant',
                        content: "I'm your general financial assistant. Ask me anything about your finances, or use the specialized tools for specific tasks."
                    }}
                />
            </Card>

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
