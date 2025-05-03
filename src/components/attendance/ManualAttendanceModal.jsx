import { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { 
  Check, 
  LogOut, 
  UserCircle,
  Calendar,
  XCircle
} from 'lucide-react';

/**
 * @param {Object} props
 * @param {boolean} props.isOpen 
 * @param {Function} props.onClose 
 * @param {Function} props.onConfirm 
 * @param {Object} props.student 
 * @param {string} props.actionType
 */
const ManualAttendanceModal = ({ isOpen, onClose, onConfirm, student, actionType = 'enter' }) => {
  const [note, setNote] = useState('');
  const [sendNotification, setSendNotification] = useState(true);
  const [loading, setLoading] = useState(false);
  
  if (!student) return null;
  

  const getActionContent = () => {
    switch (actionType) {
      case 'enter':
        return {
          title: 'Check In Student',
          description: 'Manually check in this student for today.',
          icon: <Check className="h-5 w-5 text-green-500" />,
          confirmText: 'Check In',
          color: 'green'
        };
      case 'leave':
        return {
          title: 'Check Out Student',
          description: 'Manually check out this student for today.',
          icon: <LogOut className="h-5 w-5 text-blue-500" />,
          confirmText: 'Check Out',
          color: 'blue'
        };
      case 'absent':
        return {
          title: 'Mark Student Absent',
          description: 'Manually mark this student as absent for today.',
          icon: <XCircle className="h-5 w-5 text-red-500" />,
          confirmText: 'Mark Absent',
          color: 'red'
        };
      case 'present':
        return {
          title: 'Mark Student Present',
          description: 'Manually mark this student as present for today.',
          icon: <Check className="h-5 w-5 text-green-500" />,
          confirmText: 'Mark Present',
          color: 'green'
        };
      default:
        return {
          title: 'Update Attendance',
          description: 'Update this student\'s attendance record.',
          icon: <Calendar className="h-5 w-5 text-blue-500" />,
          confirmText: 'Update',
          color: 'blue'
        };
    }
  };
  
  const handleConfirm = async () => {
    if (!student) return;
    
    setLoading(true);
    try {
      await onConfirm({
        studentId: student._id,
        action: actionType,
        note,
        sendNotification
      });
      onClose();
    } catch (error) {
      console.error('Error updating attendance:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const actionContent = getActionContent();
  
  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white dark:bg-slate-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                <div className="bg-white dark:bg-slate-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className={`mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-${actionContent.color}-100 dark:bg-${actionContent.color}-900/30 sm:mx-0 sm:h-10 sm:w-10`}>
                      {actionContent.icon}
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                        {actionContent.title}
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {actionContent.description}
                        </p>
                      </div>

                      <div className="mt-4 bg-gray-50 dark:bg-slate-700/30 p-3 rounded-lg">
                        <div className="flex items-center">
                          <UserCircle className="h-6 w-6 text-gray-400 mr-2" />
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {student.firstName} {student.lastName}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {student.studentId || 'No ID'} • {student.classRoom || 'No Class'}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center">
                          <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Marking attendance for today: {new Date().toLocaleDateString()}
                          </p>
                        </div>

                        <div className="mt-2">
                          <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Note (optional)
                          </p>
                          <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-700 dark:text-white text-sm"
                            placeholder="Add a note about this attendance update..."
                            rows="2"
                          />
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="flex items-center">
                          <input
                            id="sendNotification"
                            name="sendNotification"
                            type="checkbox"
                            checked={sendNotification}
                            onChange={(e) => setSendNotification(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-slate-700"
                          />
                          <label htmlFor="sendNotification" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                            Send WhatsApp notification to parent
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-slate-700/30 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    type="button"
                    className={`inline-flex w-full justify-center rounded-md border border-transparent bg-${actionContent.color}-600 dark:bg-${actionContent.color}-700 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-${actionContent.color}-700 dark:hover:bg-${actionContent.color}-800 focus:outline-none focus:ring-2 focus:ring-${actionContent.color}-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    onClick={handleConfirm}
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                        </svg>
                        Processing...
                      </span>
                    ) : actionContent.confirmText}
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 px-4 py-2 text-base font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ManualAttendanceModal; 