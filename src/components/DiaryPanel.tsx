/**
 * Panel for displaying list of diary entries
 */

import { useState } from 'react';
import { useDiaryList } from '@/hooks/useDiaryList';
import { DiaryEntryModal } from './DiaryEntryModal';

interface DiaryPanelProps {
  tokenId: number;
  authToken: string | null;
  characterName: string;
  enabled: boolean;
}

export function DiaryPanel({
  tokenId,
  authToken,
  characterName,
  enabled,
}: DiaryPanelProps) {
  const { diaries, isLoading, error } = useDiaryList(tokenId, authToken, enabled);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <>
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-sm mb-2 text-indigo-500">Diary</h3>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-4">
            <div className="inline-block w-4 h-4 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">Loading diaries...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-2 rounded text-xs">
            {error}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && diaries.length === 0 && (
          <div className="text-center py-4">
            <div className="text-2xl mb-2">📔</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              No diary entries yet
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Entries are created daily
            </p>
          </div>
        )}

        {/* Diary List */}
        {!isLoading && !error && diaries.length > 0 && (
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {diaries.map((diary) => (
              <button
                key={diary.date}
                onClick={() => setSelectedDate(diary.date)}
                className="w-full px-3 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-left rounded-lg
                         hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-indigo-700 dark:text-indigo-300">
                    {formatDate(diary.date)}
                  </span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {diary.messageCount} {diary.messageCount === 1 ? 'msg' : 'msgs'}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Diary Entry Modal */}
      {selectedDate && authToken && (
        <DiaryEntryModal
          tokenId={tokenId}
          date={selectedDate}
          authToken={authToken}
          characterName={characterName}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </>
  );
}
