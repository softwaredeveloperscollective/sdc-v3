// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import Link from "next/link";
import React from "react";
import { formatDateForDisplay } from "@/helpers/dateFormatters";

interface Event {
  id?: string | number;
  date?: string;
  startTime?: string;
  name?: string;
  description?: string;
}

interface EventProps {
  event?: Event;
}

export default function EventCard({ event }: EventProps) {
  return (
    event?.id && (
    <Link href={`/events/${String(event.id)}`} key={String(event.id)}>
      <div className="min-w-[200px] rounded-lg border-[1.0px] border-gray-300 p-4">
        <p className="text-sm text-gray-500">
          {formatDateForDisplay(event.date)} - {event.startTime}
        </p>
        <div className="mt-2 block">
          <p className="text-xl font-semibold text-gray-900">{event.name}</p>
          <p className="mt-3 text-base text-gray-500">
            {event.description.length <= 150
              ? event.description
              : event.description.substring(0, 150) + "[...]"}
          </p>
        </div>
        <div className="mt-3">
          <div className="text-base font-semibold text-gray-600 hover:text-gray-500">
            Check event details →
          </div>
        </div>
      </div>
    </Link>
    ) || <div>No events found</div> );
}
