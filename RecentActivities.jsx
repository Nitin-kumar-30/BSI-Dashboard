import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, Phone, Mail, Calendar, FileText, CheckCircle } from "lucide-react";
import { format } from 'date-fns';

const activityIcons = {
  'Call': Phone,
  'Email': Mail,
  'Meeting': Calendar,
  'Note': FileText,
  'Task': CheckCircle,
  'Follow-up': Activity
};

const statusColors = {
  'Completed': 'bg-green-100 text-green-800',
  'Pending': 'bg-yellow-100 text-yellow-800',
  'Scheduled': 'bg-blue-100 text-blue-800',
  'Cancelled': 'bg-red-100 text-red-800'
};

export default function RecentActivities({ activities, isLoading }) {
  if (isLoading) {
    return (
      <Card className="glass-card glow-effect">
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-1" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card glow-effect">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-500" />
          Recent Activities
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const IconComponent = activityIcons[activity.type] || Activity;
            return (
              <div key={activity.id} className="flex items-center gap-3 p-3 bg-white/50 rounded-lg border border-slate-200">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <IconComponent className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-slate-900">{activity.title}</h4>
                  <p className="text-sm text-slate-500">
                    {activity.created_date ? format(new Date(activity.created_date), 'MMM d, h:mm a') : 'Recently'}
                  </p>
                </div>
                <Badge variant="secondary" className={statusColors[activity.status] || 'bg-gray-100 text-gray-800'}>
                  {activity.status}
                </Badge>
              </div>
            );
          })}
          {activities.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              <Activity className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>No recent activities</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}