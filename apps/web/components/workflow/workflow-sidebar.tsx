"use client"

import {
    Home,
    History,
    FileText,
    Settings,
    Boxes,
    Workflow,
    Plus,
    User
} from "lucide-react"
import Link from "next/link"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface WorkflowSidebarProps {
    className?: string
}

const sidebarItems = [
    { icon: Home, label: "Home", href: "/" },
    { icon: Workflow, label: "Workflows", href: "/workflows" },
    { icon: History, label: "History", href: "/history" },
    { icon: Boxes, label: "Nodes", href: "/nodes" },
    { icon: FileText, label: "Logs", href: "/logs" },
    { icon: Settings, label: "Settings", href: "/settings" },
]

export function WorkflowSidebar({ className }: WorkflowSidebarProps) {
    return (
        <TooltipProvider delayDuration={0}>
            <aside
                className={cn(
                    "fixed left-0 top-0 z-50 h-screen w-14 flex flex-col items-center py-4 gap-2",
                    "bg-sidebar border-r border-border/50",
                    className
                )}
            >
                {/* Logo / Brand */}
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Boxes className="h-5 w-5" />
                </div>

                {/* Navigation Items */}
                <nav className="flex flex-col gap-2 flex-1">
                    {sidebarItems.map((item) => (
                        <Tooltip key={item.label}>
                            <TooltipTrigger asChild>
                                <Link
                                    href={item.href}
                                    className={cn(
                                        "flex h-10 w-10 items-center justify-center rounded-lg",
                                        "text-muted-foreground hover:text-foreground",
                                        "hover:bg-accent transition-colors",
                                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    )}
                                    aria-label={item.label}
                                >
                                    <item.icon className="h-5 w-5" />
                                </Link>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                                <p>{item.label}</p>
                            </TooltipContent>
                        </Tooltip>
                    ))}
                </nav>

                {/* Bottom Items */}
                <div className="mt-auto flex flex-col gap-2">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                className={cn(
                                    "flex h-10 w-10 items-center justify-center rounded-lg",
                                    "text-muted-foreground hover:text-foreground",
                                    "hover:bg-accent transition-colors"
                                )}
                                aria-label="User Profile"
                            >
                                <User className="h-5 w-5" />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                            <p>Profile</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
            </aside>
        </TooltipProvider>
    )
}
