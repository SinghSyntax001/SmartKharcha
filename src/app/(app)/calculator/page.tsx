
'use client'

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function CalculatorPage() {
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);
        // Simulate calculation
        setTimeout(() => {
            setIsLoading(false);
        }, 1500);
    };

    return (
        <div className="flex flex-col h-screen">
            <header className="p-4 border-b">
                 <h2 className="text-2xl font-bold tracking-tight">Dual-Regime Tax Calculator</h2>
                 <p className="text-muted-foreground">Compare your tax liability under the Old and New Indian tax regimes.</p>
            </header>
            <div className="flex-grow p-4 md:p-8 overflow-auto">
                <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                    <Card>
                        <form onSubmit={handleSubmit}>
                            <CardHeader>
                                <CardTitle>Enter Your Financials</CardTitle>
                                <CardDescription>Provide your income and deduction details to calculate your tax.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="income">Gross Annual Income (₹)</Label>
                                    <Input id="income" type="number" placeholder="e.g., 1200000" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="deductions">Total Deductions (80C, 80D, etc.) (₹)</Label>
                                    <Input id="deductions" type="number" placeholder="e.g., 150000" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="hra">House Rent Allowance (HRA) Exemption (₹)</Label>
                                    <Input id="hra" type="number" placeholder="e.g., 50000" />
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Calculate Tax
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>

                     <Card>
                        <CardHeader>
                            <CardTitle>Tax Calculation Results</CardTitle>
                            <CardDescription>Side-by-side comparison of your tax payable.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 gap-4 text-center">
                                <div>
                                    <h3 className="font-bold text-lg">Old Regime</h3>
                                    <p className="text-2xl font-mono text-primary mt-2">₹ {isLoading ? '...' : '1,12,500'}</p>
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">New Regime</h3>
                                    <p className="text-2xl font-mono text-accent mt-2">₹ {isLoading ? '...' : '97,500'}</p>
                                </div>
                            </div>
                            <div className={`p-4 rounded-lg text-center ${isLoading ? 'bg-muted' : 'bg-accent/10'}`}>
                                <h4 className="font-semibold">AI Recommendation</h4>
                                <p className="text-sm mt-1">{isLoading ? 'Analyzing...' : 'The New Regime seems more beneficial for you, saving you ₹15,000.'}</p>
                            </div>
                        </CardContent>
                         <CardFooter>
                                <Button variant="outline" className="w-full" disabled>
                                    Generate Detailed Report (Coming Soon)
                                </Button>
                            </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}
