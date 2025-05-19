import React from "react";
import Calendar from "@toast-ui/calendar";

const CalendarPage = () => {
  const calendar = new Calendar("#calendar", {
    defaultView: "week",
    template: {
      time(event) {
        const { start, end, title } = event;

        return `<span style="color: white;">${formatTime(start)}~${formatTime(
          end
        )} ${title}</span>`;
      },
      allday(event) {
        return `<span style="color: gray;">${event.title}</span>`;
      },
    },
    calendars: [
      {
        id: "cal1",
        name: "Personal",
        backgroundColor: "#03bd9e",
      },
      {
        id: "cal2",
        name: "Work",
        backgroundColor: "#00a9ff",
      },
    ],
  });

  return <div id="calendar" style="height: 800px"></div>;
};

export default CalendarPage;
