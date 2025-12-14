/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { superProject } from "@/types/superProejct";
import { api } from "@/utils/api";
import { Dialog, Transition } from "@headlessui/react";
import { Autocomplete, TextField } from "@mui/material";
import { type MasterTech } from "@prisma/client";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/router";
import {
  type Dispatch,
  Fragment,
  type SetStateAction,
  useRef,
  useState,
} from "react";
import { useForm } from "react-hook-form";

interface Props {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  superProject: superProject;
}

export default function NewProjectBasedSuper({
  isOpen,
  setIsOpen,
  superProject,
}: Props) {
  const router = useRouter();
  const utils = api.useContext();
  const { id: eventUuid } = router.query;
  const session = useSession();
  const [selectedTechs, setSelectedTechs] = useState<MasterTech[]>([]);
  const cancelButtonRef = useRef(null);
  const { data, isLoading, isError } = api.techs.getAll.useQuery();

  console.log(superProject);

  const { handleSubmit, register } = useForm();
  const { mutateAsync: createProject } =
    api.projects.createAndAssociateWithSuperProject.useMutation({
      onSuccess: (data) => {
        setIsOpen(false);
        return utils.events.findUnique.invalidate({
          id: data?.eventId,
        });
      },
    });

  interface FormData{
    title: string;
    description: string;
  }
  const onSubmit = (data: FormData) => {
    debugger;
    const userId = session?.data?.user?.id;
    const newProjectObj = {
      name: data.title,
      description: data.description,
      techs: selectedTechs.map((tech: MasterTech) => tech.id),
      authorId: userId || "",
      eventId: eventUuid?.toString() || "",
      superProjectId: superProject.id
    };
    //await createProject(newProjectObj);
    return;
  };

  if (isLoading) return null;
  if (isError) return <div>Error!!</div>;

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
                  <form onSubmit={onSubmit}>
                    <div className="overflow-hidden shadow sm:rounded-md">
                      <div className="bg-white px-4 py-5 sm:p-6">
                        <div className="flex flex-col gap-6">
                          <div className="col-span-6 sm:col-span-3 ">
                            <label
                              htmlFor="title"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Title
                            </label>
                            <input
                              type="text"
                              id="title"
                              {...register("title", {
                                required: true,
                              })}
                              autoComplete="title"
                              className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
                              disabled
                              value={superProject.name}
                            />
                          </div>

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
                              value={superProject.description}
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
