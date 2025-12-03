
'use client'

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useTransition } from 'react';
import { Loader2 } from 'lucide-react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { calculateTax } from '@/app/actions';
import { AnimatePresence, motion } from 'framer-motion';

const CalculatorSchema = z.object({
  income: z.coerce.number().min(1, { message: "Annual income is required." }),
  deductions: z.coerce.number().min(0).optional().default(0),
  hra: z.coerce.number().min(0).optional().default(0),
});

type CalculatorFormValues = z.infer<typeof CalculatorSchema>;

type CalculationResult = {
    taxOldRegime: number;
    taxNewRegime: number;
    recommendation: string;
};

export default function CalculatorPage() {
    const [isPending, startTransition] = useTransition();
    const [result, setResult] = useState<CalculationResult | null>(null);

    const form = useForm<CalculatorFormValues>({
        resolver: zodResolver(CalculatorSchema),
        defaultValues: {
            income: 1200000,
            deductions: 150000,
            hra: 50000,
        },
    });

    const onSubmit: SubmitHandler<CalculatorFormValues> = (data) => {
        setResult(null); // Clear previous results
        startTransition(async () => {
            const res = await calculateTax(data);
            if (res.success && res.data) {
                setResult(res.data);
            }
        });
    };
    
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    }

    return (
        <div className="flex flex-col h-screen">
            <header className="p-4 border-b">
                 <h2 className="text-2xl font-bold tracking-tight">Dual-Regime Tax Calculator</h2>
                 <p className="text-muted-foreground">Compare your tax liability under the Old and New Indian tax regimes.</p>
            </header>
            <div className="flex-grow p-4 md:p-8 overflow-auto">
                <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                    <Card>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)}>
                                <CardHeader>
                                    <CardTitle>Enter Your Financials</CardTitle>
                                    <CardDescription>Provide your income and deduction details to calculate your tax.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                     <FormField
                                        control={form.control}
                                        name="income"
                                        render={({ field }) => (
                                            <FormItem>
                                                <Label htmlFor="income">Gross Annual Income (₹)</Label>
                                                <FormControl>
                                                    <Input id="income" type="number" placeholder="e.g., 1200000" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="deductions"
                                        render={({ field }) => (
                                            <FormItem>
                                                <Label htmlFor="deductions">Total Deductions (80C, etc.) (₹)</Label>
                                                <FormControl>
                                                    <Input id="deductions" type="number" placeholder="e.g., 150000" {...field} />
                                                </FormControl>
                                                 <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="hra"
                                        render={({ field }) => (
                                            <FormItem>
                                                <Label htmlFor="hra">House Rent Allowance (HRA) Exemption (₹)</Label>
                                                <FormControl>
                                                    <Input id="hra" type="number" placeholder="e.g., 50000" {...field} />
                                                </FormControl>
                                                 <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                                <CardFooter>
                                    <Button type="submit" className="w-full" disabled={isPending}>
                                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Calculate Tax
                                    </Button>
                                </CardFooter>
                            </form>
                        </Form>
                    </Card>
                    
                    <AnimatePresence>
                    {(isPending || result) && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                        <Card>
                            <CardHeader>
                                <CardTitle>Tax Calculation Results</CardTitle>
                                <CardDescription>Side-by-side comparison of your tax payable.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-2 gap-4 text-center">
                                    <div>
                                        <h3 className="font-bold text-lg">Old Regime</h3>
                                        <p className="text-2xl font-mono text-primary mt-2">
                                            {isPending ? '...' : formatCurrency(result!.taxOldRegime)}
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">New Regime</h3>
                                        <p className="text-2xl font-mono text-accent mt-2">
                                            {isPending ? '...' : formatCurrency(result!.taxNewRegime)}
                                        </p>
                                    </div>
                                </div>
                                <div className={`p-4 rounded-lg text-center ${isPending ? 'bg-muted animate-pulse' : 'bg-accent/10'}`}>
                                    <h4 className="font-semibold">AI Recommendation</h4>
                                    <p className="text-sm mt-1 h-8 flex items-center justify-center">
                                        {isPending ? 'Analyzing...' : result!.recommendation}
                                    </p>
                                </div>
                            </CardContent>
                             <CardFooter>
                                <Button variant="outline" className="w-full" disabled>
                                    Generate Detailed Report (Coming Soon)
                                </Button>
                            </CardFooter>
                        </Card>
                        </motion.div>
                    )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
