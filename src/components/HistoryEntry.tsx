import { format } from 'date-fns';
import { clsx } from 'clsx';

type HistoryItem = {
  id: number;
  expression: string;
  result: string;
  timestamp: string;
};

type HistoryEntryProps = {
  item: HistoryItem;
  onUse: (expression: string) => void;
};

export function HistoryEntry({ item, onUse }: HistoryEntryProps) {
  return (
    <div 
      className={clsx(
        "p-4 rounded-xl border border-gray-200 hover:border-primary-300",
        "bg-gray-50 hover:bg-primary-50 transition-all duration-200 cursor-pointer",
        "group"
      )}
      onClick={() => onUse(item.expression)}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="font-mono text-sm text-gray-600 truncate flex-1 mr-2">
          {item.expression}
        </div>
        <div className="text-xs text-gray-500 whitespace-nowrap">
          {format(new Date(item.timestamp), 'MMM d, HH:mm')}
        </div>
      </div>
      <div className="font-mono text-lg font-semibold text-primary-600 truncate">
        = {item.result}
      </div>
      <div className="text-xs text-gray-400 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
        Click to reuse this expression
      </div>
    </div>
  );
}
