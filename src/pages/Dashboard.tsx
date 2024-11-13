import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { evolutionApi } from '../services/api';
import { Instance } from '../types/instance';
import { Group } from '../types/group';
import { ScheduledMessage } from '../types/schedule';
import { toast } from 'react-toastify';
import {
  Users,
  MessageSquare,
  Calendar,
  Smartphone,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [instances, setInstances] = useState<Instance[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [schedules, setSchedules] = useState<ScheduledMessage[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [instancesRes, schedulesRes] = await Promise.all([
        evolutionApi.getInstances(),
        evolutionApi.getSchedules(),
      ]);

      const connectedInstances = instancesRes.data;
      setInstances(connectedInstances);

      // Fetch groups for connected instances
      const groupsPromises = connectedInstances
        .filter((instance: Instance) => instance.status === 'connected')
        .map((instance: Instance) => evolutionApi.getGroups(instance.instanceName));

      const groupsResponses = await Promise.all(groupsPromises);
      const allGroups = groupsResponses.flatMap((res) => res.data);
      setGroups(allGroups);

      setSchedules(schedulesRes.data);
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Instances Overview */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Smartphone className="w-6 h-6 text-green-600 mr-2" />
              <h2 className="text-lg font-semibold">Instances</h2>
            </div>
            <span className="text-2xl font-bold text-gray-900">{instances.length}</span>
          </div>
          <div className="space-y-3">
            {instances.slice(0, 3).map((instance) => (
              <div
                key={instance.instanceName}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <span className="font-medium">{instance.instanceName}</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    instance.status === 'connected'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {instance.status}
                </span>
              </div>
            ))}
          </div>
          <Link
            to="/instances"
            className="flex items-center justify-center mt-4 text-green-600 hover:text-green-700"
          >
            View All Instances
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        {/* Groups Overview */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Users className="w-6 h-6 text-blue-600 mr-2" />
              <h2 className="text-lg font-semibold">Groups</h2>
            </div>
            <span className="text-2xl font-bold text-gray-900">{groups.length}</span>
          </div>
          <div className="space-y-3">
            {groups.slice(0, 3).map((group) => (
              <div
                key={group.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <span className="font-medium truncate flex-1 mr-2">{group.name}</span>
                <span className="text-sm text-gray-500">{group.memberCount} members</span>
              </div>
            ))}
          </div>
          <Link
            to="/groups"
            className="flex items-center justify-center mt-4 text-blue-600 hover:text-blue-700"
          >
            View All Groups
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        {/* Scheduled Messages Overview */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Calendar className="w-6 h-6 text-purple-600 mr-2" />
              <h2 className="text-lg font-semibold">Scheduled Messages</h2>
            </div>
            <span className="text-2xl font-bold text-gray-900">{schedules.length}</span>
          </div>
          <div className="space-y-3">
            {schedules.slice(0, 3).map((schedule) => (
              <div
                key={schedule.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-1 mr-2">
                  <p className="font-medium truncate">{schedule.chatName}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(schedule.scheduledTime).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    schedule.status === 'sent'
                      ? 'bg-green-100 text-green-800'
                      : schedule.status === 'failed'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {schedule.status}
                </span>
              </div>
            ))}
          </div>
          <Link
            to="/schedule"
            className="flex items-center justify-center mt-4 text-purple-600 hover:text-purple-700"
          >
            View All Schedules
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {schedules.slice(0, 5).map((schedule) => (
            <div
              key={schedule.id}
              className="flex items-center justify-between border-b pb-4 last:border-0"
            >
              <div className="flex items-center">
                <MessageSquare className="w-5 h-5 text-gray-500 mr-3" />
                <div>
                  <p className="font-medium">{schedule.chatName}</p>
                  <p className="text-sm text-gray-500">
                    Scheduled for {new Date(schedule.scheduledTime).toLocaleString()}
                  </p>
                </div>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs ${
                  schedule.status === 'sent'
                    ? 'bg-green-100 text-green-800'
                    : schedule.status === 'failed'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {schedule.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;