/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createEventInput } from "@/server/api/routers/Event/event.schema";
import { api } from "@/utils/api";
import { Dialog, Transition } from "@headlessui/react";
import React, { Dispatch, Fragment, SetStateAction, useRef } from "react";
import { useForm } from "react-hook-form";

interface NewEventModalProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}

export default function NewEventModal({
  isOpen,
  setIsOpen,
}: NewEventModalProps) {
  const { handleSubmit, register } = useForm();
  const utils = api.useContext();

  const cancelButtonRef = useRef(null);
  const { mutateAsync: createEvent } = api.events.create.useMutation({
    onSuccess: async () => {
      await utils.events.getAll.invalidate();
      setIsOpen(false);
    },
  });

  const onSubmit = async (data: createEventInput) => {
    await createEvent({
      ...data,
      date: new Date(data.date),
    });
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
              <Dialog.Panel className="relative w-full max-w-lg transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:p-6">
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
                          Save
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
