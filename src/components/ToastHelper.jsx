import { toast } from "react-hot-toast";

// Success toast
export const showSuccessToast = (message) => {
  return toast.success(message, {
    id: `success-${Date.now()}`,
    duration: 5000,
  });
};

// Error toast
export const showErrorToast = (message) => {
  return toast.error(message, {
    id: `error-${Date.now()}`,
    duration: 7000,
  });
};

// Info toast
export const showInfoToast = (message) => {
  return toast(message, {
    id: `info-${Date.now()}`,
    icon: "🔔",
    duration: 5000,
  });
};

// Warning
export const showWarningToast = (message) => {
  return toast(message, {
    id: `warning-${Date.now()}`,
    icon: "⚠️",
    duration: 6000,
    style: {
      borderLeft: "4px solid #f59e0b",
    },
  });
};

// Loading toast
export const showLoadingToast = (message) => {
  const toastId = toast.loading(message, {
    id: `loading-${Date.now()}`,
  });

  return {
    // Update the loading toast
    updateLoading: (newMessage) => {
      toast.loading(newMessage, { id: toastId });
    },
    // Convert to success
    success: (successMessage) => {
      toast.success(successMessage, { id: toastId });
    },
    // Convert to error
    error: (errorMessage) => {
      toast.error(errorMessage, { id: toastId });
    },
    // Dismiss the toast
    dismiss: () => {
      toast.dismiss(toastId);
    },
  };
};

export const dismissAllToasts = () => {
  toast.dismiss();
};

const ToastHelper = {
  success: showSuccessToast,
  error: showErrorToast,
  info: showInfoToast,
  warning: showWarningToast,
  loading: showLoadingToast,
  dismissAll: dismissAllToasts,
};

export default ToastHelper;
