"use client";

import { LogOut } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { logout } from "@/app/actions/auth";

export function LogoutButton() {
  return (
    <DropdownMenuItem 
      className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer" 
      onClick={() => {
        logout();
      }}
    >
      <LogOut className="mr-2 h-4 w-4" /> Sair
    </DropdownMenuItem>
  );
}
