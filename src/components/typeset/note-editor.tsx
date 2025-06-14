
"use client";

import React, { useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";

interface NoteEditorProps {
  isNoteSelected: boolean;
  titleValue: string;
  contentValue: string;
  onTitleChange: (title: string) => void;
  onContentChange: (content: string) => void;
  onSelectionChange?: (selectedText: string) => void;
}

export const NoteEditor = React.memo(function NoteEditor({ 
  isNoteSelected,
  titleValue,
  contentValue,
  onTitleChange, 
  onContentChange, 
  onSelectionChange 
}: NoteEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [contentValue]); // Depend on contentValue to resize

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

  if (!isNoteSelected) {
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
          value={titleValue}
          onChange={(e) => onTitleChange(e.target.value)}
          className="text-3xl md:text-4xl font-headline font-bold border-none shadow-none focus-visible:ring-0 p-0 mb-6 h-auto"
          aria-label="Note Title"
        />
        <Textarea
          ref={textareaRef}
          placeholder="Start writing your note..."
          value={contentValue}
          onChange={(e) => {
            onContentChange(e.target.value);
          }}
          onSelect={handleTextSelection} 
          onMouseUp={handleTextSelection} 
          onKeyUp={handleTextSelection} 
          className="w-full min-h-[calc(100vh-22rem)] text-base md:text-lg leading-relaxed resize-none border-none shadow-none focus-visible:ring-0 p-0"
          aria-label="Note Content"
        />
      </div>
    </ScrollArea>
  );
});
