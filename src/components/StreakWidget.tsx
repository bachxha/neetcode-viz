import { useState, useEffect } from 'react';
import { PrepStreak } from './PrepStreak';
import { StreakRecovery } from './StreakRecovery';

interface AirtableRecord {
  id: string;
  fields: {
    Date: string;
    Title?: string;
    Category?: string;
    Difficulty?: string;
    Duration?: number;
    Completion?: string;
  };
}

const AIRTABLE_CONFIG = {
  baseId: import.meta.env.VITE_AIRTABLE_BASE_ID || '',
  tableId: import.meta.env.VITE_AIRTABLE_TABLE_ID || '',
  apiToken: import.meta.env.VITE_AIRTABLE_TOKEN || ''
};

interface StreakWidgetProps {
  onSelectProblem?: (problemId: string) => void;
}

export function StreakWidget({ onSelectProblem }: StreakWidgetProps) {
  const [daysSinceLastPractice, setDaysSinceLastPractice] = useState<number>(0);

  useEffect(() => {
    calculateDaysSinceLastPractice();
  }, []);

  const calculateDaysSinceLastPractice = async () => {
    try {

      // Check if environment variables are configured
      if (!AIRTABLE_CONFIG.baseId || !AIRTABLE_CONFIG.tableId || !AIRTABLE_CONFIG.apiToken) {
        // If no config, assume recovery mode for demo purposes
        setDaysSinceLastPractice(8);
        return;
      }

      const response = await fetch(
        `https://api.airtable.com/v0/${AIRTABLE_CONFIG.baseId}/${AIRTABLE_CONFIG.tableId}?sort[0][field]=Date&sort[0][direction]=desc&pageSize=10`,
        {
          headers: {
            'Authorization': `Bearer ${AIRTABLE_CONFIG.apiToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        // If API fails, show recovery mode
        setDaysSinceLastPractice(8);
        return;
      }

      const data = await response.json();
      const records: AirtableRecord[] = data.records || [];
      
      if (records.length === 0) {
        setDaysSinceLastPractice(30);
        return;
      }

      // Parse and get the most recent practice date
      const validRecords = records
        .filter(record => record.fields.Date)
        .map(record => ({
          ...record,
          parsedDate: new Date(record.fields.Date)
        }))
        .sort((a, b) => b.parsedDate.getTime() - a.parsedDate.getTime());

      if (validRecords.length === 0) {
        setDaysSinceLastPractice(30);
        return;
      }

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const lastPracticeDate = validRecords[0].parsedDate;
      const lastPracticeDay = new Date(
        lastPracticeDate.getFullYear(),
        lastPracticeDate.getMonth(),
        lastPracticeDate.getDate()
      );

      // Calculate days since last practice
      const daysSinceLastPractice = Math.floor(
        (today.getTime() - lastPracticeDay.getTime()) / (24 * 60 * 60 * 1000)
      );

      setDaysSinceLastPractice(daysSinceLastPractice);
    } catch (error) {
      console.error('Error calculating days since last practice:', error);
      // On error, default to showing recovery mode
      setDaysSinceLastPractice(8);
    }
  };

  // Show recovery mode if it's been more than 7 days since last practice
  if (daysSinceLastPractice > 7) {
    return <StreakRecovery onSelectProblem={onSelectProblem} />;
  }

  // Otherwise show the normal streak widget
  return <PrepStreak onSelectProblem={onSelectProblem} />;
}