/**
 * Modal for displaying a diary entry
 */

import { useDiaryEntry } from '@/hooks/useDiaryEntry';
import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';

interface DiaryEntryModalProps {
  tokenId: number;
  date: string;
  authToken: string;
  characterName: string;
  onClose: () => void;
}

export function DiaryEntryModal({
  tokenId,
  date,
  authToken,
  characterName,
  onClose,
}: DiaryEntryModalProps) {
  const { entry, isLoading, error } = useDiaryEntry(tokenId, date, authToken);
  const [mounted, setMounted] = useState(false);

  // Ensure component only renders on client side
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Format date for display
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  if (!mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-lg shadow-2xl max-h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="text-xl font-bold">{characterName}&apos;s Diary</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{formattedDate}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg">
              {error}
            </div>
          ) : entry ? (
            <div>
              {/* Message Count Badge */}
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full text-sm font-medium">
                  {entry.messageCount} {entry.messageCount === 1 ? 'message' : 'messages'}
                </span>
              </div>

              {/* Diary Entry Text */}
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {entry.entry}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No diary entry found
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-medium rounded-lg
                     hover:from-pink-600 hover:to-purple-600 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
