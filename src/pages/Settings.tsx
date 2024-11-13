import React, { useState, useEffect } from 'react';
import { evolutionApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { 
  Settings as SettingsIcon, 
  User, 
  Key, 
  Globe, 
  Bell,
  Save,
  RefreshCw
} from 'lucide-react';

interface WebhookSettings {
  url: string;
  enabled: boolean;
  events: string[];
}

interface UserSettings {
  notifications: {
    email: boolean;
    desktop: boolean;
    messageReceived: boolean;
    groupUpdates: boolean;
  };
  webhooks: WebhookSettings;
  apiKey: string;
}

function Settings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<UserSettings>({
    notifications: {
      email: true,
      desktop: true,
      messageReceived: true,
      groupUpdates: true,
    },
    webhooks: {
      url: '',
      enabled: false,
      events: ['message', 'group.update', 'status.update'],
    },
    apiKey: '',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await evolutionApi.getSettings();
      // setSettings(response.data);
      
      // Mock data for demonstration
      setTimeout(() => {
        setSettings({
          notifications: {
            email: true,
            desktop: true,
            messageReceived: true,
            groupUpdates: true,
          },
          webhooks: {
            url: 'https://api.example.com/webhook',
            enabled: true,
            events: ['message', 'group.update', 'status.update'],
          },
          apiKey: 'sk_test_123456789',
        });
        setLoading(false);
      }, 1000);
    } catch (error) {
      toast.error('Failed to fetch settings');
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // TODO: Replace with actual API call
      // await evolutionApi.updateSettings(settings);
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleWebhookChange = (field: keyof WebhookSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      webhooks: {
        ...prev.webhooks,
        [field]: value,
      },
    }));
  };

  const handleNotificationChange = (field: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [field]: value,
      },
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          {saving ? (
            <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
          ) : (
            <Save className="w-5 h-5 mr-2" />
          )}
          Save Changes
        </button>
      </div>

      <div className="space-y-6">
        {/* Profile Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <User className="w-6 h-6 text-gray-600 mr-2" />
            <h2 className="text-lg font-semibold">Profile Information</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                value={user?.name}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={user?.email}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              />
            </div>
          </div>
        </div>

        {/* API Key Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <Key className="w-6 h-6 text-gray-600 mr-2" />
            <h2 className="text-lg font-semibold">API Key</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your API Key
              </label>
              <div className="flex">
                <input
                  type="password"
                  value={settings.apiKey}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md bg-gray-50"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(settings.apiKey);
                    toast.success('API key copied to clipboard');
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-600 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-200"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Webhook Settings */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <Globe className="w-6 h-6 text-gray-600 mr-2" />
            <h2 className="text-lg font-semibold">Webhook Settings</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="webhook-enabled"
                checked={settings.webhooks.enabled}
                onChange={(e) => handleWebhookChange('enabled', e.target.checked)}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label
                htmlFor="webhook-enabled"
                className="ml-2 block text-sm text-gray-900"
              >
                Enable Webhooks
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Webhook URL
              </label>
              <input
                type="url"
                value={settings.webhooks.url}
                onChange={(e) => handleWebhookChange('url', e.target.value)}
                disabled={!settings.webhooks.enabled}
                className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-50"
                placeholder="https://your-domain.com/webhook"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Events to Send
              </label>
              <div className="space-y-2">
                {['message', 'group.update', 'status.update'].map((event) => (
                  <div key={event} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`event-${event}`}
                      checked={settings.webhooks.events.includes(event)}
                      onChange={(e) => {
                        const events = e.target.checked
                          ? [...settings.webhooks.events, event]
                          : settings.webhooks.events.filter((e) => e !== event);
                        handleWebhookChange('events', events);
                      }}
                      disabled={!settings.webhooks.enabled}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor={`event-${event}`}
                      className="ml-2 block text-sm text-gray-900"
                    >
                      {event}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <Bell className="w-6 h-6 text-gray-600 mr-2" />
            <h2 className="text-lg font-semibold">Notification Settings</h2>
          </div>
          <div className="space-y-4">
            {Object.entries(settings.notifications).map(([key, value]) => (
              <div key={key} className="flex items-center">
                <input
                  type="checkbox"
                  id={`notification-${key}`}
                  checked={value}
                  onChange={(e) => handleNotificationChange(key, e.target.checked)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label
                  htmlFor={`notification-${key}`}
                  className="ml-2 block text-sm text-gray-900"
                >
                  {key.split(/(?=[A-Z])/).join(' ')}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;