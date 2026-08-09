import { Moon, Sun } from "lucide-react";

import { Button } from "design/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "design/components/ui/dropdown-menu";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "design/components/ui/toggle-group";

import { useTheme } from "@/providers/theme-provider";
import React from "react";

export function ModeToggle({ dropdown = false }) {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = React.useState(false);

  if (dropdown) {
    return (
      <DropdownMenu open={open}>
        <DropdownMenuTrigger
          render={<Button variant="outline" size="icon" />}
          onMouseEnter={() => setOpen(true)}
        >
          <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" onPointerLeave={() => setOpen(false)}>
          <DropdownMenuItem onClick={() => setTheme("light")}>
            Light
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("dark")}>
            Dark
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("system")}>
            System
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <ToggleGroup
      variant="outline"
      defaultValue={theme === "light" ? ["light"] : theme === "dark" ? ["dark"] : ["auto"] as const}
      spacing={0}
      size="lg"
      className={`border`}
    >
      <ToggleGroupItem
        value="light"
        aria-checked={theme === "light"}
        aria-label="Toggle light"
        className={`border-none`}
        onClick={() => setTheme("light")}
      >
        <Button variant="ghost">
          Light
        </Button>
      </ToggleGroupItem>
      <ToggleGroupItem
        value="dark"
        aria-checked={theme === "dark"}
        aria-label="Toggle dark"
        className={`border-none`}
        onClick={() => setTheme("dark")}
      >
        <Button variant="ghost">
          Dark
        </Button>
      </ToggleGroupItem>
      <ToggleGroupItem
        value="auto"
        aria-label="Toggle auto"
        className={`border-none`}
        onClick={() => setTheme("system")}
      >
        <Button variant="ghost">
          Auto
        </Button>
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
