import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useRef } from "react";
import { api } from "@/utils/api";
import StyledCircleLoader from "@/components/StyledCircleLoader/StyledCircleLoader";

interface ManageMembersModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function ManageMembersModal({
  isOpen,
  setIsOpen,
}: ManageMembersModalProps) {
  const cancelButtonRef = useRef(null);
  const utils = api.useContext();

  const { data: users, isLoading, isError } = api.users.getAll.useQuery(
    undefined,
    { enabled: isOpen }
  );

  const { mutateAsync: updateUserRole, isLoading: isUpdating } = 
    api.users.updateRole.useMutation({
      onSuccess: async () => {
        await utils.users.getAll.invalidate();
      },
    });

  const handleRoleChange = async (userId: string, newRole: "USER" | "MOD" | "ADMIN") => {
    await updateUserRole({
      id: userId,
      role: newRole,
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:p-6">
                <div>
                  <div className="text-center">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900"
                    >
                      Manage Members
                    </Dialog.Title>
                  </div>

                  <div className="mt-6 min-h-[400px] max-h-96 overflow-y-auto">
                    {isLoading && <StyledCircleLoader isLoading={true} />}

                    {isError && (
                      <p className="text-sm text-red-500">Error loading users</p>
                    )}

                    {users && users.length > 0 && (
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              User
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Email
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Role
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Title
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10">
                                    <img
                                      className="h-10 w-10 rounded-full"
                                      src={
                                        user.image ||
                                        "/images/blank-avatar.png"
                                      }
                                      alt=""
                                    />
                                  </div>
                                  <div className="ml-3">
                                    <div className="text-sm font-medium text-gray-900">
                                      {user.name}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="text-sm text-gray-500">
                                  {user.email}
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <select
                                  value={user.role}
                                  onChange={(e) => {
                                    void handleRoleChange(user.id, e.target.value as "USER" | "MOD" | "ADMIN");
                                  }}
                                  disabled={isUpdating}
                                  className={`rounded-full px-3 py-1 text-xs font-semibold border-0 focus:ring-2 focus:ring-gray-500 ${
                                    user.role === "ADMIN"
                                      ? "bg-purple-100 text-purple-800"
                                      : user.role === "MOD"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-gray-100 text-gray-800"
                                  } ${isUpdating ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                                >
                                  <option value="USER">USER</option>
                                  <option value="MOD">MOD</option>
                                  <option value="ADMIN">ADMIN</option>
                                </select>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                {user.title || "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}

                    {users && users.length === 0 && (
                      <p className="text-sm text-gray-500 text-center">
                        No users found
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