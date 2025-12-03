
'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bot, Calculator, FileText, Home, CircleUserRound, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import Logo from '@/components/app/logo';
import type { UserProfile } from '@/lib/types';
import { Avatar, AvatarFallback } from '../ui/avatar';


interface SidebarProps {
    userProfile: UserProfile | null;
    onNewProfile: () => void;
}

const navItems = [
    { href: '/dashboard', icon: Home, label: 'Dashboard' },
    { href: '/tax-chat', icon: Bot, label: 'Tax Chatbot' },
    { href: '/documents', icon: FileText, label: 'Documents' },
    { href: '/calculator', icon: Calculator, label: 'Tax Calculator' },
];

export default function AppSidebar({ userProfile, onNewProfile }: SidebarProps) {
    const pathname = usePathname();

    return (
        <aside className="w-64 flex flex-col h-screen border-r bg-card text-card-foreground">
            <div className="p-4 border-b flex items-center gap-3">
                <Logo className="h-8 w-8 text-primary" />
                <h1 className="text-xl font-headline font-bold text-primary">
                    SmartKharcha
                </h1>
            </div>

            <nav className="flex-grow p-4 space-y-2">
                <TooltipProvider delayDuration={0}>
                    {navItems.map((item) => (
                        <Tooltip key={item.href}>
                            <TooltipTrigger asChild>
                                <Button
                                    asChild
                                    variant={pathname === item.href ? 'secondary' : 'ghost'}
                                    className="w-full justify-start"
                                >
                                    <Link href={item.href}>
                                        <item.icon className="mr-3 h-5 w-5" />
                                        <span>{item.label}</span>
                                    </Link>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right" align="center">
                                <p>{item.label}</p>
                            </TooltipContent>
                        </Tooltip>
                    ))}
                </TooltipProvider>
            </nav>
            
            <div className="p-4 border-t">
                 <TooltipProvider delayDuration={0}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" className="w-full justify-start" onClick={onNewProfile}>
                                {userProfile ? (
                                     <>
                                        <Avatar className="w-8 h-8 mr-3 border">
                                            <AvatarFallback className="bg-secondary text-secondary-foreground">{userProfile.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col items-start">
                                            <span className="font-semibold">{userProfile.name}</span>
                                            <span className="text-xs text-muted-foreground">Edit Profile</span>
                                        </div>
                                     </>
                                ) : (
                                    <>
                                        <CircleUserRound className="mr-3 h-5 w-5" />
                                        <span>Create Profile</span>
                                    </>
                                )}
                            </Button>
                        </TooltipTrigger>
                         <TooltipContent side="right" align="center">
                            <p>{userProfile ? 'Switch or edit profile' : 'Create a new user profile'}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        </aside>
    );
}
