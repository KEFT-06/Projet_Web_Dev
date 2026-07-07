import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { getEvents, saveEvents, addEvent } from '../../lib/storage';
import type { Event } from '../../lib/mockData';
import { toast } from 'sonner';
import { Calendar, Users } from 'lucide-react';

export function AdminEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: '',
    time: '',
    maxParticipants: 20,
  });

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = () => {
    setEvents(getEvents());
  };

  const handleAdd = () => {
    setEditingEvent(null);
    setFormData({
      name: '',
      description: '',
      date: '',
      time: '',
      maxParticipants: 20,
    });
    setShowDialog(true);
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    const eventDate = new Date(event.date);
    setFormData({
      name: event.name,
      description: event.description,
      date: eventDate.toISOString().split('T')[0],
      time: eventDate.toTimeString().substring(0, 5),
      maxParticipants: event.maxParticipants,
    });
    setShowDialog(true);
  };

  const handleSubmit = () => {
    if (!formData.name.trim() || !formData.description.trim() || !formData.date || !formData.time) {
      toast.error('Please fill in all fields');
      return;
    }

    const eventDateTime = new Date(`${formData.date}T${formData.time}`);

    if (editingEvent) {
      // Update existing event
      const allEvents = getEvents();
      const eventIndex = allEvents.findIndex(e => e.id === editingEvent.id);
      
      if (eventIndex !== -1) {
        allEvents[eventIndex] = {
          ...allEvents[eventIndex],
          name: formData.name.trim(),
          description: formData.description.trim(),
          date: eventDateTime,
          maxParticipants: formData.maxParticipants,
        };
        saveEvents(allEvents);
        toast.success('Event updated successfully');
      }
    } else {
      // Create new event
      const newEvent: Event = {
        id: `e${Date.now()}`,
        name: formData.name.trim(),
        description: formData.description.trim(),
        date: eventDateTime,
        participants: [],
        maxParticipants: formData.maxParticipants,
      };
      addEvent(newEvent);
      toast.success('Event created successfully');
    }

    loadEvents();
    setShowDialog(false);
  };

  const handleDelete = (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    const allEvents = getEvents();
    const filteredEvents = allEvents.filter(e => e.id !== eventId);
    saveEvents(filteredEvents);
    loadEvents();
    toast.success('Event deleted');
  };

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1>Event Management</h1>
          <Button onClick={handleAdd}>Add New Event</Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Card key={event.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle>{event.name}</CardTitle>
                  <Badge variant={event.participants.length >= event.maxParticipants ? 'destructive' : 'default'}>
                    {event.participants.length >= event.maxParticipants ? 'Full' : 'Open'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600">{event.description}</p>
                
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>{event.date.toLocaleDateString()} at {event.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span>{event.participants.length} / {event.maxParticipants} participants</span>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(event)} className="flex-1">
                    Edit
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(event.id)} className="flex-1">
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {events.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No events created yet</p>
            <Button onClick={handleAdd}>Create Your First Event</Button>
          </div>
        )}
      </div>

      {/* Add/Edit Event Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingEvent ? 'Edit Event' : 'Create New Event'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Event Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Wine Tasting Evening"
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Join us for an exclusive wine tasting event..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="time">Time *</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="maxParticipants">Max Participants *</Label>
              <Input
                id="maxParticipants"
                type="number"
                min="1"
                value={formData.maxParticipants}
                onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) || 20 })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingEvent ? 'Update Event' : 'Create Event'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
