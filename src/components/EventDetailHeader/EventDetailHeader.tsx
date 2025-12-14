// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import useUserSession from "@/hooks/useUserSession";
import { format } from "date-fns";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { api } from "@/utils/api";
import { useRouter } from "next/router";
import StyledCircleLoader from "../StyledCircleLoader/StyledCircleLoader";
import SelectProjectModal from "../SelectProjecModal/SelectProjectModal";
import NewProjectModal from "@/components/NewProjectModal/NewProjectModal";
import QRCodeButton from "./QRCodeButton";
import type { ImportedProject, ImportedProjectTech } from "@/types/ProjectsType";

interface EventDetailHeader {
  eventId?: string;
  date?: Date;
  name?: string;
  description?: string;
  location?: string;
  startTime?: string;
  isUserAttendEvent?: boolean;
}

export default function EventDetailHeader({
  eventId,
  date,
  name,
  description,
  location,
  startTime,
  isUserAttendEvent,
}: EventDetailHeader) {
  const [isNew, setIsNew] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [importedProject, setImportedProject] = useState<ImportedProject | null>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const user = useUserSession();
  const utils = api.useContext();
  const router = useRouter();

  const handleAttendEvent = async () => {
    setLoading(true);
    await attendEvent({
      eventId: eventId || "",
      userId: user?.id || "",
    });
    setLoading(false);
  };

  const { mutateAsync: attendEvent } =
    api.events.attendEvent.useMutation({
      onSuccess: async () => {
        await utils.events.findUnique.invalidate({
          id: eventId,
        });
      },
    });

  const { mutateAsync: leaveEvent } =
    api.events.leaveEvent.useMutation({
      onSuccess: async () => {
        await utils.events.findUnique.invalidate({
          id: eventId,
        });
      },
    });

  const handleLeaveEvent = async () => {
    await leaveEvent({
      eventId: eventId || "",
      userId: user?.id || "",
    });
  };

  return loading ? (
    <StyledCircleLoader />
  ) : (
    <div className="overflow-hidden bg-white py-2 px-4 shadow sm:rounded-lg">
      <SelectProjectModal
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        setIsNew={setIsNew}
        setImportedProject={setImportedProject}
      />
      <NewProjectModal 
        isOpen={isNew} 
        setIsOpen={setIsNew}
        initialData={importedProject ? {
          title: importedProject.name,
          description: importedProject.description,
          techs: importedProject.techs.map((t: ImportedProjectTech) => ({
            id: t.id,
            masterTechId: t.tech.id,
            tech: {
              id: t.tech.id,
              label: t.tech.label,
              imgUrl: t.tech.imgUrl
            }
          }))
        } : undefined}
      />
      <div className="flex flex-row justify-between px-4 py-5 sm:px-6">
        <div>
          <h3 className="text-lg font-medium leading-6 text-gray-700">
            Event Details
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">{name}</p>
        </div>

        <div>
          {!user && (
            <div className="flex space-x-4">
              <QRCodeButton link={window.location.href} />
              <button
                type="button"
                className="inline-flex items-center rounded-md border border-transparent bg-gray-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                onClick={() => void signIn()}
              >
                Attend Event
              </button>
            </div>
          )}
        </div>
        <div>
          {user && (
            <div className="flex space-x-4">
              <QRCodeButton link={window.location.href} />
              <button
                type="button"
                className={`inline-flex items-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 ${
                  !isUserAttendEvent ? "bg-green-600" : "bg-red-400"
                }`}
                onClick={() => {
                  (async () => {
                    if (isUserAttendEvent) {
                      await handleLeaveEvent();
                    } else {
                      await handleAttendEvent();
                    }
                  })().catch((error) => {
                    console.error("Error handling click event:", error);
                  });
                  return;
                }}
              >
                {isUserAttendEvent ? "Leave Event" : "Attend Event"}
              </button>
              <button
                type="button"
                className="inline-flex items-center rounded-md border border-transparent bg-gray-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                onClick={() => setIsOpen(true)}
              >
                Add Project
              </button>
              {user?.role === "ADMIN" && (
                <button
                  type="button"
                  className="inline-flex items-center rounded-md border border-transparent bg-gray-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  onClick={() =>
                    void router.push(`${eventId ?? ""}/user-management`)
                  }
                >
                  Manage Users
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
        <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Date</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {/* eslint-disable-next-line @typescript-eslint/no-unsafe-call */}
              {date ? format(new Date(date), "MMMM dd, yyyy") : null}
            </dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Start Time</dt>
            <dd className="mt-1 text-sm text-gray-900">{startTime}</dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Location</dt>
            <dd className="mt-1 text-sm text-gray-900">{location}</dd>
          </div>

          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-gray-500">Description</dt>
            <dd className="mt-1 text-sm text-gray-900">{description}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
