"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Bold, Italic, Underline, List, Palette, Sparkles, Download, Strikethrough, Pilcrow, ListOrdered, Minus, Redo, Undo
} from "lucide-react";
import type { StyleValue } from "@/types";

interface StylingToolbarProps {
  onStyleChange: (style: Partial<StyleValue>) => void;
  onFormatAction: (action: "bold" | "italic" | "underline" | "strikethrough" | "bulletList" | "orderedList" | "addParagraph" | "undo" | "redo") => void;
  onTriggerAISuggestions: () => void;
  onExport: (format: "pdf" | "docx" | "md") => void;
  currentStyles: StyleValue;
}

const fontFamilies = [
  { label: "PT Sans", value: "PT Sans, sans-serif" },
  { label: "Playfair Display", value: "Playfair Display, serif" },
  { label: "Inter", value: "Inter, sans-serif" },
  { label: "Roboto", value: "Roboto, sans-serif" },
  { label: "Merriweather", value: "Merriweather, serif" },
];

const fontSizes = ["12px", "14px", "16px", "18px", "24px", "32px"];
const fontWeights = [
  { label: "Normal", value: "400" },
  { label: "Medium", value: "500" },
  { label: "Semi-Bold", value: "600" },
  { label: "Bold", value: "700" },
];
const colors = [
  { label: "Black", value: "#000000" },
  { label: "Red", value: "#E53E3E" },
  { label: "Blue", value: "#3182CE" },
  { label: "Green", value: "#38A169" },
  { label: "Purple", value: "#805AD5" },
];

export function StylingToolbar({
  onStyleChange,
  onFormatAction,
  onTriggerAISuggestions,
  onExport,
  currentStyles,
}: StylingToolbarProps) {
  return (
    <div className="p-3 border-b bg-card shadow-sm sticky top-0 z-10">
      <div className="flex flex-wrap items-center gap-2">
        {/* Basic Formatting */}
        <Button variant="outline" size="icon" onClick={() => onFormatAction("undo")} title="Undo"><Undo /></Button>
        <Button variant="outline" size="icon" onClick={() => onFormatAction("redo")} title="Redo"><Redo /></Button>
        <div className="h-6 border-l mx-1"></div>
        <Button variant="outline" size="icon" onClick={() => onFormatAction("bold")} title="Bold"><Bold /></Button>
        <Button variant="outline" size="icon" onClick={() => onFormatAction("italic")} title="Italic"><Italic /></Button>
        <Button variant="outline" size="icon" onClick={() => onFormatAction("underline")} title="Underline"><Underline /></Button>
        <Button variant="outline" size="icon" onClick={() => onFormatAction("strikethrough")} title="Strikethrough"><Strikethrough /></Button>
        
        <div className="h-6 border-l mx-1"></div>
        {/* Font Family */}
        <Select
          onValueChange={(value) => onStyleChange({ fontFamily: value })}
          defaultValue={currentStyles.fontFamily}
        >
          <SelectTrigger className="w-[150px] h-9 text-xs">
            <SelectValue placeholder="Font Family" />
          </SelectTrigger>
          <SelectContent>
            {fontFamilies.map((font) => (
              <SelectItem key={font.value} value={font.value} style={{fontFamily: font.value}}>
                {font.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Font Size */}
        <Select
          onValueChange={(value) => onStyleChange({ fontSize: value })}
          defaultValue={currentStyles.fontSize}
        >
          <SelectTrigger className="w-[90px] h-9 text-xs">
            <SelectValue placeholder="Size" />
          </SelectTrigger>
          <SelectContent>
            {fontSizes.map((size) => (
              <SelectItem key={size} value={size}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Font Weight */}
         <Select
          onValueChange={(value) => onStyleChange({ fontWeight: value })}
          defaultValue={currentStyles.fontWeight}
        >
          <SelectTrigger className="w-[110px] h-9 text-xs">
            <SelectValue placeholder="Weight" />
          </SelectTrigger>
          <SelectContent>
            {fontWeights.map((weight) => (
              <SelectItem key={weight.value} value={weight.value}>
                {weight.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Color Picker */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" title="Text Color">
              <Palette style={{color: currentStyles.color || 'hsl(var(--foreground))'}}/>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2">
            <div className="grid grid-cols-5 gap-1">
              {colors.map((color) => (
                <Button
                  key={color.value}
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full border"
                  style={{ backgroundColor: color.value }}
                  onClick={() => onStyleChange({ color: color.value })}
                  aria-label={color.label}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>
        <div className="h-6 border-l mx-1"></div>
        {/* Lists & Paragraphs */}
        <Button variant="outline" size="icon" onClick={() => onFormatAction("bulletList")} title="Bullet List"><List /></Button>
        <Button variant="outline" size="icon" onClick={() => onFormatAction("orderedList")} title="Numbered List"><ListOrdered /></Button>
        <Button variant="outline" size="icon" onClick={() => onFormatAction("addParagraph")} title="Add Paragraph"><Pilcrow /></Button>
        
        <div className="h-6 border-l mx-1"></div>
        {/* AI & Export */}
        <Button variant="outline" onClick={onTriggerAISuggestions} size="sm" className="h-9 text-xs">
          <Sparkles className="mr-2 h-4 w-4 text-accent" /> AI Styles
        </Button>
        <Popover>
            <PopoverTrigger asChild>
                 <Button variant="outline" size="sm" className="h-9 text-xs">
                    <Download className="mr-2 h-4 w-4" /> Export
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-40 p-1">
                <Button variant="ghost" className="w-full justify-start text-sm" onClick={() => onExport("pdf")}>PDF</Button>
                <Button variant="ghost" className="w-full justify-start text-sm" onClick={() => onExport("docx")}>DOCX</Button>
                <Button variant="ghost" className="w-full justify-start text-sm" onClick={() => onExport("md")}>Markdown</Button>
            </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
