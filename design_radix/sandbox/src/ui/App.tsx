import { useEffect, useMemo, useState } from "react";
import { Sun, Moon, Bell } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./DropdownMenu";
import { HomePage } from "./pages/HomePage";
import { BibliographyPage } from "./pages/BibliographyPage";
import { EditorPage } from "./pages/EditorPage";

type Screen = "home" | "bibliography" | "editor";

function applyTheme(theme: "light" | "dark") {
  const root = document.documentElement;
  root.classList.toggle("dark-theme", theme === "dark");
  root.classList.toggle("light-theme", theme === "light");
  localStorage.setItem("theme", theme);
}

export function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark" || saved === "light") {
      setTheme(saved);
      applyTheme(saved);
      return;
    }
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
    const next = prefersDark ? "dark" : "light";
    setTheme(next);
    applyTheme(next);
  }, []);

  const moduleAttr = useMemo(() => {
    if (screen === "bibliography") return "bibliography";
    if (screen === "editor") return "manuscripts";
    return "discover";
  }, [screen]);

  return (
    <div className="app" data-module={moduleAttr}>
      {/* Navbar matching original mockup */}
      <nav className="navbar">
        <a href="#" className="logo" onClick={(e) => { e.preventDefault(); setScreen("home"); }}>
          <div className="logoIcon" />
          <span>Citable</span>
        </a>

        <div className="navActions">
          {/* Theme toggle with sun/moon icons */}
          <button
            className="iconBtn themeToggle"
            type="button"
            aria-label="Toggle theme"
            onClick={() => {
              const next = theme === "dark" ? "light" : "dark";
              setTheme(next);
              applyTheme(next);
            }}
          >
            <Sun className="iconSun" />
            <Moon className="iconMoon" />
          </button>

          {/* Notifications */}
          <button className="iconBtn" type="button" aria-label="Notifications">
            <Bell />
          </button>

          {/* Avatar with dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="avatarBtn" type="button" aria-label="Account menu">
                <Avatar className="avatar">
                  <AvatarFallback>M</AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => setScreen("home")}>Home</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setScreen("bibliography")}>Bibliography</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setScreen("editor")}>Editor</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => {
                  const next = theme === "dark" ? "light" : "dark";
                  setTheme(next);
                  applyTheme(next);
                }}
              >
                Toggle theme
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>

      <main className="pageShell">
        {screen === "home" ? <HomePage /> : null}
        {screen === "bibliography" ? <BibliographyPage /> : null}
        {screen === "editor" ? <EditorPage /> : null}
      </main>
    </div>
  );
}
