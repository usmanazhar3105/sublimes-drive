/**
 * AdminEventsPage_Wired - Events Management
 * Uses: useEvents, useAnalytics
 */

import { useEffect } from 'react';
import { Calendar, Users, MapPin, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { useEvents, useAnalytics } from '../../src/hooks';

export function AdminEventsPage_Wired() {
  const { events, loading } = useEvents();
  const analytics = useAnalytics();

  useEffect(() => {
    analytics.trackPageView('/admin/events');
  }, []);

  const stats = {
    totalEvents: events.length,
    upcomingEvents: events.filter(e => new Date(e.date) > new Date()).length,
    pastEvents: events.filter(e => new Date(e.date) <= new Date()).length,
    totalAttendees: events.reduce((sum, e) => sum + (e.attendees_count || 0), 0),
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl text-[#E8EAED]" style={{ fontWeight: 600 }}>Events Management</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { icon: Calendar, label: 'Total Events', value: stats.totalEvents, color: 'text-[#D4AF37]' },
          { icon: Clock, label: 'Upcoming', value: stats.upcomingEvents, color: 'text-blue-500' },
          { icon: MapPin, label: 'Past Events', value: stats.pastEvents, color: 'text-gray-500' },
          { icon: Users, label: 'Total Attendees', value: stats.totalAttendees, color: 'text-green-500' },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx} className="bg-[#0F1829] border-[#1A2332]">
              <CardContent className="p-4">
                <Icon className={`${stat.color} mb-2`} size={24} />
                <p className="text-sm text-[#8B92A7] mb-1">{stat.label}</p>
                <p className="text-2xl text-[#E8EAED]" style={{ fontWeight: 600 }}>{stat.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-[#0F1829] border-[#1A2332]">
        <CardHeader>
          <CardTitle className="text-xl text-[#E8EAED]">All Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {events.slice(0, 10).map((event) => (
              <div key={event.id} className="flex items-center justify-between p-4 bg-[#0B1426] rounded-lg">
                <div>
                  <p className="text-[#E8EAED]" style={{ fontWeight: 600 }}>{event.title}</p>
                  <p className="text-sm text-[#8B92A7]">{event.location} • {event.attendees_count} attendees</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge>{new Date(event.date).toLocaleDateString()}</Badge>
                  <Button size="sm" variant="outline">View</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
