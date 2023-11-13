// The AIConsole Project
//
// Copyright 2023 10Clouds
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { useEffect, useState } from 'react';
import { sub, isYesterday, isToday, isWithinInterval } from 'date-fns';

import { ChatHeadline } from "@/types/editables/chatTypes";

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
      const itemDate = new Date(item.last_modified);
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
