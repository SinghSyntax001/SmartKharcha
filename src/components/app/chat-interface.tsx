
'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
import { Send, Loader2, BarChart, ExternalLink, User, Bot } from 'lucide-react';
import type { UserProfile, ChatMessage } from '@/lib/types';
import { getAiResponse } from '@/app/actions';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ChatInterfaceProps {
  userProfile: UserProfile;
}

const initialMessage: ChatMessage = {
    id: 'init',
    role: 'assistant',
    content: "Hello! I'm your SmartKharcha AI advisor. How can I help you plan your finances today? You can ask me questions like 'How much term insurance do I need?' or 'Suggest some tax-saving investments'.",
};

export default function ChatInterface({ userProfile }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage]);
  const [input, setInput] = useState('');
  const [isPending, startTransition] = useTransition();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isPending) return;

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: input,
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    startTransition(async () => {
      const result = await getAiResponse(input, userProfile);
      
      const assistantMessage: ChatMessage = {
        id: `asst_${Date.now()}`,
        role: 'assistant',
        content: result.data.reply,
        sources: result.data.sources,
        confidence: result.data.confidence,
      };
      setMessages(prev => [...prev, assistantMessage]);
    });
  };

  return (
    <Card className="w-full h-[70vh] shadow-lg flex flex-col">
      <CardHeader className="flex-shrink-0">
         {/* Could add header info here if needed */}
      </CardHeader>
      <CardContent className="flex-grow min-h-0">
          <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
            <div className="space-y-6">
              {messages.map((message) => (
                <div key={message.id} className={`flex items-start gap-4 ${message.role === 'user' ? 'justify-end' : ''}`}>
                  {message.role === 'assistant' && (
                    <Avatar className="w-8 h-8 border">
                      <AvatarFallback className="bg-primary text-primary-foreground"><Bot size={18}/></AvatarFallback>
                    </Avatar>
                  )}
                  <div className={`max-w-xl p-4 rounded-lg shadow-sm ${
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
                        <AvatarFallback className="bg-secondary text-secondary-foreground"><User size={18}/></AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isPending && (
                 <div className="flex items-start gap-4">
                    <Avatar className="w-8 h-8 border">
                        <AvatarFallback className="bg-primary text-primary-foreground"><Bot size={18}/></AvatarFallback>
                    </Avatar>
                    <div className="max-w-xl p-4 rounded-lg bg-card border rounded-tl-none flex items-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        <span className="text-sm text-muted-foreground italic">Advisor is thinking...</span>
                    </div>
                </div>
              )}
            </div>
          </ScrollArea>
      </CardContent>
      <CardFooter className="pt-4 border-t">
        <form onSubmit={handleSubmit} className="w-full flex items-center gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a financial question..."
            className="flex-grow resize-none"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
              }
            }}
            disabled={isPending}
          />
          <Button type="submit" size="icon" disabled={isPending || !input.trim()} className="bg-accent hover:bg-accent/90 flex-shrink-0">
            <Send className="h-5 w-5" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
