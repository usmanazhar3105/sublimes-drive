import { Calendar, Users, MapPin, Clock } from 'lucide-react';

export function AdminEventsPage() {
  return (
    <div className="p-6 bg-[var(--sublimes-dark-bg)]">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--sublimes-light-text)] mb-2">Events & Routes Management</h1>
        <p className="text-gray-400">Manage community events, meetups, and route planning</p>
      </div>

      <div className="text-center py-12">
        <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-[var(--sublimes-light-text)] mb-2">Events Management</h3>
        <p className="text-gray-400">Event management system coming soon</p>
      </div>
    </div>
  );
}