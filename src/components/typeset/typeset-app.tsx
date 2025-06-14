
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import type { Note, StyleValue } from "@/types";
import { AppHeader } from "./app-header";
import { NoteListSidebarContent } from "./note-list-sidebar-content";
import { StylingToolbar } from "./styling-toolbar";
import { NoteEditor } from "./note-editor";
import { AISuggestionsPanel } from "./ai-suggestions-panel";
import { Sidebar, SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid"; // For generating unique IDs
import type { SuggestStylesOutput } from "@/ai/flows/suggest-styles";


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

  useEffect(() => {
    const savedNotes = localStorage.getItem("typeset-notes");
    if (savedNotes) {
      try {
        const parsedNotes = JSON.parse(savedNotes);
        setNotes(parsedNotes);
        // If there are notes, select the first one by default, or the last active one if stored
        if (parsedNotes.length > 0) {
            // Potentially load last active note ID from localStorage too
            setActiveNoteId(parsedNotes[0].id);
        }
      } catch (error) {
        console.error("Failed to parse notes from localStorage", error);
        setNotes(initialNotes);
        if (initialNotes.length > 0) {
            setActiveNoteId(initialNotes[0].id);
        }
      }
    } else {
      setNotes(initialNotes);
       if (initialNotes.length > 0) {
            setActiveNoteId(initialNotes[0].id);
        }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("typeset-notes", JSON.stringify(notes));
  }, [notes]);

  const activeNote = useMemo(() => {
    return notes.find(n => n.id === activeNoteId) || null;
  }, [notes, activeNoteId]);

  useEffect(() => {
    if (activeNote) {
      setCurrentEditorTitle(activeNote.title);
      setCurrentEditorContent(activeNote.content);
    } else {
      // Clear editor fields if no note is active
      setCurrentEditorTitle("");
      setCurrentEditorContent("");
    }
  }, [activeNote]);


  const handleSaveNote = useCallback(() => {
    if (!activeNoteId) return;
    // Check if there are actual changes before saving
    const noteToSave = notes.find(n => n.id === activeNoteId);
    if (noteToSave && (noteToSave.title !== currentEditorTitle || noteToSave.content !== currentEditorContent)) {
        setNotes(prevNotes =>
          prevNotes.map(note =>
            note.id === activeNoteId
              ? { ...note, title: currentEditorTitle, content: currentEditorContent, updatedAt: new Date().toISOString() }
              : note
          )
        );
        toast({ title: "Note Saved!", description: `"${currentEditorTitle || 'Untitled Note'}" has been updated.`});
    }
  }, [activeNoteId, currentEditorTitle, currentEditorContent, toast, notes]); // Added notes to dependency array for accurate check
  
  useEffect(() => {
    const handleBlur = () => {
      // Save only if there's an active note and changes have been made
      if (activeNote && (currentEditorTitle !== activeNote.title || currentEditorContent !== activeNote.content)) {
        handleSaveNote();
      }
    };

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (activeNote && (currentEditorTitle !== activeNote.title || currentEditorContent !== activeNote.content)) {
        handleSaveNote();
        // Standard way to prompt user, though browser behavior varies
        // event.preventDefault();
        // event.returnValue = ''; 
      }
    };

    window.addEventListener('blur', handleBlur);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup: remove event listeners
    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Also, attempt to save one last time if component unmounts with changes
      if (activeNote && (currentEditorTitle !== activeNote.title || currentEditorContent !== activeNote.content)) {
        handleSaveNote();
      }
    };
  }, [activeNote, currentEditorTitle, currentEditorContent, handleSaveNote]);


  const handleCreateNewNote = useCallback(() => {
    // Save current note if it has changes before switching
    if (activeNote && (currentEditorTitle !== activeNote.title || currentEditorContent !== activeNote.content)) {
        handleSaveNote();
    }

    const newNote: Note = {
      id: uuidv4(),
      title: "Untitled Note",
      content: "",
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setNotes(prevNotes => [newNote, ...prevNotes]);
    setActiveNoteId(newNote.id); // This will trigger the useEffect to update editor fields
    toast({ title: "New Note Created", description: "Switched to your new untitled note." });
  }, [toast, activeNote, currentEditorTitle, currentEditorContent, handleSaveNote]);

  const handleSelectNote = useCallback((id: string) => {
    if (activeNoteId === id) return; // Do nothing if already active

    // Save current note if it has changes before switching
    if(activeNote && (currentEditorTitle !== activeNote.title || currentEditorContent !== activeNote.content)) {
      handleSaveNote(); 
    }
    setActiveNoteId(id); // This will trigger the useEffect to update editor fields
  }, [activeNoteId, activeNote, currentEditorTitle, currentEditorContent, handleSaveNote]);


  const handleDeleteNote = useCallback((id: string) => {
    const noteToDelete = notes.find(n => n.id === id);
    setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
    
    if (activeNoteId === id) {
      const remainingNotes = notes.filter(n => n.id !== id); 
      const newActiveId = remainingNotes.length > 0 ? remainingNotes[0].id : null;
      setActiveNoteId(newActiveId); // This will trigger the useEffect to update editor fields
      if (!newActiveId) { // if no notes left
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
     if (selectedTextForAI && currentEditorContent.includes(selectedTextForAI)) {
        setCurrentEditorContent(prev => prev.replace(selectedTextForAI, suggestedText));
     } else { // If selected text not found (e.g. it was the whole content or changed) or no specific text selected
        setCurrentEditorContent(suggestedText); // Replace whole content or append
     }
     toast({ title: "AI Text Suggestion Applied", description: "The suggested text has been updated in your note."});
     setIsAISuggestionsPanelOpen(false);
     setSelectedTextForAI(""); // Clear selected text for AI
  }, [toast, selectedTextForAI, currentEditorContent]);


  const handleExport = useCallback((format: "pdf" | "docx" | "md") => {
    toast({ title: `Exporting as ${format.toUpperCase()}... (Conceptual)`, description: "This feature would generate a file."});
  }, [toast]);

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
            {activeNoteId && (
              <StylingToolbar
                onStyleChange={handleStyleChange}
                onFormatAction={handleFormatAction}
                onTriggerAISuggestions={handleTriggerAISuggestions}
                onExport={handleExport}
                currentStyles={currentStyles}
              />
            )}
            <NoteEditor
              isNoteSelected={!!activeNote}
              titleValue={currentEditorTitle}
              contentValue={currentEditorContent}
              onTitleChange={setCurrentEditorTitle}
              onContentChange={setCurrentEditorContent}
              onSelectionChange={setSelectedTextForAI}
            />
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

