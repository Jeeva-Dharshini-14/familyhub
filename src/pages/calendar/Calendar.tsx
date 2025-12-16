import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, Clock, Bell } from "lucide-react";
import { apiService } from "@/lib/apiService";
import { authUtils } from "@/lib/auth";
import { notificationService } from "@/lib/notificationService";
import { toast } from "@/hooks/use-toast";
import { EmptyState } from "@/components/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";

const Calendar = () => {
  const user = authUtils.getAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week">("month");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [eventDetailOpen, setEventDetailOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    startTime: "09:00",
    endDate: "",
    endTime: "10:00",
    type: "event",
    color: "#3b82f6",
    reminderMinutes: 30,
  });

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      if (!user?.familyId) return;
      const data = await apiService.getCalendarEvents(user.familyId);
      setEvents(data);
    } catch (error: any) {
      toast({
        title: "Failed to load events",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvent = async () => {
    try {
      if (!formData.title || !formData.startDate) {
        toast({
          title: "Missing fields",
          description: "Title and start date are required",
          variant: "destructive",
        });
        return;
      }

      const startDateTime = `${formData.startDate}T${formData.startTime}:00`;
      const endDateTime = formData.endDate 
        ? `${formData.endDate}T${formData.endTime}:00`
        : `${formData.startDate}T${formData.endTime}:00`;

      const newEvent = await apiService.addCalendarEvent({
        familyId: user?.familyId,
        title: formData.title,
        description: formData.description,
        startDate: startDateTime,
        endDate: endDateTime,
        type: formData.type,
        color: formData.color,
        reminderMinutes: formData.reminderMinutes,
        createdBy: user?.memberId,
      });

      // Create reminder notification using notification service
      if (formData.reminderMinutes > 0) {
        await notificationService.createEventReminder(newEvent, formData.reminderMinutes);
      }

      toast({
        title: "Event added",
        description: `${formData.title} has been added to your calendar`,
      });
      
      // Show browser notification if permission granted
      if (formData.reminderMinutes > 0) {
        await notificationService.showBrowserNotification(
          'Event Added',
          `Reminder set for "${formData.title}" - ${formData.reminderMinutes} minutes before`
        );
      }

      setDialogOpen(false);
      resetForm();
      await loadEvents();
      
      // Trigger notification update
      window.dispatchEvent(new CustomEvent('notificationsUpdated'));
    } catch (error: any) {
      toast({
        title: "Failed to add event",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      startDate: "",
      startTime: "09:00",
      endDate: "",
      endTime: "10:00",
      type: "event",
      color: "#3b82f6",
      reminderMinutes: 30,
    });
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const handleEventClick = (event: any) => {
    setSelectedEvent(event);
    setEventDetailOpen(true);
  };

  const deleteEvent = async (eventId: string) => {
    try {
      await apiService.deleteCalendarEvent(eventId);
      toast({ title: "Event deleted" });
      setEventDetailOpen(false);
      setSelectedEvent(null);
      await loadEvents();
      
      // Trigger notification update
      window.dispatchEvent(new CustomEvent('notificationsUpdated'));
    } catch (error: any) {
      toast({ title: "Failed to delete event", description: error.message, variant: "destructive" });
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    // Add empty slots for days before the first of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const getEventsForDate = (date: Date | null) => {
    if (!date) return [];
    const dateStr = date.toISOString().split("T")[0];
    return events.filter((event) => {
      const eventStart = event.startDate.split("T")[0];
      const eventEnd = event.endDate.split("T")[0];
      return dateStr >= eventStart && dateStr <= eventEnd;
    });
  };

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const getTypeColor = (type: string) => {
    const colors: any = {
      task: "bg-primary",
      bill: "bg-destructive",
      appointment: "bg-accent",
      exam: "bg-secondary",
      event: "bg-primary",
      trip: "bg-secondary",
    };
    return colors[type] || "bg-muted";
  };

  const getTypeBadgeVariant = (type: string): any => {
    const variants: any = {
      task: "default",
      bill: "destructive",
      appointment: "secondary",
      exam: "outline",
      event: "default",
      trip: "secondary",
    };
    return variants[type] || "outline";
  };

  const monthName = currentDate.toLocaleString("default", { month: "long", year: "numeric" });

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
            <p className="text-muted-foreground">Family events and schedule</p>
          </div>
          <div className="flex gap-2">
            <Select value={viewMode} onValueChange={(val: any) => setViewMode(val)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="week">Week</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" />
              Add Event
            </Button>
          </div>
        </div>

        {/* Calendar View */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                {monthName}
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() =>
                    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
                  }
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCurrentDate(new Date())}
                >
                  Today
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() =>
                    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
                  }
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {/* Day headers */}
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="text-center font-semibold text-sm py-2 text-muted-foreground">
                  {day}
                </div>
              ))}
              {/* Calendar days */}
              {getDaysInMonth(currentDate).map((date, index) => {
                const dayEvents = getEventsForDate(date);
                const isCurrentDay = isToday(date);
                
                return (
                  <Card
                    key={index}
                    className={`min-h-24 p-2 ${
                      !date ? "invisible" : ""
                    } ${isCurrentDay ? "border-primary border-2" : ""} hover:shadow-medium transition-shadow cursor-pointer`}
                    onClick={() => date && handleDateClick(date)}
                  >
                    {date && (
                      <>
                        <div className={`text-sm font-medium mb-2 ${isCurrentDay ? "text-primary" : ""}`}>
                          {date.getDate()}
                        </div>
                        <div className="space-y-1">
                          {dayEvents.slice(0, 2).map((event) => (
                            <div
                              key={event.id}
                              className={`text-xs px-2 py-1 rounded ${getTypeColor(event.type)} text-white truncate cursor-pointer hover:opacity-80`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEventClick(event);
                              }}
                            >
                              {event.title}
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <div className="text-xs text-muted-foreground text-center">
                              +{dayEvents.length - 2} more
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
              <CardDescription>Next 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              {events.filter((e) => {
                const eventEndDate = new Date(e.endDate);
                const now = new Date();
                const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                return eventEndDate >= now && new Date(e.startDate) <= weekFromNow;
              }).length === 0 ? (
                <EmptyState
                  icon={CalendarIcon}
                  title="No upcoming events"
                  description="No events scheduled for the next 7 days"
                />
              ) : (
                <div className="space-y-3">
                  {events
                    .filter((e) => {
                      const eventEndDate = new Date(e.endDate);
                      const now = new Date();
                      const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                      return eventEndDate >= now && new Date(e.startDate) <= weekFromNow;
                    })
                    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
                    .map((event) => (
                      <div 
                        key={event.id} 
                        className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => handleEventClick(event)}
                      >
                        <div className={`h-2 w-2 rounded-full ${getTypeColor(event.type)} mt-2`} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium">{event.title}</p>
                            <Badge variant={getTypeBadgeVariant(event.type)} className="text-xs">
                              {event.type}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(event.startDate).toLocaleString([], {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                          {event.description && (
                            <p className="text-xs text-muted-foreground mt-1">{event.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Event Types</CardTitle>
              <CardDescription>Events by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {["task", "bill", "appointment", "exam", "event", "trip"].map((type) => {
                  const count = events.filter((e) => e.type === type).length;
                  return (
                    <div key={type} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2">
                        <div className={`h-3 w-3 rounded ${getTypeColor(type)}`} />
                        <span className="text-sm capitalize">{type}</span>
                      </div>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Event Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Event</DialogTitle>
            <DialogDescription>Create a new calendar event</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Doctor's appointment"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Additional details..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time *</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  min={formData.startDate}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Event Type</Label>
              <Select value={formData.type} onValueChange={(val) => setFormData({ ...formData, type: val })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="event">Event</SelectItem>
                  <SelectItem value="task">Task</SelectItem>
                  <SelectItem value="bill">Bill</SelectItem>
                  <SelectItem value="appointment">Appointment</SelectItem>
                  <SelectItem value="exam">Exam</SelectItem>
                  <SelectItem value="trip">Trip</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Reminder</Label>
              <Select 
                value={formData.reminderMinutes.toString()} 
                onValueChange={(val) => setFormData({ ...formData, reminderMinutes: parseInt(val) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">No reminder</SelectItem>
                  <SelectItem value="15">15 minutes before</SelectItem>
                  <SelectItem value="30">30 minutes before</SelectItem>
                  <SelectItem value="60">1 hour before</SelectItem>
                  <SelectItem value="1440">1 day before</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddEvent}>Add Event</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Date Events Sidebar */}
      {selectedDate && (
        <div className="fixed right-4 top-20 w-80 bg-card border rounded-lg shadow-lg p-4 z-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">
              Events for {selectedDate.toLocaleDateString()}
            </h3>
            <Button size="icon" variant="ghost" onClick={() => setSelectedDate(null)}>
              ✕
            </Button>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {getEventsForDate(selectedDate).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No events on this date
              </p>
            ) : (
              getEventsForDate(selectedDate).map((event) => (
                <div 
                  key={event.id}
                  className="p-3 border rounded cursor-pointer hover:bg-muted/50"
                  onClick={() => handleEventClick(event)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`h-2 w-2 rounded-full ${getTypeColor(event.type)}`} />
                    <p className="font-medium text-sm">{event.title}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(event.startDate).toLocaleString([], { 
                      month: 'short', 
                      day: 'numeric',
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                  {event.description && (
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {event.description}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Event Detail Dialog */}
      <Dialog open={eventDetailOpen} onOpenChange={setEventDetailOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${getTypeColor(selectedEvent?.type)}`} />
              {selectedEvent?.title}
            </DialogTitle>
            <DialogDescription>
              <Badge variant={getTypeBadgeVariant(selectedEvent?.type)}>
                {selectedEvent?.type}
              </Badge>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Date & Time</Label>
              <p className="text-sm text-muted-foreground">
                {selectedEvent && new Date(selectedEvent.startDate).toLocaleString([], {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
                {selectedEvent?.endDate && selectedEvent.endDate !== selectedEvent.startDate && (
                  <> - {new Date(selectedEvent.endDate).toLocaleString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</>
                )}
              </p>
            </div>
            {selectedEvent?.description && (
              <div>
                <Label className="text-sm font-medium">Description</Label>
                <p className="text-sm text-muted-foreground">{selectedEvent.description}</p>
              </div>
            )}
            {selectedEvent?.reminderMinutes > 0 && (
              <div>
                <Label className="text-sm font-medium">Reminder</Label>
                <p className="text-sm text-muted-foreground">
                  {selectedEvent.reminderMinutes < 60 
                    ? `${selectedEvent.reminderMinutes} minutes before`
                    : selectedEvent.reminderMinutes < 1440
                    ? `${Math.floor(selectedEvent.reminderMinutes / 60)} hour(s) before`
                    : `${Math.floor(selectedEvent.reminderMinutes / 1440)} day(s) before`
                  }
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              variant="destructive" 
              onClick={() => selectedEvent && deleteEvent(selectedEvent.id)}
            >
              Delete Event
            </Button>
            <Button variant="outline" onClick={() => setEventDetailOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Calendar;
