import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useRef, useState } from "react";
import { api } from "@/utils/api";
import StyledCircleLoader from "@/components/StyledCircleLoader/StyledCircleLoader";
import Image from "next/image";
import { PencilSquareIcon, TrashIcon, PlusIcon, ArrowUpTrayIcon } from "@heroicons/react/24/outline";
import ImportTechStacksModal from "@/components/ImportTechStacksModal/ImportTechStacksModal";

interface ManageTechStacksModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

interface EditFormData {
  slug: string;
  label: string;
  imgUrl: string;
}

export default function ManageTechStacksModal({
  isOpen,
  setIsOpen,
}: ManageTechStacksModalProps) {
  const cancelButtonRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingTechId, setEditingTechId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editFormData, setEditFormData] = useState<EditFormData>({
    slug: "",
    label: "",
    imgUrl: "",
  });
  const [formErrors, setFormErrors] = useState<Partial<EditFormData>>({});
  const [isImportOpen, setIsImportOpen] = useState(false);

  const utils = api.useContext();

  const { data: techStacks, isLoading, isError } = api.techs.getAll.useQuery(
    undefined,
    { enabled: isOpen }
  );

  const { mutateAsync: createTech, isLoading: isCreatingTech } = 
    api.techs.create.useMutation({
      onSuccess: async () => {
        await utils.techs.getAll.invalidate();
        setIsCreating(false);
        setEditFormData({ slug: "", label: "", imgUrl: "" });
        setFormErrors({});
      },
    });

  const { mutateAsync: updateTech, isLoading: isUpdating } = 
    api.techs.update.useMutation({
      onSuccess: async () => {
        await utils.techs.getAll.invalidate();
        setEditingTechId(null);
        setEditFormData({ slug: "", label: "", imgUrl: "" });
        setFormErrors({});
      },
    });

  const { mutateAsync: deleteTech, isLoading: isDeleting } = 
    api.techs.delete.useMutation({
      onSuccess: async () => {
        await utils.techs.getAll.invalidate();
      },
    });

  const filteredTechStacks = techStacks?.filter((tech) =>
    tech.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tech.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const validateForm = (data: EditFormData): boolean => {
    const errors: Partial<EditFormData> = {};

    if (!data.label.trim()) {
      errors.label = "Label is required";
    }

    if (!data.imgUrl.trim()) {
      errors.imgUrl = "Image URL is required";
    } else {
      const normalizedUrl = data.imgUrl.trim().match(/^https?:\/\//i) 
        ? data.imgUrl.trim() 
        : `https://${data.imgUrl.trim()}`;
      
      try {
        new URL(normalizedUrl);
      } catch {
        errors.imgUrl = "Must be a valid URL or domain name";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateNew = () => {
    setIsCreating(true);
    setEditingTechId(null);
    setEditFormData({ slug: "", label: "", imgUrl: "" });
    setFormErrors({});
  };

  const handleEdit = (tech: typeof techStacks[number]) => {
    setEditingTechId(tech.id);
    setIsCreating(false);
    setEditFormData({
      slug: tech.slug,
      label: tech.label,
      imgUrl: tech.imgUrl,
    });
    setFormErrors({});
  };

  const handleCancelEdit = () => {
    setEditingTechId(null);
    setIsCreating(false);
    setEditFormData({ slug: "", label: "", imgUrl: "" });
    setFormErrors({});
  };

  const handleSaveNew = async () => {
    if (!validateForm(editFormData)) {
      return;
    }

    try {
      await createTech({
        slug: editFormData.slug.trim() || undefined,
        label: editFormData.label.trim(),
        imgUrl: editFormData.imgUrl.trim(),
      });
    } catch (error) {
      console.error("Error creating tech stack:", error);
      alert(error instanceof Error ? error.message : "Failed to create tech stack");
    }
  };

  const handleSaveEdit = async (techId: string) => {
    if (!validateForm(editFormData)) {
      return;
    }

    try {
      await updateTech({
        id: techId,
        slug: editFormData.slug.trim() || undefined,
        label: editFormData.label.trim(),
        imgUrl: editFormData.imgUrl.trim(),
      });
    } catch (error) {
      console.error("Error updating tech stack:", error);
      alert(error instanceof Error ? error.message : "Failed to update tech stack");
    }
  };

  const handleDelete = async (techId: string, techLabel: string, usageCount: number) => {
    if (usageCount > 0) {
      alert(`Cannot delete "${techLabel}". It is currently used in ${usageCount} project(s). Please remove it from all projects first.`);
      return;
    }

    if (!confirm(`Are you sure you want to delete "${techLabel}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteTech({ id: techId });
    } catch (error) {
      console.error("Error deleting tech stack:", error);
      alert(error instanceof Error ? error.message : "Failed to delete tech stack");
    }
  };

  const handleOpenImport = () => {
    setIsOpen(false);
    setIsImportOpen(true);
  };

  const handleCloseImport = () => {
    setIsImportOpen(false);
    setIsOpen(true);
  };

  return (
    <>
      <ImportTechStacksModal 
        isOpen={isImportOpen}
        setIsOpen={handleCloseImport}
      />
      
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
                        Tech Stacks
                      </Dialog.Title>
                      <p className="mt-2 text-sm text-gray-500">
                        View, edit, and manage all technology stacks in the system
                      </p>
                    </div>

                    <div className="mt-4 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={handleOpenImport}
                        className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                      >
                        <ArrowUpTrayIcon className="h-5 w-5" />
                        Bulk Import
                      </button>
                      <button
                        type="button"
                        onClick={handleCreateNew}
                        disabled={isCreating || editingTechId !== null}
                        className="inline-flex items-center gap-2 rounded-md border border-transparent bg-gray-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <PlusIcon className="h-5 w-5" />
                        Add New Tech Stack
                      </button>
                    </div>

                    <div className="mt-4">
                      <input
                        type="text"
                        placeholder="Search tech stacks..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm p-2 border"
                      />
                    </div>

                    <div className="mt-6 min-h-[400px] max-h-96 overflow-y-auto">
                      {isLoading && <StyledCircleLoader isLoading={true} />}

                      {isError && (
                        <p className="text-sm text-red-500 text-center">
                          Error loading tech stacks
                        </p>
                      )}

                      {isCreating && (
                        <div className="mb-4 rounded-lg border-2 border-gray-600 bg-gray-50 px-4 py-4 shadow-md">
                          <div className="mb-2">
                            <h4 className="text-sm font-semibold text-gray-900">Create New Tech Stack</h4>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Label *
                              </label>
                              <input
                                type="text"
                                value={editFormData.label}
                                onChange={(e) =>
                                  setEditFormData({ ...editFormData, label: e.target.value })
                                }
                                className={`w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 text-sm p-2 border ${
                                  formErrors.label ? "border-red-500" : ""
                                }`}
                                placeholder="e.g., React"
                              />
                              {formErrors.label && (
                                <p className="mt-1 text-xs text-red-500">{formErrors.label}</p>
                              )}
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Slug (optional)
                              </label>
                              <input
                                type="text"
                                value={editFormData.slug}
                                onChange={(e) =>
                                  setEditFormData({ ...editFormData, slug: e.target.value })
                                }
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 text-sm p-2 border"
                                placeholder="Auto-generated from label if empty"
                              />
                              <p className="mt-1 text-xs text-gray-500">
                                Leave empty to auto-generate from label
                              </p>
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Image URL *
                              </label>
                              <input
                                type="text"
                                value={editFormData.imgUrl}
                                onChange={(e) =>
                                  setEditFormData({ ...editFormData, imgUrl: e.target.value })
                                }
                                className={`w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 text-sm p-2 border ${
                                  formErrors.imgUrl ? "border-red-500" : ""
                                }`}
                                placeholder="https://user-images.githubusercontent.com/..."
                              />
                              {formErrors.imgUrl ? (
                                <p className="mt-1 text-xs text-red-500">{formErrors.imgUrl}</p>
                              ) : (
                                <p className="mt-1 text-xs text-blue-600">
                                  Recommended: Use images from https://user-images.githubusercontent.com for better quality
                                </p>
                              )}
                            </div>

                            <div className="flex justify-end space-x-2 pt-2">
                              <button
                                onClick={handleCancelEdit}
                                disabled={isCreatingTech}
                                className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={handleSaveNew}
                                disabled={isCreatingTech}
                                className="px-3 py-1 text-sm font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700 disabled:opacity-50"
                              >
                                {isCreatingTech ? "Creating..." : "Create"}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {filteredTechStacks && filteredTechStacks.length > 0 && (
                        <div className="space-y-4">
                          {filteredTechStacks.map((tech) => (
                            <div
                              key={tech.id}
                              className="relative rounded-lg border border-gray-300 bg-white px-4 py-4 shadow-sm"
                            >
                              {editingTechId === tech.id ? (
                                <div className="space-y-3">
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                      Label *
                                    </label>
                                    <input
                                      type="text"
                                      value={editFormData.label}
                                      onChange={(e) =>
                                        setEditFormData({ ...editFormData, label: e.target.value })
                                      }
                                      className={`w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 text-sm p-2 border ${
                                        formErrors.label ? "border-red-500" : ""
                                      }`}
                                      placeholder="e.g., React"
                                    />
                                    {formErrors.label && (
                                      <p className="mt-1 text-xs text-red-500">{formErrors.label}</p>
                                    )}
                                  </div>

                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                      Slug (optional)
                                    </label>
                                    <input
                                      type="text"
                                      value={editFormData.slug}
                                      onChange={(e) =>
                                        setEditFormData({ ...editFormData, slug: e.target.value })
                                      }
                                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 text-sm p-2 border"
                                      placeholder="Auto-generated from label if empty"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                      Leave empty to auto-generate from label
                                    </p>
                                  </div>

                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                      Image URL *
                                    </label>
                                    <input
                                      type="text"
                                      value={editFormData.imgUrl}
                                      onChange={(e) =>
                                        setEditFormData({ ...editFormData, imgUrl: e.target.value })
                                      }
                                      className={`w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 text-sm p-2 border ${
                                        formErrors.imgUrl ? "border-red-500" : ""
                                      }`}
                                      placeholder="https://user-images.githubusercontent.com/..."
                                    />
                                    {formErrors.imgUrl ? (
                                      <p className="mt-1 text-xs text-red-500">{formErrors.imgUrl}</p>
                                    ) : (
                                      <p className="mt-1 text-xs text-blue-600">
                                        Recommended: Use images from https://user-images.githubusercontent.com for better reliability
                                      </p>
                                    )}
                                  </div>

                                  <div className="flex justify-end space-x-2 pt-2">
                                    <button
                                      onClick={handleCancelEdit}
                                      disabled={isUpdating}
                                      className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      onClick={() => handleSaveEdit(tech.id)}
                                      disabled={isUpdating}
                                      className="px-3 py-1 text-sm font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700 disabled:opacity-50"
                                    >
                                      {isUpdating ? "Saving..." : "Save"}
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3 flex-1">
                                    <div className="flex-shrink-0">
                                      <Image
                                        src={tech.imgUrl}
                                        alt={tech.label}
                                        width={40}
                                        height={40}
                                        className="rounded"
                                      />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-gray-900 truncate">
                                        {tech.label}
                                      </p>
                                      <p className="text-xs text-gray-500 truncate">
                                        {tech.slug}
                                      </p>
                                      {tech._count && (
                                        <p className={`text-xs mt-1 ${tech._count.Tech > 0 ? 'text-orange-600 font-medium' : 'text-gray-400'}`}>
                                          Used in {tech._count.Tech} project(s)
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex items-center space-x-2">
                                    <button
                                      onClick={() => handleEdit(tech)}
                                      disabled={isDeleting || isCreating}
                                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md disabled:opacity-50"
                                      title="Edit tech stack"
                                    >
                                      <PencilSquareIcon className="h-5 w-5" />
                                    </button>
                                    <button
                                      onClick={() => handleDelete(tech.id, tech.label, tech._count?.Tech || 0)}
                                      disabled={isDeleting || (tech._count?.Tech || 0) > 0 || isCreating}
                                      className={`p-2 rounded-md disabled:opacity-50 ${
                                        (tech._count?.Tech || 0) > 0
                                          ? 'text-gray-400 cursor-not-allowed'
                                          : 'text-red-600 hover:text-red-900 hover:bg-red-50'
                                      }`}
                                      title={
                                        (tech._count?.Tech || 0) > 0
                                          ? `Cannot delete - used in ${tech._count?.Tech} project(s)`
                                          : 'Delete tech stack'
                                      }
                                    >
                                      <TrashIcon className="h-5 w-5" />
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {filteredTechStacks && filteredTechStacks.length === 0 && !isLoading && !isCreating && (
                        <p className="text-sm text-gray-500 text-center py-8">
                          {searchTerm 
                            ? `No tech stacks found matching "${searchTerm}"`
                            : "No tech stacks found"}
                        </p>
                      )}

                      {techStacks && techStacks.length > 0 && (
                        <div className="mt-4 text-center text-sm text-gray-500">
                          Showing {filteredTechStacks?.length || 0} of {techStacks.length} tech stacks
                        </div>
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
    </>
  );
}