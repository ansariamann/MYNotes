
"use client";

import React, { useMemo } from "react";
import type { Note } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FilePlus2, Search, Tag, Folder, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface NoteListSidebarContentProps {
  notes: Note[];
  activeNoteId: string | null;
  onSelectNote: (id: string) => void;
  onCreateNote: () => void;
  onDeleteNote: (id: string) => void;
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
}

export const NoteListSidebarContent = React.memo(function NoteListSidebarContent({
  notes,
  activeNoteId,
  onSelectNote,
  onCreateNote,
  onDeleteNote,
  searchTerm,
  onSearchTermChange,
}: NoteListSidebarContentProps) {
  
  const filteredNotes = useMemo(() => {
    if (!searchTerm) return notes;
    const lowerSearchTerm = searchTerm.toLowerCase();
    return notes.filter(note => 
      note.title.toLowerCase().includes(lowerSearchTerm) ||
      note.content.toLowerCase().includes(lowerSearchTerm)
    );
  }, [notes, searchTerm]);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 space-y-4">
        <Button onClick={onCreateNote} className="w-full">
          <FilePlus2 className="mr-2 h-4 w-4" />
          New Note
        </Button>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search notes..."
            className="pl-8 w-full"
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
          />
        </div>
      </div>
      
      <ScrollArea className="flex-grow">
        <div className="px-4 py-2 space-y-1">
          {filteredNotes.length === 0 && searchTerm && (
            <p className="text-sm text-muted-foreground p-2 text-center">No notes match your search.</p>
          )}
           {filteredNotes.length === 0 && !searchTerm && (
            <p className="text-sm text-muted-foreground p-2 text-center">No notes yet. Create one!</p>
          )}
          {filteredNotes.map((note) => (
            <Button
              key={note.id}
              variant="ghost"
              className={cn(
                "w-full justify-start h-auto py-2 px-3 text-left flex flex-col items-start group",
                activeNoteId === note.id && "bg-primary/10 text-primary"
              )}
              onClick={() => onSelectNote(note.id)}
            >
              <div className="flex justify-between w-full items-center">
                <span className="font-medium truncate flex-grow pr-2">{note.title || "Untitled Note"}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity text-destructive hover:bg-destructive/10"
                  onClick={(e) => { e.stopPropagation(); onDeleteNote(note.id); }}
                  aria-label={`Delete note ${note.title || "Untitled Note"}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground truncate w-full mt-0.5">
                {note.content ? (note.content.substring(0, 50) + (note.content.length > 50 ? "..." : "")) : "Empty note"}
              </p>
              {note.tags && note.tags.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {note.tags.slice(0,3).map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                  ))}
                </div>
              )}
            </Button>
          ))}
        </div>
      </ScrollArea>

      <div className="mt-auto p-4 border-t border-border">
        <h3 className="text-sm font-semibold mb-2 text-muted-foreground font-headline">Organization</h3>
        <Button variant="ghost" className="w-full justify-start text-sm">
          <Tag className="mr-2 h-4 w-4" /> Tags
        </Button>
        <Button variant="ghost" className="w-full justify-start text-sm">
          <Folder className="mr-2 h-4 w-4" /> Categories
        </Button>
      </div>
    </div>
  );
});

    