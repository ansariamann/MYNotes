"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Sparkles, Lightbulb, X } from "lucide-react";
import { suggestStyles as suggestStylesFlow, type SuggestStylesOutput } from "@/ai/flows/suggest-styles";
import { suggestAlternativeText as suggestAlternativeTextFlow, type SuggestAlternativeTextOutput } from "@/ai/flows/suggest-alternative-text";
import type { AiStyleSuggestion } from "@/types";
import { useToast } from "@/hooks/use-toast";


interface AISuggestionsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  selectedText: string;
  noteContext?: string; // e.g., "This is a blog post introduction"
  onApplyStyleSuggestion: (suggestion: SuggestStylesOutput) => void;
  onApplyTextSuggestion: (suggestion: string) => void;
}

type SuggestionType = 'style' | 'text';

export function AISuggestionsPanel({
  isOpen,
  onClose,
  selectedText,
  noteContext,
  onApplyStyleSuggestion,
  onApplyTextSuggestion,
}: AISuggestionsPanelProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [styleSuggestions, setStyleSuggestions] = useState<AiStyleSuggestion[]>([]);
  const [textSuggestions, setTextSuggestions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchSuggestions = async () => {
    if (!selectedText) {
      setError("Please select some text in your note to get suggestions.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setStyleSuggestions([]);
    setTextSuggestions([]);

    try {
      // Fetch style suggestions (multiple, up to 3 for variety)
      const stylePromises = Array(3).fill(null).map((_, i) => 
        suggestStylesFlow({ text: selectedText, context: `${noteContext} (suggestion ${i+1})` })
      );
      const fetchedStyleSuggestions = await Promise.all(stylePromises);
      setStyleSuggestions(fetchedStyleSuggestions.map((s, i) => ({ ...s, id: `style-${i}` })));

      // Fetch text suggestions
      const textSuggOutput = await suggestAlternativeTextFlow({ noteContent: selectedText, context: noteContext });
      setTextSuggestions(textSuggOutput.suggestions.slice(0,3));

    } catch (err) {
      console.error("AI Suggestion Error:", err);
      setError("Failed to fetch AI suggestions. Please try again.");
      toast({
        title: "AI Suggestion Error",
        description: "Could not retrieve suggestions from the AI. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && selectedText) {
      fetchSuggestions();
    } else if (isOpen && !selectedText) {
      setError("Select text in your note to get suggestions.");
       setStyleSuggestions([]);
       setTextSuggestions([]);
    }
  }, [isOpen, selectedText]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="text-2xl font-headline flex items-center">
            <Sparkles className="w-6 h-6 mr-2 text-accent" />
            AI Suggestions
          </DialogTitle>
          <DialogDescription>
            Get AI-powered suggestions to enhance your text. Works best with a few sentences selected.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-grow overflow-y-auto">
          <div className="p-6 space-y-6">
            {isLoading && (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="ml-4 text-lg">Generating brilliant ideas...</p>
              </div>
            )}

            {error && !isLoading && (
              <div className="text-destructive bg-destructive/10 p-4 rounded-md text-center">
                <p>{error}</p>
                {selectedText && <Button onClick={fetchSuggestions} className="mt-2">Try Again</Button>}
              </div>
            )}
            
            {!isLoading && !error && styleSuggestions.length === 0 && textSuggestions.length === 0 && selectedText && (
                 <p className="text-muted-foreground text-center py-10">No suggestions available for the selected text.</p>
            )}

            {!isLoading && !error && (styleSuggestions.length > 0 || textSuggestions.length > 0) && (
              <>
                {styleSuggestions.length > 0 && (
                  <section>
                    <h3 className="text-xl font-semibold mb-3 font-headline flex items-center"><Lightbulb className="w-5 h-5 mr-2 text-primary" />Styling Ideas</h3>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {styleSuggestions.map((s) => (
                        <Card key={s.id} className="shadow-lg hover:shadow-xl transition-shadow">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-semibold">{s.emphasis || "Suggested Style"}</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2 text-sm">
                            <div style={{ fontFamily: s.fontFamily, fontSize: s.fontSize, fontWeight: s.fontWeight, color: s.color }} className="p-2 border rounded-md bg-muted/30 min-h-[50px] flex items-center justify-center text-center">
                              {selectedText.substring(0, 50)}{selectedText.length > 50 ? '...' : ''}
                            </div>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {s.fontFamily && <Badge variant="outline">Font: {s.fontFamily.split(',')[0]}</Badge>}
                              {s.fontSize && <Badge variant="outline">Size: {s.fontSize}</Badge>}
                              {s.fontWeight && <Badge variant="outline">Weight: {s.fontWeight}</Badge>}
                              {s.color && <Badge variant="outline" style={{backgroundColor: s.color, color: '#fff'}}>Color</Badge>}
                            </div>
                            <Button onClick={() => onApplyStyleSuggestion(s)} size="sm" className="w-full mt-3">Apply Style</Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </section>
                )}

                {textSuggestions.length > 0 && (
                  <section className="mt-6">
                     <h3 className="text-xl font-semibold mb-3 font-headline flex items-center"><Lightbulb className="w-5 h-5 mr-2 text-primary" />Alternative Phrasing</h3>
                     <div className="space-y-3">
                        {textSuggestions.map((textSugg, index) => (
                          <Card key={`text-${index}`} className="shadow-lg hover:shadow-xl transition-shadow">
                            <CardContent className="p-4">
                              <p className="text-sm italic">"{textSugg}"</p>
                              <Button onClick={() => onApplyTextSuggestion(textSugg)} size="sm" className="w-full mt-3">Use This Text</Button>
                            </CardContent>
                          </Card>
                        ))}
                     </div>
                  </section>
                )}
              </>
            )}
          </div>
        </ScrollArea>
        <DialogFooter className="p-6 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            <X className="mr-2 h-4 w-4" /> Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
