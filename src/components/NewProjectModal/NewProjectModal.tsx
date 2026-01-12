/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from "@/utils/api";
import { Dialog, Transition } from "@headlessui/react";
import { Autocomplete, TextField } from "@mui/material";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/router";
import {
  type Dispatch,
  Fragment,
  type SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import { useForm } from "react-hook-form";
import { TextEditor } from "../TextEditor/TextEditor";
import type { TechOutput } from "@/server/api/routers/schema/tech.schema";

interface Props {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  initialData?: {
    title: string;
    description: string;
    techs: Tech[];
  };
  onSubmit?: (name: string, description: string, techs: string[]) => Promise<void>;
  onCancel?: () => void;
  mode?: 'create' | 'edit';
}

interface ProjectCreateSubmitProps {
  title: string;
  description: string;
}

interface EditProjectModalProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  project: ProjectModel;
  onEdit: (name: string, description: string, techs: string[]) => Promise<void>;
  onCancel?: () => void;
}

interface Tech {
  id: string;
  masterTechId: string;
  tech: {
    id: string;
    label: string;
    imgUrl: string;
  };
}

interface ProjectModel {
  id: string;
  name: string;
  description: string;
  techs: Tech[];
}

export default function NewProjectModal({
  isOpen,
  setIsOpen,
  initialData,
  onSubmit: customSubmit,
  mode = 'create' 
}: Props) {
  const router = useRouter();
  const utils = api.useContext();
  const { id: eventUuid } = router.query;
  const session = useSession();
  const cancelButtonRef = useRef(null);
  const { data, isLoading, isError } = api.techs.getAll.useQuery();

  const [selectedTechs, setSelectedTechs] = useState<TechOutput[]>([]);

  const { handleSubmit, register, reset, watch } = useForm({
    defaultValues: {
      title: '',
      description: ''
    }
  });

  useEffect(() => {
    if (initialData) {
      reset({
        title: initialData.title || '',
        description: initialData.description || ''
      });
      
      setSelectedTechs(
        initialData.techs?.map((tech: Tech) => ({
          id: tech.masterTechId,
          label: tech.tech.label,
          slug: tech.tech.label.toLowerCase(),
          imgUrl: tech.tech.imgUrl,
          _count: { Tech: 0 }
        })) || []
      );
    } else {
      reset({
        title: '',
        description: ''
      });
      setSelectedTechs([]);
    }
  }, [initialData, reset]);

  const { mutateAsync: createProject } = api.projects.create.useMutation({
    onSuccess: (data) => {
      setIsOpen(false);
      setSelectedTechs([]);
      reset({
        title: '',
        description: ''
      });
      return utils.events.findUnique.invalidate({
        id: data?.eventId,
      });
    },
  });

  const onSubmit = async (data: ProjectCreateSubmitProps) => {
    if (customSubmit) {
      await customSubmit(data.title, data.description, selectedTechs.map(tech => tech.id));
    } else {
      const userId = session?.data?.user?.id;
      const newProjectObj = {
        name: data.title,
        description: data.description,
        techs: selectedTechs.map(tech => tech.id),
        authorId: userId || "",
        eventId: eventUuid?.toString() || "",
      };
      await createProject(newProjectObj);
    }
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
                  <form onSubmit={handleSubmit(onSubmit)}>
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
                            />
                          </div>

                          <div className="col-span-6 sm:col-span-3">
                            <Autocomplete
                              multiple
                              id="tags-outlined"
                              value={selectedTechs}
                              onChange={(_, value) => {
                                return setSelectedTechs([...value]);
                              }}
                              options={data ?? []}
                              getOptionLabel={(option) => option.label}
                              isOptionEqualToValue={(option, value) => option.id === value.id}
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
                            <TextEditor
                              {...register("description", {
                                required: true,
                              })}
                              value={watch("description")}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
                        <div className="flex justify-end space-x-5">
                          <button
                            type="button"
                            className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                            onClick={() => {
                              setIsOpen(false);
                              if (customSubmit && mode === 'edit') {
                                setSelectedTechs(
                                  (initialData?.techs?.map((tech: Tech) => ({
                                    id: tech.masterTechId,
                                    label: tech.tech.label,
                                    slug: tech.tech.label.toLowerCase(),
                                    imgUrl: tech.tech.imgUrl
                                  })) || [])
                                );
                                reset({
                                  title: initialData?.title || '',
                                  description: initialData?.description || ''
                                });
                              }
                            }}
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="inline-flex justify-center rounded-md border border-transparent bg-gray-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                          >
                            Save
                          </button>
                        </div>
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

export function EditProjectModal({ isOpen, setIsOpen, project, onEdit, onCancel }: EditProjectModalProps) {
  const handleCancel = () => {
    setIsOpen(false);
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <NewProjectModal
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      initialData={{
        title: project.name,
        description: project.description,
        techs: project.techs
      }}
      onSubmit={onEdit}
      onCancel={handleCancel}
      mode="edit"
    />
  );
}
