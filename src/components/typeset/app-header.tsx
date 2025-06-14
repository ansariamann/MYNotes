"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { FilePlus2, Settings } from "lucide-react";

interface AppHeaderProps {
  onNewNote: () => void;
}

export function AppHeader({ onNewNote }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 shadow-sm">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-8 w-8 text-primary"
        >
          <path d="M12 6V4M12 6C10.8954 6 10 6.89543 10 8C10 9.10457 10.8954 10 12 10C13.1046 10 14 9.10457 14 8C14 6.89543 13.1046 6 12 6ZM12 6C12 3.79086 10.2091 2 8 2C5.79086 2 4 3.79086 4 6C4 8.20914 5.79086 10 8 10M12 18V20M12 18C10.8954 18 10 17.1046 10 16C10 14.8954 10.8954 14 12 14C13.1046 14 14 14.8954 14 16C14 17.1046 13.1046 18 12 18ZM12 18C12 20.2091 13.7909 22 16 22C18.2091 22 20 20.2091 20 18C20 15.7909 18.2091 14 16 14" />
          <path d="M8 10H16" />
        </svg>
        <h1 className="text-2xl font-headline font-semibold text-primary">TypeSet</h1>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onNewNote}>
          <FilePlus2 className="mr-2 h-4 w-4" />
          New Note
        </Button>
        <Button variant="ghost" size="icon" aria-label="Settings">
          <Settings className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
