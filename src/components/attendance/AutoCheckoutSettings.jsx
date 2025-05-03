import { useState, useEffect } from 'react';
import { Switch } from '@headlessui/react';
import { Clock, Info } from 'lucide-react';
import { toast } from 'react-toastify';

import attendanceService from '../../services/attendanceServices';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const AutoCheckoutSettings = ({ onSettingsSaved }) => {
  const [enabled, setEnabled] = useState(false);
  const [checkoutTime, setCheckoutTime] = useState('18:30');
  const [sendNotification, setSendNotification] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load settings when component mounts
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        const settings = await attendanceService.getAutoCheckoutSettings();
        
        if (settings) {
          setEnabled(settings.enabled || false);
          setCheckoutTime(settings.time || '18:30');
          setSendNotification(settings.sendNotification !== false);
        }
      } catch (error) {
        console.error('Error loading auto-checkout settings:', error);
        toast.error('Failed to load auto-checkout settings');
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Save settings
  const saveSettings = async () => {
    try {
      setSaving(true);
      
      const settings = {
        enabled,
        time: checkoutTime,
        sendNotification
      };

      await attendanceService.configureAutoCheckout(settings);
      
      if (onSettingsSaved) {
        onSettingsSaved(settings);
      }
      
      toast.success('Auto-checkout settings saved successfully');
    } catch (error) {
      console.error('Error saving auto-checkout settings:', error);
      toast.error('Failed to save auto-checkout settings');
    } finally {
      setSaving(false);
    }
  };

  // Run auto checkout manually
  const runManualCheckout = async () => {
    try {
      setSaving(true);
      const result = await attendanceService.runAutoCheckout();
      toast.success(`Auto-checkout completed: ${result.processed} students processed`);
    } catch (error) {
      console.error('Error running auto-checkout:', error);
      toast.error('Failed to run auto-checkout');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 shadow rounded-lg p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
          <Clock className="h-5 w-5 mr-2 text-blue-500" />
          Auto Checkout Settings
        </h3>
        
        <div className="flex items-center">
          {saving ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mr-2"></div>
          ) : null}
          
          <button 
            onClick={saveSettings}
            disabled={saving || loading}
            className={`px-3 py-1 text-sm rounded-md shadow-sm text-white ${
              saving || loading 
                ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800'
            }`}
          >
            Save Settings
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="py-4 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <div className="mb-4 flex items-center justify-between bg-gray-50 dark:bg-slate-700/30 p-3 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Enable Auto Checkout
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Automatically check out students who haven't left at the specified time
              </p>
            </div>
            <Switch
              checked={enabled}
              onChange={setEnabled}
              className={classNames(
                enabled ? 'bg-blue-600 dark:bg-blue-700' : 'bg-gray-200 dark:bg-gray-600',
                'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-800'
              )}
            >
              <span className="sr-only">Enable Auto Checkout</span>
              <span
                className={classNames(
                  enabled ? 'translate-x-5' : 'translate-x-0',
                  'pointer-events-none relative inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200'
                )}
              >
                <span
                  className={classNames(
                    enabled ? 'opacity-0 ease-out duration-100' : 'opacity-100 ease-in duration-200',
                    'absolute inset-0 h-full w-full flex items-center justify-center transition-opacity'
                  )}
                  aria-hidden="true"
                >
                  <svg className="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 12 12">
                    <path
                      d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span
                  className={classNames(
                    enabled ? 'opacity-100 ease-in duration-200' : 'opacity-0 ease-out duration-100',
                    'absolute inset-0 h-full w-full flex items-center justify-center transition-opacity'
                  )}
                  aria-hidden="true"
                >
                  <svg className="h-3 w-3 text-blue-600" fill="currentColor" viewBox="0 0 12 12">
                    <path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" />
                  </svg>
                </span>
              </span>
            </Switch>
          </div>
          
          <div className="mb-4">
            <label htmlFor="checkoutTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Checkout Time
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                type="time"
                name="checkoutTime"
                id="checkoutTime"
                className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-slate-700 dark:text-white"
                value={checkoutTime}
                onChange={(e) => setCheckoutTime(e.target.value)}
                disabled={!enabled}
              />
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Set the time when students should be automatically checked out if they haven't already left
            </p>
          </div>
          
          <div className="mb-4">
            <div className="flex items-center">
              <input
                id="sendNotification"
                name="sendNotification"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded dark:bg-slate-700"
                checked={sendNotification}
                onChange={(e) => setSendNotification(e.target.checked)}
                disabled={!enabled}
              />
              <label htmlFor="sendNotification" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Send WhatsApp notification to parents
              </label>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 pl-6">
              Parents will receive a notification when their child is automatically checked out
            </p>
          </div>
          
          <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/30 p-3 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <Info className="h-5 w-5 text-yellow-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700 dark:text-yellow-400">
                  <strong>Run Auto Checkout Manually:</strong> You can manually trigger the auto-checkout process for testing purposes.
                </p>
                <div className="mt-2">
                  <button
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-700 dark:hover:bg-yellow-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 dark:focus:ring-offset-slate-800"
                    onClick={runManualCheckout}
                    disabled={saving}
                  >
                    Run Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AutoCheckoutSettings; 