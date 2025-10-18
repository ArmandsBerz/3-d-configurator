import React, { useEffect, useState } from 'react';

interface SnackbarProps {
  /** The message to display inside the snackbar. */
  message: string;
  /** Callback function to execute when the snackbar should be closed and unmounted. */
  onClose: () => void;
}

/**
 * A component that displays a short message at the top-center of the screen
 * and automatically dismisses itself.
 */
export const Snackbar = ({ message, onClose }: SnackbarProps) => {
  const [isVisible, setIsVisible] = useState(false);

  // Effect for handling the "animate in"
  useEffect(() => {
    // We use a tiny timeout to allow React to render the component
    // in its "hidden" state first, then update it to "visible"
    // to trigger the CSS transition.
    const animateInTimer = setTimeout(() => {
      setIsVisible(true);
    }, 10); // 10ms delay is enough

    return () => clearTimeout(animateInTimer);
  }, []); // Runs only once when the component mounts

  // Effect for handling the "auto-close" and "animate out"
  useEffect(() => {
    // Timer to start fade-out animation
    const visibilityTimer = setTimeout(() => {
      setIsVisible(false);
    }, 3000); // 3-second visible duration

    // Timer to call onClose *after* animation finishes (3000ms visibility + 300ms animation)
    const unmountTimer = setTimeout(() => {
      onClose();
    }, 3300);

    // Cleanup: clear both timers if the component unmounts early
    return () => {
      clearTimeout(visibilityTimer);
      clearTimeout(unmountTimer);
    };
  }, [onClose]);

  return (
    <div
      className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 w-auto max-w-[90%] p-4 bg-[#333333] text-white text-base font-medium shadow-lg transition-all duration-300 ease-in-out ${
        isVisible
          ? 'opacity-100 translate-y-0'    // Visible state: slide down and fade in
          : 'opacity-0 -translate-y-10'   // Hidden state: slide up and fade out
      }`}
      role="status" // Announces the message to screen readers
      aria-live="polite"
    >
      {message}
    </div>
  );
};