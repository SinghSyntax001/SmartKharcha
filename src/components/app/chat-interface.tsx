
'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
import { Send, Loader2, BarChart, ExternalLink, User as UserIcon, Bot, CircleUserRound, AlertCircle } from 'lucide-react';
import type { UserProfile, ChatMessage, AiAction } from '@/lib/types';
import { getAiResponse, saveChatMessage, getChatHistory } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AnimatePresence, motion } from 'framer-motion';
import type { User } from 'firebase/auth';

interface ChatInterfaceProps {
  userProfile: UserProfile | null;
  user: User | null;
  initialMessage: ChatMessage;
  onNewProfile: () => void;
  aiAction?: AiAction;
  documentContext?: string;
}

export default function ChatInterface({ userProfile, user, initialMessage, onNewProfile, aiAction = getAiResponse, documentContext }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage]);
  const [input, setInput] = useState('');
  const [isPending, startTransition] = useTransition();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    // Load chat history when user logs in
    if (user) {
      startTransition(async () => {
        const historyResult = await getChatHistory(user.uid);
        if (historyResult.success && historyResult.data.length > 0) {
          setMessages([initialMessage, ...historyResult.data]);
        }
      });
    } else {
      // Reset to initial message when user logs out
      setMessages([initialMessage]);
    }
  }, [user, initialMessage]);
  
  const isChatDisabled = !userProfile || !user;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isPending || !user || !userProfile) return;

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: input,
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    saveChatMessage(user.uid, userMessage);


    startTransition(async () => {
      // We need to pass the document context to the action if it exists
      const actionToCall = documentContext 
          ? (q: string, p: UserProfile) => getAiResponse(q, p, documentContext) 
          : aiAction;

      const result = await actionToCall(input, userProfile);
      
      const assistantMessage: ChatMessage = {
        id: `asst_${Date.now()}`,
        role: 'assistant',
        content: result.data.reply,
        sources: result.data.sources,
        confidence: result.data.confidence,
      };
      setMessages(prev => [...prev, assistantMessage]);
      saveChatMessage(user.uid, assistantMessage);
    });
  };

  return (
    <div className="flex flex-col h-full">
        <ScrollArea className="flex-grow h-[calc(100%-80px)]" ref={scrollAreaRef}>
          <AnimatePresence>
          <div className="space-y-6 p-4">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={`flex items-start gap-4 ${message.role === 'user' ? 'justify-end' : ''}`}
              >
                {message.role === 'assistant' && (
                  <Avatar className="w-8 h-8 border">
                    <AvatarFallback className="bg-primary text-primary-foreground"><Bot size={18}/></AvatarFallback>
                  </Avatar>
                )}
                <div className={`max-w-2xl p-4 rounded-lg shadow-sm ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-tr-none'
                      : 'bg-card border rounded-tl-none'
                  }`}>
                  <p className="whitespace-pre-wrap">{message.content}</p>

                  {message.role === 'assistant' && (message.confidence || (message.sources && message.sources.length > 0)) && (
                      <div className="mt-4 pt-4 border-t border-border/50 space-y-3">
                         {typeof message.confidence === 'number' && (
                             <TooltipProvider>
                              <Tooltip>
                                  <TooltipTrigger asChild>
                                      <div className="flex items-center gap-2">
                                          <BarChart className="h-4 w-4 text-muted-foreground" />
                                          <span className="text-xs font-medium text-muted-foreground">Confidence: {Math.round(message.confidence * 100)}%</span>
                                          <Progress value={message.confidence * 100} className="w-24 h-1.5" />
                                      </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                      <p>AI's confidence in the accuracy of this response.</p>
                                  </TooltipContent>
                              </Tooltip>
                             </TooltipProvider>
                         )}
                         {message.sources && message.sources.length > 0 && (
                          <div>
                              <h4 className="text-xs font-semibold mb-2 text-muted-foreground">Sources:</h4>
                              <div className="flex flex-wrap gap-2">
                              {message.sources.map((source, index) => (
                                  <a href={source.url} target="_blank" rel="noopener noreferrer" key={index}>
                                      <Badge variant="secondary" className="hover:bg-accent/20 transition-colors">
                                          {source.title} <ExternalLink className="ml-1.5 h-3 w-3" />
                                      </Badge>
                                  </a>
                              ))}
                              </div>
                          </div>
                         )}
                      </div>
                  )}
                </div>
                {message.role === 'user' && (
                  <Avatar className="w-8 h-8 border">
                      <AvatarFallback className="bg-secondary text-secondary-foreground"><UserIcon size={18}/></AvatarFallback>
                  </Avatar>
                )}
              </motion.div>
            ))}
            {isPending && (
               <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-start gap-4"
                >
                  <Avatar className="w-8 h-8 border">
                      <AvatarFallback className="bg-primary text-primary-foreground"><Bot size={18}/></AvatarFallback>
                  </Avatar>
                  <div className="max-w-xl p-4 rounded-lg bg-card border rounded-tl-none flex items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                      <span className="text-sm text-muted-foreground italic">Advisor is thinking...</span>
                  </div>
              </motion.div>
            )}
          </div>
          </AnimatePresence>
        </ScrollArea>

      <div className="p-4 border-t relative">
        {isChatDisabled && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 text-center p-4">
                 {!user && (
                     <Alert className="max-w-md shadow-lg">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Please Log In</AlertTitle>
                        <AlertDescription>
                            You need to be logged in to chat and save your history.
                        </AlertDescription>
                    </Alert>
                 )}
                 {user && !userProfile && (
                     <Alert className="max-w-md shadow-lg">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Create a Profile to Start</AlertTitle>
                        <AlertDescription>
                            Your financial data helps us provide personalized advice.
                        </AlertDescription>
                        <Button size="sm" className="mt-4" onClick={onNewProfile}>
                            <CircleUserRound className="mr-2" />
                            Create Profile
                        </Button>
                    </Alert>
                 )}
            </div>
        )}
        <form onSubmit={handleSubmit} className="w-full flex items-center gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isChatDisabled ? "Please log in and create a profile to chat." : "Ask a financial question..."}
            className="flex-grow resize-none"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
              }
            }}
            disabled={isPending || isChatDisabled}
          />
          <Button type="submit" size="icon" disabled={isPending || !input.trim() || isChatDisabled} className="bg-accent hover:bg-accent/90 flex-shrink-0">
            <Send className="h-5 w-5" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
