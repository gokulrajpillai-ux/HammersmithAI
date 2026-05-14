"use client"

import { useState, useEffect, createContext, useContext } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  LayoutDashboard,
  AlertTriangle,
  BarChart3,
  Settings,
  ChevronLeft,
  Activity,
  Menu,
  Moon,
  Sun,
  ShieldCheck,
  FileCode,
  Wallet,
  UserCheck,
  Lock,
  IndianRupee,
  Brain,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"

interface NavItem {
  label: string
  icon: React.ReactNode
  href: string
}

const navItems: NavItem[] = [
  { label: "Dashboard", icon: <LayoutDashboard className="size-5" />, href: "/" },
  { label: "ABHA Onboarding", icon: <UserCheck className="size-5" />, href: "/abha-onboarding" },
  { label: "Consent Manager", icon: <Lock className="size-5" />, href: "/consent-manager" },
  { label: "AI Claims", icon: <Brain className="size-5" />, href: "/dashboard/claims" },
  { label: "Prior Auth", icon: <ShieldCheck className="size-5" />, href: "/prior-auth" },
  { label: "Medical Coding", icon: <FileCode className="size-5" />, href: "/medical-coding" },
  { label: "Payer Claims", icon: <IndianRupee className="size-5" />, href: "/payer-claims" },
  { label: "Denials", icon: <AlertTriangle className="size-5" />, href: "/denial-management" },
  { label: "Patient Portal", icon: <Wallet className="size-5" />, href: "/patient-portal" },
  { label: "Analytics", icon: <BarChart3 className="size-5" />, href: "#" },
  { label: "Settings", icon: <Settings className="size-5" />, href: "#" },
]

const SidebarContext = createContext<{ collapsed: boolean }>({ collapsed: false })

export function useSidebar() {
  return useContext(SidebarContext)
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme === "light") {
      setIsDark(false)
      document.documentElement.classList.add("light")
    }
  }, [])

  const toggleTheme = () => {
    setIsDark(!isDark)
    if (isDark) {
      document.documentElement.classList.add("light")
      localStorage.setItem("theme", "light")
    } else {
      document.documentElement.classList.remove("light")
      localStorage.setItem("theme", "dark")
    }
  }

  return (
    <SidebarContext.Provider value={{ collapsed }}>
      <div className="min-h-screen bg-background">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-40 md:hidden bg-card border border-border shadow-sm"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <Menu className="size-5" />
        </Button>

        {/* Mobile overlay */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={cn(
            "fixed left-0 top-0 z-50 flex h-full flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300",
            collapsed ? "w-16" : "w-64",
            mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          )}
        >
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
            <div className={cn("flex items-center gap-3", collapsed && "justify-center w-full")}>
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
                <Activity className="size-4 text-primary-foreground" />
              </div>
              {!collapsed && (
                <span className="text-lg font-semibold text-sidebar-foreground">RevCycle AI</span>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(!collapsed)}
              className={cn("hidden md:flex", collapsed && "absolute -right-3 top-5 size-6 rounded-full border border-sidebar-border bg-sidebar")}
            >
              <ChevronLeft className={cn("size-4 transition-transform", collapsed && "rotate-180")} />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-2 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-primary"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                    collapsed && "justify-center px-2"
                  )}
                >
                  {item.icon}
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              )
            })}
          </nav>

          {/* Dark Mode Toggle */}
          <div className={cn(
            "border-t border-sidebar-border p-4",
            collapsed ? "flex justify-center" : ""
          )}>
            <div className={cn(
              "flex items-center gap-3",
              collapsed && "justify-center"
            )}>
              {collapsed ? (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  className="size-8"
                >
                  {isDark ? <Moon className="size-4" /> : <Sun className="size-4" />}
                </Button>
              ) : (
                <>
                  <Sun className={cn("size-4", isDark ? "text-muted-foreground" : "text-warning")} />
                  <Switch
                    checked={isDark}
                    onCheckedChange={toggleTheme}
                  />
                  <Moon className={cn("size-4", isDark ? "text-primary" : "text-muted-foreground")} />
                </>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-sidebar-border p-4">
            <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
              <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-xs font-medium text-primary">JD</span>
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">Jane Doe</p>
                  <p className="text-xs text-muted-foreground truncate">Revenue Manager</p>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Main content with dynamic padding */}
        <main className={cn(
          "transition-all duration-300",
          collapsed ? "md:pl-16" : "md:pl-64"
        )}>
          {children}
        </main>
      </div>
    </SidebarContext.Provider>
  )
}
