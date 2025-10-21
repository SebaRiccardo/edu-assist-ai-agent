'use client';

import * as React from 'react';
import { type DateRange } from 'react-day-picker';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

interface DateRangePickerProps {
  dateRange?: DateRange;
  onDateRangeChange?: (dateRange: DateRange | undefined) => void;
  disabled?: boolean;
  className?: string;
}

export function DateRangePicker({ dateRange, onDateRangeChange, disabled = false, className }: DateRangePickerProps) {
  return (
    <div className={cn('flex min-w-0 flex-col', className)}>
      {/* {dateRange?.from && dateRange?.to && (
        <div className="mb-4 rounded-md bg-muted/50 p-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary" />
            <span className="font-medium text-foreground">Course Schedule</span>
          </div>
          <p className="mt-2 text-muted-foreground">
            Your course runs from <span className="font-semibold text-foreground">{dateRange.from.toLocaleDateString()}</span> to{' '}
            <span className="font-semibold text-foreground">{dateRange.to.toLocaleDateString()}</span>
          </p>
        </div>
      )} */}
      <Calendar
        mode="range"
        selected={dateRange}
        onSelect={onDateRangeChange}
        numberOfMonths={2}
        disabled={disabled}
        className="rounded-lg border shadow-sm"
      />
      {dateRange?.from && dateRange?.to && (
        <div className="text-muted-foreground text-center text-xs mt-2">
          {dateRange.from.toLocaleDateString()} - {dateRange.to.toLocaleDateString()}
        </div>
      )}
    </div>
  );
}
