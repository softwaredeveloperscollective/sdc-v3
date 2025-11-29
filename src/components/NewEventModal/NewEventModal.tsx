/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { createEventInput } from "@/server/api/routers/schema/event.schema";
import { api } from "@/utils/api";
import { Dialog, Transition } from "@headlessui/react";
import React, { Fragment, useRef, useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";
import { useForm } from "react-hook-form";
import { formatDateForInput } from "@/helpers/dateFormatters";

interface NewEventModalProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  eventData?: {
    id: string;
    name: string;
    date: Date;
    location: string;
    description: string;
    startTime: string;
    chapterId: string | null;
  };
  mode?: "create" | "edit";
}

// Form type with date as string (for HTML input)
type EventFormInput = Omit<createEventInput, 'date'> & {
  date: string;
};

export default function NewEventModal({
  isOpen,
  setIsOpen,
  eventData,
  mode = "create",
}: NewEventModalProps) {
  const { handleSubmit, register, reset } = useForm<EventFormInput>({
    defaultValues: eventData
      ? {
          name: eventData.name,
          date: formatDateForInput(eventData.date),
          location: eventData.location,
          description: eventData.description,
          startTime: eventData.startTime,
          chapterId: eventData.chapterId,
        }
      : undefined,
  });

  const utils = api.useContext();

  const { data: chapters } = api.chapters.getAll.useQuery();

  const cancelButtonRef = useRef(null);

  const { mutateAsync: createEvent } = api.events.create.useMutation({
    onSuccess: async () => {
      await utils.events.getAll.invalidate();
      setIsOpen(false);
      reset();
    },
  });

  const { mutateAsync: updateEvent } = api.events.update.useMutation({
    onSuccess: async () => {
      await utils.events.getAll.invalidate();
      if (eventData?.id) {
        await utils.events.findUnique.invalidate({ id: eventData.id });
      }
      setIsOpen(false);
      reset();
    },
  });

  useEffect(() => {
    if (eventData && isOpen) {
      reset({
        name: eventData.name,
        date: formatDateForInput(eventData.date),
        location: eventData.location,
        description: eventData.description,
        startTime: eventData.startTime,
        chapterId: eventData.chapterId,
      });
    }
  }, [eventData, isOpen, reset]);

  const onSubmit = async (data: EventFormInput) => {
    if (mode === "edit" && eventData?.id) {
      await updateEvent({
        id: eventData.id,
        name: data.name,
        date: data.date,
        location: data.location,
        description: data.description,
        startTime: data.startTime,
        chapterId: data.chapterId || null,
      });
    } else {
      await createEvent({
        name: data.name,
        date: data.date,
        location: data.location,
        description: data.description,
        startTime: data.startTime,
        chapterId: data.chapterId || null,
      });
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        initialFocus={cancelButtonRef}
        onClose={setIsOpen}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="mt-5 md:col-span-2 md:mt-0">
                  {/* @ts-ignore */}
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="overflow-hidden shadow sm:rounded-md">
                      <div className="bg-white px-4 py-5 sm:p-6">
                        <div className="flex flex-col gap-6">
                          <div className="col-span-6 sm:col-span-3 ">
                            <label
                              htmlFor="name"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Event Name
                            </label>
                            <input
                              type="text"
                              id="name"
                              {...register("name", {
                                required: true,
                              })}
                              autoComplete="name"
                              className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
                            />
                          </div>

                          <div className="col-span-6 sm:col-span-3 ">
                            <label
                              htmlFor="chapterId"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Chapter
                            </label>
                            <select
                              id="chapterId"
                              {...register("chapterId", {})}
                              className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm focus:boder-gray-500 focus:ring-gray-500 sm:text-sm"
                            >
                              <option value="">Select a chapter...</option>
                              {chapters?.map((chapter) => (
                                <option key={chapter.id} value={chapter.id}>
                                  {chapter.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="col-span-6 sm:col-span-3 ">
                            <label
                              htmlFor="location"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Location
                            </label>
                            <input
                              type="text"
                              id="location"
                              {...register("location", {
                                required: true,
                              })}
                              autoComplete="location"
                              className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
                            />
                          </div>

                          <div className="col-span-6">
                            <label
                              htmlFor="description"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Description
                            </label>
                            <textarea
                              {...register("description", {
                                required: true,
                              })}
                              id="description"
                              rows={4}
                              autoComplete="description"
                              className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
                            />
                          </div>

                          <div className="col-span-6">
                            <label
                              htmlFor="date"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Date
                            </label>
                            <input
                              {...register("date", {
                                required: true,
                              })}
                              id="date"
                              type="date"
                              className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
                            />
                          </div>

                          <div className="col-span-6">
                            <label
                              htmlFor="date"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Start Time
                            </label>
                            <input
                              {...register("startTime", {
                                required: true,
                              })}
                              step={1800}
                              id="startTime"
                              type="time"
                              className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
                        <button
                          type="submit"
                          className="inline-flex justify-center rounded-md border border-transparent bg-gray-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                        >
                          {mode === "edit" ? "Update" : "Save"}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
