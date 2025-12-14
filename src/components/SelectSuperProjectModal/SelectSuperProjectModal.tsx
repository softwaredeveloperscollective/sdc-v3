import { Dialog, Transition } from "@headlessui/react";
import { type Dispatch, Fragment, type SetStateAction, useRef } from "react";
import { api } from "@/utils/api";
import type { superProject } from "@/types/superProejct";

interface Props {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  setIsSuper: Dispatch<SetStateAction<boolean>>;
  setIsNew: Dispatch<SetStateAction<boolean>>;
  setSuperProject: Dispatch<SetStateAction<superProject>>;
}

export default function SelectSuperProjectModal({
  isOpen,
  setIsOpen,
  setIsSuper,
  setIsNew,
  setSuperProject,
}: Props) {
  const { data } = api.superProjects.findByUser.useQuery({
    userId: "cltul21xd00007kfw4sag3t5v",
  });

  const cancelButtonRef = useRef(null);
  const handleNewButtonClick = () => {
    setIsOpen(false);
    setIsNew(true);
  };
  const handleSelectProject = (
    id: string,
    name: string,
    description: string
  ) => {
    const tmpProject: superProject = {
      id: id,
      name: name,
      description: description,
    };
    setIsOpen(false);
    setIsSuper(true);
    setSuperProject(tmpProject);
  };
  // if (typeof (superProjectIsLoading) === 'undefined'){
  //   console.log("I am about to return loading.")
  //   return <></>
  // }
  // debugger;
  // const list: SProject[] = superProjectData
  return (
    <>
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
                    <div className="overflow-hidden shadow sm:rounded-md">
                      <div className="bg-white px-4 py-5 sm:p-6">
                        <div className="flex flex-col gap-3">
                          {data?.map((project, index) => (
                            <li
                            key={index}
                              id={`${project.id}-${index}-${project.name}`}
                              className="col-span-6 list-none sm:col-span-3"
                              onClick={() => {
                                handleSelectProject(
                                  project.id,
                                  project.name,
                                  project.description
                                );
                              }}
                            >
                              <div className="w-full rounded-md border border-transparent bg-gray-100 p-3 text-left hover:bg-gray-400">
                                {project.name}
                              </div>
                            </li>
                          ))}

                          <div className="col-span-6 sm:col-span-3 ">
                            <button
                              type="button"
                              className="inline-flex justify-center rounded-md border border-transparent bg-gray-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-gray-700"
                              onClick={handleNewButtonClick}
                            >
                              Link Project
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
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
