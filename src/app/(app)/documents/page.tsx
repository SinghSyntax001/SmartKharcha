
'use client'

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UploadCloud, FileText, Loader2 } from 'lucide-react';
import { useState } from 'react';

export default function DocumentsPage() {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            setUploadedFile(file);
            // Simulate upload process
            setIsUploading(true);
            setTimeout(() => {
                setIsUploading(false);
            }, 2000);
        }
    };

    const handleUploadClick = () => {
        document.getElementById('file-upload')?.click();
    };

    return (
        <div className="flex flex-col h-screen">
            <header className="p-4 border-b">
                 <h2 className="text-2xl font-bold tracking-tight">Document Intelligence</h2>
                 <p className="text-muted-foreground">Upload your financial documents for AI-powered analysis.</p>
            </header>
            <div className="flex-grow p-4 md:p-8">
                 <Card className="w-full max-w-3xl mx-auto">
                    <CardHeader>
                        <CardTitle>Secure Document Upload</CardTitle>
                        <CardDescription>Upload bills, salary slips, or investment statements. Your data is processed securely.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div 
                            className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-12 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 transition-colors"
                            onClick={handleUploadClick}
                        >
                            <input
                                type="file"
                                id="file-upload"
                                className="hidden"
                                onChange={handleFileChange}
                                accept=".pdf,.png,.jpg,.jpeg"
                                disabled={isUploading}
                            />
                            {isUploading ? (
                                <>
                                    <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                                    <p className="font-semibold">Analyzing Document...</p>
                                    <p className="text-sm text-muted-foreground">This may take a moment.</p>
                                </>
                            ) : uploadedFile ? (
                                <>
                                    <FileText className="h-12 w-12 text-green-500 mb-4" />
                                    <p className="font-semibold">{uploadedFile.name}</p>
                                    <p className="text-sm text-muted-foreground">Ready for analysis. Click to upload another.</p>
                                </>
                            ) : (
                                <>
                                    <UploadCloud className="h-12 w-12 text-muted-foreground mb-4" />
                                    <p className="font-semibold">Click to upload or drag and drop</p>
                                    <p className="text-sm text-muted-foreground">PDF, PNG, JPG (max. 5MB)</p>
                                </>
                            )}
                        </div>
                        <Button className="w-full" disabled={!uploadedFile || isUploading} >
                            {isUploading ? 'Processing...' : 'Start Analysis (Coming Soon)'}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
