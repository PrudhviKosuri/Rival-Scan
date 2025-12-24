import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle, Clock, Share2, Copy, FileText, Download, User as UserIcon, LogOut, Loader2, ExternalLink, Bookmark, Quote, Check, ArrowLeft } from "lucide-react"
import { useState, useEffect } from "react"
import { api, Source, InsightExplanation } from "@/services/api"
import { useToast } from "@/hooks/use-toast"
import { Card } from "@/components/ui/Card"

// --- Helper: Document Viewer Modal (Local) ---
// This is a simplified version of the full Documents page viewer for modal context
const DocumentViewerModal = ({ startDoc, open, onOpenChange }: { startDoc: any, open: boolean, onOpenChange: (open: boolean) => void }) => {
    const { toast } = useToast()
    const [pinned, setPinned] = useState(false)

    if (!startDoc) return null;

    const handleQuote = () => {
        navigator.clipboard.writeText(`"${startDoc.snippet}" - ${startDoc.title} (${startDoc.url})`);
        toast({ title: "Copied Quote", description: "Snippet copied to clipboard with citation." });
    }

    const handlePin = async () => {
        if (pinned) return;
        await api.addToReport(startDoc.id);
        setPinned(true);
        toast({ title: "Pinned to Report", description: "Document added to your active report draft." });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 bg-white text-black overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white">
                    <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="pl-0 gap-2 hover:bg-transparent">
                        <ArrowLeft className="w-4 h-4" /> Back to List
                    </Button>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="gap-2" onClick={handleQuote}>
                            <Quote className="w-4 h-4" /> Quote
                        </Button>
                        <Button variant={pinned ? "secondary" : "outline"} size="sm" className="gap-2" onClick={handlePin}>
                            {pinned ? <Check className="w-4 h-4 text-green-600" /> : <Bookmark className="w-4 h-4" />}
                            {pinned ? "Pinned" : "Pin to Report"}
                        </Button>
                        <Button variant="outline" size="sm" className="gap-2" onClick={() => {
                            navigator.clipboard.writeText(startDoc.url);
                            toast({ title: "Link Copied", description: "URL copied to clipboard." });
                        }}>
                            <Share2 className="w-4 h-4" /> Share
                        </Button>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-3xl mx-auto">
                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md font-medium uppercase">{startDoc.type}</span>
                                <span className="text-gray-400 text-sm flex items-center gap-1"><Clock className="w-3 h-3" /> {startDoc.timestamp}</span>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">{startDoc.title}</h1>
                            <a href="#" className="flex items-center gap-1 text-[#4B6CB7] hover:underline text-sm truncate">
                                <ExternalLink className="w-3 h-3" /> {startDoc.url}
                            </a>
                        </div>
                        <div className="prose prose-blue max-w-none text-gray-700 leading-loose">
                            <p className="bg-yellow-50 p-4 border-l-4 border-yellow-300 rounded-r-lg mb-6 italic text-gray-600">
                                "{startDoc.snippet}"
                            </p>
                            <p>
                                [Full content scraped from {startDoc.url} would appear here. This is a mock viewer for the prototype.]
                            </p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

// --- Explain Modal ---
export const ExplainModal = ({ open, onOpenChange, insightId, onShowSources }: { open: boolean, onOpenChange: (open: boolean) => void, insightId: string, onShowSources?: () => void }) => {
    const [loading, setLoading] = useState(false);
    const [explanation, setExplanation] = useState<InsightExplanation | null>(null);

    useEffect(() => {
        if (open && insightId) {
            setLoading(true);
            api.explainInsight(insightId).then(data => {
                setExplanation(data);
                setLoading(false);
            });
        }
    }, [open, insightId]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg bg-white text-black">
                <DialogHeader>
                    <DialogTitle>Insight Explanation</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    {loading ? (
                        <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>
                    ) : explanation ? (
                        <div className="prose prose-sm max-w-none text-gray-700">
                            {/* Simple markdown rendering simulation */}
                            {explanation.markdown.split('\n').map((line, i) => (
                                <p key={i} className="mb-2">{line.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\* (.*)/, '• $1')}</p>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 py-8">No additional explanation available.</div>
                    )}
                </div>
                <DialogFooter className="flex justify-between sm:justify-between w-full">
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
                    </div>
                    {onShowSources && (
                        <Button variant="ghost" onClick={onShowSources} className="text-[#4B6CB7] hover:bg-blue-50">
                            Show Sources
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

// --- Sources Modal (Side Sheet) ---
export const SourcesModal = ({ open, onOpenChange, insightId }: { open: boolean, onOpenChange: (open: boolean) => void, insightId: string }) => {
    const [loading, setLoading] = useState(false);
    const [sources, setSources] = useState<Source[]>([]);
    const [viewDoc, setViewDoc] = useState<Source | null>(null);

    useEffect(() => {
        if (open && insightId) {
            setLoading(true);
            api.getSources(insightId).then(data => {
                setSources(data);
                setLoading(false);
            });
        }
    }, [open, insightId]);

    return (
        <>
            <Sheet open={open} onOpenChange={onOpenChange}>
                <SheetContent className="w-[400px] sm:w-[540px] bg-white text-black overflow-y-auto">
                    <SheetHeader className="mb-6">
                        <SheetTitle>Verified Sources</SheetTitle>
                        <SheetDescription>Data streams contributing to this insight.</SheetDescription>
                    </SheetHeader>

                    <div className="space-y-4">
                        {loading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />)}
                            </div>
                        ) : sources.length === 0 ? (
                            <div className="text-center text-gray-500 py-12 bg-gray-50 rounded-lg border border-dashed">
                                <FileText className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                <p>No sources available for this insight.</p>
                            </div>
                        ) : (
                            sources.map(source => (
                                <div key={source.id} className="p-4 border border-gray-100 rounded-lg bg-gray-50 hover:bg-white hover:shadow-sm transition-all group">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="px-1.5 py-0.5 bg-white text-gray-600 text-[10px] uppercase font-bold border rounded tracking-wider">
                                                {source.type}
                                            </span>
                                            <span className="text-xs text-gray-400 flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> {source.timestamp}
                                            </span>
                                        </div>
                                    </div>

                                    <h4 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2 leading-snug">
                                        {source.title}
                                    </h4>

                                    <p className="text-xs text-gray-600 italic border-l-2 border-[#4B6CB7]/30 pl-2 mb-3 line-clamp-2">
                                        "{source.snippet}"
                                    </p>

                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="w-full text-xs h-8 gap-2 bg-white hover:bg-gray-50"
                                        onClick={() => setViewDoc(source)}
                                    >
                                        View Source <ExternalLink className="w-3 h-3" />
                                    </Button>
                                </div>
                            ))
                        )}
                    </div>
                </SheetContent>
            </Sheet>

            {/* Document Viewer Overlay */}
            <DocumentViewerModal
                startDoc={viewDoc}
                open={!!viewDoc}
                onOpenChange={(op) => !op && setViewDoc(null)}
            />
        </>
    );
};

// --- Snooze Modal ---
export const SnoozeModal = ({ open, onOpenChange, onConfirm }: { open: boolean, onOpenChange: (open: boolean) => void, onConfirm: (minutes: number) => void }) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-sm bg-white text-black">
                <DialogHeader>
                    <DialogTitle>Snooze Alert</DialogTitle>
                    <DialogDescription>Temporarily mute this alert.</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-2 py-4">
                    <Button variant="outline" onClick={() => onConfirm(60)}>1 Hour</Button>
                    <Button variant="outline" onClick={() => onConfirm(240)}>4 Hours</Button>
                    <Button variant="outline" onClick={() => onConfirm(1440)}>Tomorrow</Button>
                    <Button variant="outline" onClick={() => onConfirm(10080)}>Next Week</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

// --- Share Modal ---
export const ShareModal = ({ open, onOpenChange, resourceType, resourceId }: { open: boolean, onOpenChange: (open: boolean) => void, resourceType: string, resourceId: string }) => {
    const [link, setLink] = useState("");
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (open) {
            setLoading(true);
            api.shareResource(resourceType, resourceId).then(l => {
                setLink(l);
                setLoading(false);
            });
        }
    }, [open, resourceType, resourceId]);

    const copyLink = () => {
        navigator.clipboard.writeText(link);
        toast({ title: "Copied!", description: "Link copied to clipboard." });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-white text-black">
                <DialogHeader>
                    <DialogTitle>Share Insight</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <p className="text-sm text-gray-500">Anyone with this link can view this insight.</p>
                    <div className="flex gap-2">
                        <div className="flex-1 bg-gray-50 border rounded-md px-3 py-2 text-sm text-gray-600 truncate">
                            {loading ? "Generating link..." : link}
                        </div>
                        <Button size="icon" variant="outline" onClick={copyLink} disabled={loading}><Copy className="w-4 h-4" /></Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
