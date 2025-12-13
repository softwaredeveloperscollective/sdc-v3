import { Dialog, Transition } from "@headlessui/react";
import { type Dispatch, Fragment, type SetStateAction, useRef } from "react";
import { api } from "@/utils/api";
import useUserSession from "@/hooks/useUserSession";
import type { ImportedProject, PastProject } from "@/types/ProjectsType";

interface Props {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  setIsNew: Dispatch<SetStateAction<boolean>>;
  setIsSuper: Dispatch<SetStateAction<boolean>>;
  setIsImport: Dispatch<SetStateAction<boolean>>;
  setImportedProject: Dispatch<SetStateAction<ImportedProject | null>>;
}

export default function SelectProjectModal({
  isOpen,
  setIsOpen,
  setIsNew,
  setIsSuper,
  setIsImport,
  setImportedProject,
}: Props) {
  const cancelButtonRef = useRef(null);
  const user = useUserSession();

  const { data: userPastProjects, isLoading } = api.projects.getUserPastProjects.useQuery(
    {
      userId: user?.id || "",
    },
    {
      enabled: !!user?.id && isOpen,
    }
  );

  const handleNewButtonClick = () => {
    setIsOpen(false);
    setIsNew(true);
    setImportedProject(null);
  };

  const handleImportProject = (project: PastProject) => {
    setImportedProject({
      name: project.name,
      description: project.description,
      techs: project.techs,
    });
    setIsOpen(false);
    setIsNew(true);
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
                <div>
                  <div className="text-center">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900"
                    >
                      Add Project
                    </Dialog.Title>
                  </div>

                  <div className="mt-6">
                    <ul className="space-y-3">
                      <li>
                        <button
                          type="button"
                          className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-left text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                          onClick={handleNewButtonClick}
                        >
                          Add a new project
                        </button>
                      </li>
                      
                      {isLoading && (
                        <li className="text-center text-sm text-gray-500">
                          Loading your past projects...
                        </li>
                      )}
                      
                      {userPastProjects && userPastProjects.length > 0 && (
                        <>
                          <li className="pt-4 text-sm font-medium text-gray-500">
                            Or import from past events:
                          </li>
                          {userPastProjects.map((project) => (
                            <li key={project.id}>
                              <button
                                type="button"
                                className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-left text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                                onClick={() => handleImportProject(project)}
                              >
                                <div className="font-semibold">{project.name}</div>
                                <div className="text-xs text-gray-500">
                                  From: {project.event.name}
                                </div>
                              </button>
                            </li>
                          ))}
                        </>
                      )}
                    </ul>
                  </div>

                  <div className="mt-5 sm:mt-6">
                    <button
                      type="button"
                      className="inline-flex w-full justify-center rounded-md border border-transparent bg-gray-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 sm:text-sm"
                      onClick={() => setIsOpen(false)}
                      ref={cancelButtonRef}
                    >
                      Cancel
                    </button>
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
