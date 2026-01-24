/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { api } from "@/utils/api";
import { Dialog, Transition } from "@headlessui/react";
import { Autocomplete, TextField } from "@mui/material";
import type { TechOutput } from "@/server/api/routers/schema/tech.schema";
import Image from "next/image";
import { Fragment, useRef, type Dispatch, type SetStateAction } from "react";

interface UserTechsModalProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  data: TechOutput[] | undefined;
  ogTechs: { tech: { label: string }; id: string }[] | undefined;
  selectedTechs: TechOutput[];
  setSelectedTechs: Dispatch<SetStateAction<TechOutput[]>>;
  userId: string | undefined;
}

export default function UserTechsModal({
  isOpen,
  setIsOpen,
  data,
  selectedTechs,
  setSelectedTechs,
  userId,
  ogTechs,
}: UserTechsModalProps) {
  const cancelButtonRef = useRef(null);
  const utils = api.useContext();
  const { mutateAsync: updateUser, isLoading } = api.users.update.useMutation({
    onSuccess: async () => {
      await utils.users.getById.invalidate({
        id: userId,
      });
    },
  });

  const handleTechEdit = async () => {
    if (!userId || !ogTechs) return;
    await updateUser({
      id: userId,
      techs: selectedTechs.map((tech: TechOutput) => tech.id),
      ogTechs: ogTechs.map((tech) => tech.id),
    });
    setIsOpen(false);
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

                  <div className="overflow-hidden shadow sm:rounded-md">
                    <div className="bg-white px-4 py-5 sm:p-6">
                      <div className="flex flex-col gap-6">
                        <div className="col-span-6 sm:col-span-3">
                          <Autocomplete
                            multiple
                            id="tags-outlined"
                            onChange={(_, value) => {
                              return setSelectedTechs([...value]);
                            }}
                            options={data ?? []}
                            renderOption={(params, option) => (
                              <span
                                {...params}
                                className="flex cursor-pointer flex-row gap-4 p-4 hover:bg-gray-100"
                              >
                                <Image
                                  height={20}
                                  width={25}
                                  src={option.imgUrl}
                                  alt=""
                                />
                                <div>{option.label}</div>
                              </span>
                            )}
                            filterSelectedOptions
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Tech for this project"
                                placeholder="html"
                              />
                            )}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
                      <button
                        onClick={handleTechEdit}
                        disabled={isLoading}
                        className="inline-flex justify-center rounded-md border border-transparent bg-gray-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
