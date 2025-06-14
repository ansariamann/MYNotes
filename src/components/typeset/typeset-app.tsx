
"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import type { Note, StyleValue } from "@/types";
import { AppHeader } from "./app-header";
import { NoteListSidebarContent } from "./note-list-sidebar-content";
import { StylingToolbar } from "./styling-toolbar";
import { AISuggestionsPanel } from "./ai-suggestions-panel";
import { Sidebar, SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid"; // For generating unique IDs
import type { SuggestStylesOutput } from "@/ai/flows/suggest-styles";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";


const initialNotes: Note[] = [
  {
    id: uuidv4(),
    title: "Welcome to TypeSet!",
    content: "This is your first note. Feel free to edit it or create a new one.\n\nTypeSet helps you write beautifully with powerful styling options and AI assistance. Try selecting some text and clicking 'AI Styles'!",
    tags: ["welcome", "getting started"],
    category: "General",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    title: "Brainstorming Ideas",
    content: "1. New project structure\n2. Marketing campaign for Q3\n3. Feature enhancements for the app",
    tags: ["work", "project"],
    category: "Productivity",
    createdAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
];


export function TypeSetApp() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [currentEditorTitle, setCurrentEditorTitle] = useState("");
  const [currentEditorContent, setCurrentEditorContent] = useState("");
  const [currentStyles, setCurrentStyles] = useState<StyleValue>({
    fontFamily: "PT Sans, sans-serif",
    fontSize: "16px",
    fontWeight: "400",
    color: "#000000",
  });
  const [isAISuggestionsPanelOpen, setIsAISuggestionsPanelOpen] = useState(false);
  const [selectedTextForAI, setSelectedTextForAI] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const { toast } = useToast();

  const currentEditorTitleRef = useRef(currentEditorTitle);
  const currentEditorContentRef = useRef(currentEditorContent);
  const contentTextAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    currentEditorTitleRef.current = currentEditorTitle;
  }, [currentEditorTitle]);

  useEffect(() => {
    currentEditorContentRef.current = currentEditorContent;
  }, [currentEditorContent]);

  useEffect(() => {
    const savedNotes = localStorage.getItem("typeset-notes");
    if (savedNotes) {
      try {
        const parsedNotes = JSON.parse(savedNotes);
        setNotes(parsedNotes);
        if (parsedNotes.length > 0 && !activeNoteId) { 
            setActiveNoteId(parsedNotes[0].id);
        }
      } catch (error) {
        console.error("Failed to parse notes from localStorage", error);
        setNotes(initialNotes);
        if (initialNotes.length > 0 && !activeNoteId) {
            setActiveNoteId(initialNotes[0].id);
        }
      }
    } else {
      setNotes(initialNotes);
       if (initialNotes.length > 0 && !activeNoteId) {
            setActiveNoteId(initialNotes[0].id);
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  useEffect(() => {
    if (notes.length > 0 || localStorage.getItem("typeset-notes") !== null) {
        localStorage.setItem("typeset-notes", JSON.stringify(notes));
    }
  }, [notes]);

  const activeNote = useMemo(() => {
    return notes.find(n => n.id === activeNoteId) || null;
  }, [notes, activeNoteId]);

  useEffect(() => {
    if (activeNote) {
      setCurrentEditorTitle(activeNote.title);
      setCurrentEditorContent(activeNote.content);
    } else {
      if (activeNoteId === null) {
        setCurrentEditorTitle("");
        setCurrentEditorContent("");
      }
    }
  }, [activeNote, activeNoteId]);
  

  const stableHandleSaveNote = useCallback(() => {
    if (!activeNoteId) return;

    const titleToSave = currentEditorTitleRef.current;
    const contentToSave = currentEditorContentRef.current;
    
    setNotes(prevNotes => {
      const noteInStorage = prevNotes.find(n => n.id === activeNoteId);
      if (noteInStorage && (noteInStorage.title !== titleToSave || noteInStorage.content !== contentToSave)) {
        return prevNotes.map(note =>
          note.id === activeNoteId
            ? { ...note, title: titleToSave, content: contentToSave, updatedAt: new Date().toISOString() }
            : note
        );
      }
      return prevNotes; 
    });
  }, [activeNoteId]);


  useEffect(() => {
    const handleBlur = () => {
      if (activeNoteId) {
        stableHandleSaveNote();
      }
    };

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (activeNoteId) {
        stableHandleSaveNote();
      }
    };

    window.addEventListener('blur', handleBlur);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('beforeunload', handleBeforeUnload);
       if (activeNoteId) { 
          stableHandleSaveNote();
      }
    };
  }, [activeNoteId, stableHandleSaveNote]);


  const handleCreateNewNote = useCallback(() => {
    if (activeNoteId) {
        stableHandleSaveNote();
    }

    const newNote: Note = {
      id: uuidv4(),
      title: "", // New notes start with a blank title
      content: "",
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setNotes(prevNotes => [newNote, ...prevNotes]);
    setActiveNoteId(newNote.id); 
    toast({ title: "New Note Created", description: "Switched to your new note." });
  }, [activeNoteId, stableHandleSaveNote, toast]);

  const handleSelectNote = useCallback((id: string) => {
    if (activeNoteId === id) return; 

    if(activeNoteId) {
      stableHandleSaveNote(); 
    }
    setActiveNoteId(id);
  }, [activeNoteId, stableHandleSaveNote]);


  const handleDeleteNote = useCallback((id: string) => {
    const noteToDelete = notes.find(n => n.id === id);
    setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
    
    if (activeNoteId === id) {
      const remainingNotes = notes.filter(n => n.id !== id); 
      const newActiveId = remainingNotes.length > 0 ? remainingNotes[0].id : null;
      setActiveNoteId(newActiveId); 
      if (!newActiveId) { 
        setCurrentEditorTitle("");
        setCurrentEditorContent("");
      }
    }
    if (noteToDelete) {
      toast({ title: "Note Deleted", description: `"${noteToDelete.title || 'Untitled Note'}" has been removed.`, variant: "destructive" });
    }
  }, [activeNoteId, notes, toast]);


  const handleStyleChange = useCallback((style: Partial<StyleValue>) => {
    setCurrentStyles(prev => ({ ...prev, ...style }));
    toast({ title: "Style Changed (Conceptual)", description: "In a full app, this style would apply to selected text."});
  }, [toast]);

  const handleFormatAction = useCallback((action: string) => {
    toast({ title: `Format: ${action} (Conceptual)`, description: "This action would format selected text."});
  }, [toast]);

  const handleTriggerAISuggestions = useCallback(() => {
    if (!selectedTextForAI && activeNote) {
      setSelectedTextForAI(activeNote.content.substring(0, 200) || "Sample text for AI suggestions.");
    } else if (!selectedTextForAI && !activeNote) {
      toast({ title: "Select a Note", description: "Please select or create a note first to get AI suggestions.", variant: "destructive" });
      return;
    }
    setIsAISuggestionsPanelOpen(true);
  }, [selectedTextForAI, activeNote, toast]);

  const handleApplyAISuggestion = useCallback((suggestion: SuggestStylesOutput) => {
    setCurrentStyles(prev => ({
      ...prev,
      fontFamily: suggestion.fontFamily || prev.fontFamily,
      fontSize: suggestion.fontSize || prev.fontSize,
      fontWeight: suggestion.fontWeight || prev.fontWeight,
      color: suggestion.color || prev.color,
    }));
    toast({ title: "AI Style Applied (Conceptual)", description: `Suggestion for "${suggestion.emphasis}" applied.`});
    setIsAISuggestionsPanelOpen(false);
  }, [toast]);
  
  const handleApplyAITextSuggestion = useCallback((suggestedText: string) => {
     if (selectedTextForAI && currentEditorContentRef.current.includes(selectedTextForAI)) {
        setCurrentEditorContent(prev => prev.replace(selectedTextForAI, suggestedText));
     } else { 
        setCurrentEditorContent(suggestedText); 
     }
     toast({ title: "AI Text Suggestion Applied", description: "The suggested text has been updated in your note."});
     setIsAISuggestionsPanelOpen(false);
     setSelectedTextForAI(""); 
  }, [toast, selectedTextForAI]);


  const handleExport = useCallback((format: "pdf" | "docx" | "md") => {
    toast({ title: `Exporting as ${format.toUpperCase()}... (Conceptual)`, description: "This feature would generate a file."});
  }, [toast]);

  useEffect(() => {
    if (contentTextAreaRef.current) {
      contentTextAreaRef.current.style.height = 'auto';
      contentTextAreaRef.current.style.height = `${contentTextAreaRef.current.scrollHeight}px`;
    }
  }, [currentEditorContent]);

  const handleTextSelectionForAI = () => {
    if (contentTextAreaRef.current) {
      const selected = contentTextAreaRef.current.value.substring(
        contentTextAreaRef.current.selectionStart,
        contentTextAreaRef.current.selectionEnd
      );
      if (selected) {
        setSelectedTextForAI(selected);
      }
    }
  };

  const handleTitleBlur = () => {
    stableHandleSaveNote(); // Save on blur of title
  };


  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex flex-col min-h-screen">
        <AppHeader onNewNote={handleCreateNewNote} />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar>
             <NoteListSidebarContent
              notes={notes}
              activeNoteId={activeNoteId}
              onSelectNote={handleSelectNote}
              onCreateNote={handleCreateNewNote}
              onDeleteNote={handleDeleteNote}
              searchTerm={searchTerm}
              onSearchTermChange={setSearchTerm}
            />
          </Sidebar>
          <SidebarInset className="flex flex-col overflow-hidden">
            <div className="sticky top-0 z-30 flex h-16 items-center justify-center border-b bg-background px-4 md:px-6 shadow-sm">
              <h1 className="text-2xl font-headline font-semibold text-primary">MyNotes</h1>
            </div>

            {activeNoteId && (
              <div className="sticky top-16 z-20 border-b bg-card shadow-sm">
                <StylingToolbar
                  onStyleChange={handleStyleChange}
                  onFormatAction={handleFormatAction}
                  onTriggerAISuggestions={handleTriggerAISuggestions}
                  onExport={handleExport}
                  currentStyles={currentStyles}
                />
              </div>
            )}
            
            {activeNote ? (
              <ScrollArea className="flex-1 bg-background">
                <div className="p-6 md:p-8 lg:p-12 max-w-3xl mx-auto">
                  <Input
                    placeholder="Note Title"
                    value={currentEditorTitle}
                    onChange={(e) => setCurrentEditorTitle(e.target.value)}
                    onBlur={handleTitleBlur}
                    className="text-3xl md:text-4xl font-headline font-bold border-none shadow-none focus-visible:ring-0 p-0 mb-6 h-auto"
                    aria-label="Note Title"
                  />
                  <Textarea
                    ref={contentTextAreaRef}
                    placeholder="Start writing your note..."
                    value={currentEditorContent}
                    onChange={(e) => {
                      setCurrentEditorContent(e.target.value);
                    }}
                    onSelect={handleTextSelectionForAI} 
                    onMouseUp={handleTextSelectionForAI} 
                    onKeyUp={handleTextSelectionForAI} 
                    className="w-full min-h-[400px] text-base md:text-lg leading-relaxed resize-none border-none shadow-none focus-visible:ring-0 p-0"
                    aria-label="Note Content"
                    style={currentStyles} 
                  />
                </div>
              </ScrollArea>
            ) : (
              <div className="flex-1 flex items-center justify-center p-6 bg-muted/30">
                <p className="text-lg text-muted-foreground">Select a note to edit or create a new one.</p>
              </div>
            )}
          </SidebarInset>
        </div>
      </div>
      <AISuggestionsPanel
        isOpen={isAISuggestionsPanelOpen}
        onClose={() => setIsAISuggestionsPanelOpen(false)}
        selectedText={selectedTextForAI}
        noteContext={activeNote?.title || "General note context"}
        onApplyStyleSuggestion={handleApplyAISuggestion}
        onApplyTextSuggestion={handleApplyAITextSuggestion}
      />
    </SidebarProvider>
  );
}
    
