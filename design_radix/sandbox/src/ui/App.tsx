import { useEffect, useMemo, useState } from "react";
import { Sun, Moon, Bell } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./DropdownMenu";
import { HomePage } from "./pages/HomePage";
import { BibliographyPage } from "./pages/BibliographyPage";
import { EditorPage } from "./pages/EditorPage";
import { PdfReaderPage } from "./pages/PdfReaderPage";
import { ProjectsPage } from "./pages/ProjectsPage";
import { LandingPage } from "./pages/LandingPage";

type Screen = "landing" | "home" | "bibliography" | "editor" | "pdf-reader" | "projects";

function applyTheme(theme: "light" | "dark") {
  const root = document.documentElement;
  root.classList.toggle("dark-theme", theme === "dark");
  root.classList.toggle("light-theme", theme === "light");
  localStorage.setItem("theme", theme);
}

export function App() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    applyTheme("light");
  }, []);

  const moduleAttr = useMemo(() => {
    if (screen === "bibliography" || screen === "pdf-reader") return "bibliography";
    if (screen === "editor" || screen === "projects") return "manuscripts";
    return "discover";
  }, [screen]);

  // Landing page is fullscreen; home page shows navbar
  const showNavbar = screen === "home";
  const isLanding = screen === "landing";

  // Navigation handler for returning to home
  const handleNavigateHome = () => setScreen("home");

  // Landing page has its own layout
  if (isLanding) {
    return (
      <div className="app" data-module="bibliography">
        <LandingPage onNavigate={(s) => setScreen(s as Screen)} />
      </div>
    );
  }

  return (
    <div className="app" data-module={moduleAttr}>
      {/* Navbar - only shown on home page */}
      {showNavbar && (
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
                <DropdownMenuItem onSelect={() => setScreen("landing")}>Landing Page</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => setScreen("home")}>Home</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setScreen("projects")}>Projects</DropdownMenuItem>
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
      )}

      <main className={showNavbar ? "pageShell" : "pageShell pageShell--full"}>
        {screen === "home" && <HomePage onNavigate={setScreen} />}
        {screen === "projects" && (
          <ProjectsPage
            onNavigateHome={handleNavigateHome}
            onOpenProject={() => setScreen("editor")}
          />
        )}
        {screen === "bibliography" && (
          <BibliographyPage
            onNavigateHome={handleNavigateHome}
            onOpenPdf={() => setScreen("pdf-reader")}
          />
        )}
        {screen === "editor" && (
          <EditorPage onNavigateHome={handleNavigateHome} />
        )}
        {screen === "pdf-reader" && (
          <PdfReaderPage onNavigateHome={handleNavigateHome} />
        )}
      </main>
    </div>
  );
}
