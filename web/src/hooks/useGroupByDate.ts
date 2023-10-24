import { useEffect, useState } from 'react';
import { sub, isYesterday, isToday, isWithinInterval } from 'date-fns';

import { ChatHeadline } from '@/types/types';

type Groups = {
  today: ChatHeadline[];
  yesterday: ChatHeadline[];
  previous7Days: ChatHeadline[];
  older: ChatHeadline[];
};

const useGroupByDate = (data: ChatHeadline[]) => {
  const [groupedData, setGroupedData] = useState<Groups>({
    today: [],
    yesterday: [],
    previous7Days: [],
    older: [],
  });

  useEffect(() => {
    const groups: Groups = {
      today: [],
      yesterday: [],
      previous7Days: [],
      older: [],
    };

    data.forEach((item) => {
      const itemDate = new Date(item.timestamp);
      const isToDay = isToday(itemDate);
      const isYesterDay = isYesterday(itemDate);
      const isWithinAWeek = isWithinInterval(itemDate, {
        start: sub(itemDate, { days: 7 }),
        end: itemDate,
      });

      if (isToDay) {
        groups.today.push(item);
      } else if (isYesterDay) {
        groups.yesterday.push(item);
      } else if (isWithinAWeek) {
        groups.previous7Days.push(item);
      } else {
        groups.older.push(item);
      }
    });

    setGroupedData(groups);
  }, [data]);

  return groupedData;
};

export default useGroupByDate;
