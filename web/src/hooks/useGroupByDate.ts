import moment from 'moment';
import { useEffect, useState } from 'react';

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
    const date = new Date().toISOString();
    const refDate = moment(date);
    const today = refDate.clone().startOf('day');
    const yesterday = refDate.clone().subtract(1, 'days').startOf('days');
    const weekOld = refDate.clone().subtract(7, 'days').startOf('days');

    const groups: Groups = {
      today: [],
      yesterday: [],
      previous7Days: [],
      older: [],
    };

    data.forEach((item) => {
      const itemDate = moment(new Date(item.timestamp));
      const isToday = itemDate.isSame(today, 'd');
      const isYesterday = itemDate.isSame(yesterday, 'd');
      const isWithinAWeek = itemDate.isSameOrAfter(weekOld, 'd');

      if (isToday) {
        groups.today.push(item);
      } else if (isYesterday) {
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
