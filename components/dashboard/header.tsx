"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Bell, Calendar, RefreshCw, X, CheckCircle, AlertTriangle, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"

interface Notification {
  id: string
  title: string
  description: string
  time: string
  type: "success" | "warning" | "info"
  read: boolean
}

const initialNotifications: Notification[] = [
  {
    id: "1",
    title: "Payment Received",
    description: "₹1,37,500 received for CLM-2024-4515",
    time: "5 mins ago",
    type: "success",
    read: false,
  },
  {
    id: "2",
    title: "Claim Flagged",
    description: "CLM-2024-4521 flagged for missing authorization",
    time: "1 hour ago",
    type: "warning",
    read: false,
  },
  {
    id: "3",
    title: "AI Analysis Complete",
    description: "4 claims reviewed, 2 potential denials detected",
    time: "2 hours ago",
    type: "info",
    read: false,
  },
]

function getNotificationIcon(type: Notification["type"]) {
  switch (type) {
    case "success":
      return <CheckCircle className="size-4 text-success" />
    case "warning":
      return <AlertTriangle className="size-4 text-warning" />
    case "info":
      return <Info className="size-4 text-primary" />
  }
}

export function DashboardHeader() {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [notifications, setNotifications] = useState(initialNotifications)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2026, 4, 14)) // May 14, 2026

  const unreadCount = notifications.filter(n => !n.read).length

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date)
      setCalendarOpen(false)
      toast.success("Date Range Updated", {
        description: `Dashboard now showing data for ${formatDate(date)}`,
      })
    }
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    
    setTimeout(() => {
      setIsRefreshing(false)
      toast.success("Dashboard Refreshed", {
        description: "All data has been updated with the latest information.",
      })
    }, 1500)
  }

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    toast.success("Notifications Cleared", {
      description: "All notifications have been marked as read.",
    })
  }

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="pl-12 md:pl-0">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Revenue Cycle Management Overview</p>
      </div>
      <div className="flex items-center gap-2">
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 border-border text-muted-foreground">
              <Calendar className="size-4" />
              <span className="hidden sm:inline">{formatDate(selectedDate)}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <div className="p-3 border-b border-border">
              <h4 className="font-medium text-sm">Select Date</h4>
              <p className="text-xs text-muted-foreground mt-1">Choose a date to filter dashboard data</p>
            </div>
            <CalendarComponent
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              initialFocus
            />
            <div className="p-3 border-t border-border flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => {
                  handleDateSelect(new Date())
                }}
              >
                Today
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => {
                  const yesterday = new Date()
                  yesterday.setDate(yesterday.getDate() - 1)
                  handleDateSelect(yesterday)
                }}
              >
                Yesterday
              </Button>
            </div>
          </PopoverContent>
        </Popover>
        <Button 
          variant="outline" 
          size="icon" 
          className="border-border text-muted-foreground"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`size-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
        
        <Popover open={notificationOpen} onOpenChange={setNotificationOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" className="relative border-border text-muted-foreground">
              <Bell className="size-4" />
              {unreadCount > 0 && (
                <Badge className="absolute -right-1 -top-1 size-5 rounded-full p-0 flex items-center justify-center bg-destructive text-destructive-foreground text-xs">
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold">Notifications</h3>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" className="text-xs h-auto py-1" onClick={markAllAsRead}>
                  Mark all read
                </Button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No notifications
                </div>
              ) : (
                notifications.map((notification) => (
                  <div 
                    key={notification.id}
                    className={`flex gap-3 p-4 border-b border-border last:border-0 hover:bg-secondary/50 transition-colors cursor-pointer ${
                      !notification.read ? 'bg-primary/5' : ''
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!notification.read ? 'font-medium' : ''}`}>
                        {notification.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {notification.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {notification.time}
                      </p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="size-6 shrink-0"
                      onClick={(e) => {
                        e.stopPropagation()
                        dismissNotification(notification.id)
                      }}
                    >
                      <X className="size-3" />
                    </Button>
                  </div>
                ))
              )}
            </div>
            {notifications.length > 0 && (
              <div className="p-2 border-t border-border">
                <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => {
                  setNotificationOpen(false)
                  toast.info("Notifications", {
                    description: "Full notification center coming soon.",
                  })
                }}>
                  View all notifications
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>
      </div>
    </header>
  )
}
