
"use client";

import React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { FilePlus2, Settings } from "lucide-react";

interface AppHeaderProps {
  onNewNote: () => void;
}

export const AppHeader = React.memo(function AppHeader({ onNewNote }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6 shadow-sm">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" />
        {/* App icon and name removed, will be in the content area header */}
      </div>
      <div className="flex items-center gap-2">
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
});
