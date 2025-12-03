
'use client'

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UploadCloud, FileText, Loader2, RefreshCw } from 'lucide-react';
import { useState, useTransition } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { analyzeDocument as analyzeDocumentAction } from '@/app/actions';
import type { AnalyzeDocumentOutput } from '@/ai/flows/analyze-document';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function DocumentsPage() {
    const [isAnalyzing, startTransition] = useTransition();
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<AnalyzeDocumentOutput | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                setError("File size cannot exceed 5MB.");
                return;
            }
            setUploadedFile(file);
            setAnalysisResult(null);
            setError(null);
            
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUploadClick = () => {
        document.getElementById('file-upload')?.click();
    };

    const handleAnalyze = () => {
        if (!previewUrl) return;
        startTransition(async () => {
            const result = await analyzeDocumentAction(previewUrl);
            if (result.success && result.data) {
                setAnalysisResult(result.data);
            } else {
                setError(result.error || "An unknown error occurred during analysis.");
            }
        });
    };

    const handleReset = () => {
        setUploadedFile(null);
        setPreviewUrl(null);
        setAnalysisResult(null);
        setError(null);
    }
    
    const renderJson = (data: Record<string, any>, level = 0) => {
        return (
            <div className={`pl-${level * 4}`}>
                {Object.entries(data).map(([key, value]) => (
                    <div key={key} className="flex text-sm">
                        <span className="font-semibold text-primary/80 mr-2">{key}:</span>
                        {typeof value === 'object' && value !== null ? (
                            <div className="flex flex-col">{renderJson(value, level + 1)}</div>
                        ) : (
                            <span className="font-mono">{String(value)}</span>
                        )}
                    </div>
                ))}
            </div>
        )
    };

    return (
        <div className="flex flex-col h-screen">
            <header className="p-4 border-b">
                 <h2 className="text-2xl font-bold tracking-tight">Document Intelligence</h2>
                 <p className="text-muted-foreground">Upload your financial documents for AI-powered analysis.</p>
            </header>
            <div className="flex-grow p-4 md:p-8 overflow-auto">
                 <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                     <Card>
                        <CardHeader>
                            <CardTitle>Secure Document Upload</CardTitle>
                            <CardDescription>Upload bills, salary slips, or investment statements. Your data is processed securely.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {previewUrl ? (
                                <div className="relative aspect-video w-full rounded-lg overflow-hidden border">
                                    <Image src={previewUrl} alt="Document preview" layout="fill" objectFit="contain" />
                                </div>
                            ) : (
                                <div 
                                    className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-12 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 transition-colors"
                                    onClick={handleUploadClick}
                                >
                                    <input
                                        type="file"
                                        id="file-upload"
                                        className="hidden"
                                        onChange={handleFileChange}
                                        accept="image/png,image/jpeg,image/webp"
                                        disabled={isAnalyzing}
                                    />
                                    <UploadCloud className="h-12 w-12 text-muted-foreground mb-4" />
                                    <p className="font-semibold">Click to upload or drag and drop</p>
                                    <p className="text-sm text-muted-foreground">PNG, JPG, WEBP (max. 5MB)</p>
                                </div>
                            )}
                             {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}

                        </CardContent>
                        <CardFooter className="flex gap-2">
                            <Button className="w-full" disabled={!uploadedFile || isAnalyzing} onClick={handleAnalyze}>
                                {isAnalyzing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</> : 'Start Analysis'}
                            </Button>
                            <Button variant="outline" className="w-full" onClick={handleReset} disabled={isAnalyzing}>
                                <RefreshCw className="mr-2 h-4 w-4" /> Reset
                            </Button>
                        </CardFooter>
                    </Card>

                    <AnimatePresence>
                    {(isAnalyzing || analysisResult) && (
                         <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                        <Card>
                            <CardHeader>
                                <CardTitle>Analysis Results</CardTitle>
                                <CardDescription>Structured data extracted from your document by AI.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 font-mono text-sm max-h-[400px] overflow-y-auto">
                                {isAnalyzing ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-2">
                                            <Loader2 className="h-5 w-5 animate-spin text-primary" />
                                            <p className="text-muted-foreground">AI is analyzing the document...</p>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="h-4 bg-muted rounded-full w-1/3 animate-pulse"></div>
                                            <div className="h-4 bg-muted rounded-full w-2/3 animate-pulse"></div>
                                            <div className="h-4 bg-muted rounded-full w-1/2 animate-pulse"></div>
                                        </div>
                                    </div>
                                ) : analysisResult ? (
                                    <div className="space-y-4">
                                        <div>
                                            <p><span className="font-bold text-primary">Document Type:</span> {analysisResult.documentType}</p>
                                            <p><span className="font-bold text-primary">Summary:</span> {analysisResult.summary}</p>
                                        </div>
                                        <div className="pt-4 border-t">
                                            <h4 className="font-bold mb-2 text-primary">Extracted Data:</h4>
                                            {renderJson(analysisResult.extractedData)}
                                        </div>
                                    </div>
                                ) : null}
                            </CardContent>
                        </Card>
                        </motion.div>
                    )}
                    </AnimatePresence>
                 </div>
            </div>
        </div>
    );
}
