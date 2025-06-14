
"use client";

import React, { useEffect, useRef } from "react";
import type { Note } from "@/types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";

interface NoteEditorProps {
  note: Note | null;
  onTitleChange: (title: string) => void;
  onContentChange: (content: string) => void;
  onSelectionChange?: (selectedText: string) => void;
}

export const NoteEditor = React.memo(function NoteEditor({ note, onTitleChange, onContentChange, onSelectionChange }: NoteEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [note?.content]); // Only re-run if content changes

  const handleTextSelection = () => {
    if (textareaRef.current && onSelectionChange) {
      const selectedText = textareaRef.current.value.substring(
        textareaRef.current.selectionStart,
        textareaRef.current.selectionEnd
      );
      if (selectedText) {
        onSelectionChange(selectedText);
      }
    }
  };

  if (!note) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-muted/30">
        <p className="text-lg text-muted-foreground">Select a note to edit or create a new one.</p>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1 bg-background">
      <div className="p-6 md:p-8 lg:p-12 max-w-3xl mx-auto">
        <Input
          placeholder="Note Title"
          value={note.title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="text-3xl md:text-4xl font-headline font-bold border-none shadow-none focus-visible:ring-0 p-0 mb-6 h-auto"
          aria-label="Note Title"
        />
        <Textarea
          ref={textareaRef}
          placeholder="Start writing your note..."
          value={note.content}
          onChange={(e) => {
            onContentChange(e.target.value);
          }}
          onSelect={handleTextSelection} // Changed from onMouseUp for more general selection handling
          onMouseUp={handleTextSelection} // Keep for mouse-based selections
          onKeyUp={handleTextSelection} // Add for keyboard-based selections
          className="w-full min-h-[calc(100vh-22rem)] text-base md:text-lg leading-relaxed resize-none border-none shadow-none focus-visible:ring-0 p-0" // Adjusted min-height
          aria-label="Note Content"
        />
      </div>
    </ScrollArea>
  );
});

    