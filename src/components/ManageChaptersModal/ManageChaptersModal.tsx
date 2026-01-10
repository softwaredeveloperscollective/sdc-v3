import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useRef, useState } from "react";
import { api } from "@/utils/api";
import StyledCircleLoader from "@/components/StyledCircleLoader/StyledCircleLoader";
import { useForm } from "react-hook-form";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";

interface ManageChaptersModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

interface ChapterFormData {
  name: string;
  slug?: string;
  location?: string;
  meetupUrl?: string;
  discordUrl?: string;
  isActive: boolean;
}

export default function ManageChaptersModal({
  isOpen,
  setIsOpen,
}: ManageChaptersModalProps) {
  const cancelButtonRef = useRef(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
  
  const utils = api.useContext();

  const { data: chapters, isLoading, isError } = api.chapters.getAllWithInactive.useQuery(
    undefined,
    { enabled: isOpen }
  );

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ChapterFormData>({
    defaultValues: {
      name: "",
      slug: "",
      location: "",
      meetupUrl: "",
      discordUrl: "",
      isActive: true,
    },
  });

  const { mutateAsync: createChapter, isLoading: isCreating } = api.chapters.create.useMutation({
    onSuccess: async () => {
      await utils.chapters.getAllWithInactive.invalidate();
      await utils.chapters.getAll.invalidate();
      setShowCreateForm(false);
      setEditingChapterId(null);
      reset();
    },
    onError: (error) => {
      alert(`Error creating chapter: ${error.message}`);
    },
  });

  const { mutateAsync: updateChapter, isLoading: isUpdating } = api.chapters.update.useMutation({
    onSuccess: async () => {
      await utils.chapters.getAllWithInactive.invalidate();
      await utils.chapters.getAll.invalidate();
      setShowCreateForm(false);
      setEditingChapterId(null);
      reset();
    },
    onError: (error) => {
      alert(`Error updating chapter: ${error.message}`);
    },
  });

  const { mutateAsync: deleteChapter, isLoading: isDeleting } = api.chapters.delete.useMutation({
    onSuccess: async () => {
      await utils.chapters.getAllWithInactive.invalidate();
      await utils.chapters.getAll.invalidate();
    },
    onError: (error) => {
      alert(`Error deleting chapter: ${error.message}`);
    },
  });

  const onSubmit = async (data: ChapterFormData) => {
    if (editingChapterId) {
      await updateChapter({
        id: editingChapterId,
        name: data.name,
        slug: data.slug || undefined,
        location: data.location || undefined,
        meetupUrl: data.meetupUrl || undefined,
        discordUrl: data.discordUrl || undefined,
        isActive: data.isActive,
      });
    } else {
      await createChapter({
        name: data.name,
        slug: data.slug || undefined,
        location: data.location || undefined,
        meetupUrl: data.meetupUrl || undefined,
        discordUrl: data.discordUrl || undefined,
        isActive: data.isActive,
      });
    }
  };

  const handleEdit = (chapter: typeof chapters[number]) => {
    setEditingChapterId(chapter.id);
    setShowCreateForm(true);
    reset({
      name: chapter.name,
      slug: chapter.slug || "",
      location: chapter.location || "",
      meetupUrl: chapter.meetupUrl || "",
      discordUrl: chapter.discordUrl || "",
      isActive: chapter.isActive,
    });
  };

  const handleDelete = async (chapterId: string, chapterName: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to deactivate "${chapterName}"? This will make it invisible to regular users.`
    );
    if (confirmed) {
      await deleteChapter({ id: chapterId });
    }
  };

  const handleCancel = () => {
    setShowCreateForm(false);
    setEditingChapterId(null);
    reset();
  };

  const isProcessing = isCreating || isUpdating || isDeleting;

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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:p-6">
                <div>
                  <div className="text-center">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900"
                    >
                      Manage Chapters
                    </Dialog.Title>
                    <p className="mt-2 text-sm text-gray-500">
                      View and manage all chapters in the system
                    </p>
                  </div>

                  {/* Create New Chapter Button */}
                  {!showCreateForm && (
                    <div className="mt-4 flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingChapterId(null);
                          setShowCreateForm(true);
                          reset({
                            name: "",
                            slug: "",
                            location: "",
                            meetupUrl: "",
                            discordUrl: "",
                            isActive: true,
                          });
                        }}
                        className="inline-flex items-center rounded-md border border-transparent bg-gray-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                      >
                        + New Chapter
                      </button>
                    </div>
                  )}

                  {showCreateForm && (
                    <div className="mt-4 border-t border-gray-200 pt-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-4">
                        {editingChapterId ? "Edit Chapter" : "Create New Chapter"}
                      </h4>
                      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                              Chapter Name *
                            </label>
                            <input
                              type="text"
                              id="name"
                              {...register("name", { required: "Chapter name is required" })}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm p-2 border"
                            />
                            {errors.name && (
                              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                            )}
                          </div>

                          <div>
                            <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
                              Slug (optional)
                            </label>
                            <input
                              type="text"
                              id="slug"
                              {...register("slug")}
                              placeholder="e.g., calgary"
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm p-2 border"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                              Auto-generated from name if left empty
                            </p>
                          </div>

                          <div>
                            <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                              Location
                            </label>
                            <input
                              type="text"
                              id="location"
                              {...register("location")}
                              placeholder="e.g., Calgary, AB"
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm p-2 border"
                            />
                          </div>

                          <div>
                            <label htmlFor="meetupUrl" className="block text-sm font-medium text-gray-700">
                              Meetup URL
                            </label>
                            <input
                              type="url"
                              id="meetupUrl"
                              {...register("meetupUrl")}
                              placeholder="https://meetup.com/..."
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm p-2 border"
                            />
                          </div>

                          <div>
                            <label htmlFor="discordUrl" className="block text-sm font-medium text-gray-700">
                              Discord URL
                            </label>
                            <input
                              type="url"
                              id="discordUrl"
                              {...register("discordUrl")}
                              placeholder="https://discord.gg/..."
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm p-2 border"
                            />
                          </div>

                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="isActive"
                              {...register("isActive")}
                              className="h-4 w-4 rounded border-gray-300 text-gray-600 focus:ring-gray-500"
                            />
                            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                              Active Chapter
                            </label>
                          </div>
                        </div>

                        <div className="flex justify-end space-x-3 pt-2">
                          <button
                            type="button"
                            onClick={handleCancel}
                            disabled={isProcessing}
                            className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={isProcessing}
                            className="inline-flex justify-center rounded-md border border-transparent bg-gray-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isProcessing 
                              ? (editingChapterId ? "Updating..." : "Creating...") 
                              : (editingChapterId ? "Update Chapter" : "Create Chapter")
                            }
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Chapters List */}
                  <div className="mt-6 min-h-[400px] max-h-96 overflow-y-auto">
                    {isLoading && <StyledCircleLoader isLoading={true} />}

                    {isError && (
                      <p className="text-sm text-red-500 text-center">
                        Error loading chapters
                      </p>
                    )}

                    {chapters && chapters.length > 0 && (
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Name
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Location
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Events
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Links
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {chapters.map((chapter) => (
                            <tr key={chapter.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {chapter.name}
                                </div>
                                {chapter.slug && (
                                  <div className="text-xs text-gray-500">
                                    /{chapter.slug}
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="text-sm text-gray-500">
                                  {chapter.location || "—"}
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {chapter._count?.events || 0}
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span
                                  className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                    chapter.isActive
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {chapter.isActive ? "Active" : "Inactive"}
                                </span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm">
                                <div className="flex flex-col gap-1">
                                  {chapter.meetupUrl && (
                                    <a
                                      href={chapter.meetupUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:text-blue-800"
                                    >
                                      Meetup
                                    </a>
                                  )}
                                  {chapter.discordUrl && (
                                    <a
                                      href={chapter.discordUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:text-blue-800"
                                    >
                                      Discord
                                    </a>
                                  )}
                                  {!chapter.meetupUrl && !chapter.discordUrl && (
                                    <span className="text-gray-400">—</span>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm">
                                <div className="flex space-x-3">
                                  <button
                                    type="button"
                                    onClick={() => handleEdit(chapter)}
                                    disabled={isProcessing}
                                    className="text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Edit chapter"
                                  >
                                    <PencilSquareIcon className="h-5 w-5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDelete(chapter.id, chapter.name)}
                                    disabled={isProcessing}
                                    className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Deactivate chapter"
                                  >
                                    <TrashIcon className="h-5 w-5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}

                    {chapters && chapters.length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-8">
                        No chapters found. Create your first chapter above!
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-5 sm:mt-6">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md border border-transparent bg-gray-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 sm:text-sm"
                    onClick={() => setIsOpen(false)}
                    ref={cancelButtonRef}
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}