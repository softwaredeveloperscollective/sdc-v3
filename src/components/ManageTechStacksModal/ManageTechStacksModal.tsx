import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useRef, useState } from "react";
import { api } from "@/utils/api";
import StyledCircleLoader from "@/components/StyledCircleLoader/StyledCircleLoader";
import Image from "next/image";

interface ManageTechStacksModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function ManageTechStacksModal({
  isOpen,
  setIsOpen,
}: ManageTechStacksModalProps) {
  const cancelButtonRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: techStacks, isLoading, isError } = api.techs.getAll.useQuery(
    undefined,
    { enabled: isOpen }
  );

  const filteredTechStacks = techStacks?.filter((tech) =>
    tech.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tech.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                      Manage Tech Stacks
                    </Dialog.Title>
                    <p className="mt-2 text-sm text-gray-500">
                      View and manage all technology stacks in the system
                    </p>
                  </div>

                  {/* Search Bar */}
                  <div className="mt-4">
                    <input
                      type="text"
                      placeholder="Search tech stacks..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm p-2 border"
                    />
                  </div>

                  {/* Tech Stacks List */}
                  <div className="mt-6 min-h-[400px] max-h-96 overflow-y-auto">
                    {isLoading && <StyledCircleLoader isLoading={true} />}

                    {isError && (
                      <p className="text-sm text-red-500 text-center">
                        Error loading tech stacks
                      </p>
                    )}

                    {filteredTechStacks && filteredTechStacks.length > 0 && (
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredTechStacks.map((tech) => (
                          <div
                            key={tech.id}
                            className="relative rounded-lg border border-gray-300 bg-white px-4 py-4 shadow-sm hover:border-gray-400 hover:shadow-md transition-all"
                          >
                            <div className="flex items-center space-x-3">
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
                                  <p className="text-xs text-gray-400 mt-1">
                                    Used in {tech._count.Tech} project(s)
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {filteredTechStacks && filteredTechStacks.length === 0 && !isLoading && (
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
  );
}