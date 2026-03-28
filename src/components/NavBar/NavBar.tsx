/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable react/jsx-key */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import {
  Disclosure,
} from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useRouter } from "next/router";
import useUserSession from "@/hooks/useUserSession";
import classNames from "@/helpers/classNames";
import currentRouteIsActive from "@/helpers/currentRouteIsActive";
import { signIn, signOut } from "next-auth/react";
import { useState } from "react";
import { api } from "@/utils/api";
import ManageMembersModal from "@/components/ManageMembersModal/ManageMembersModal";
import ManageChaptersModal from "@/components/ManageChaptersModal/ManageChaptersModal";
import ManageTechStacksModal from "@/components/ManageTechStacksModal/ManageTechStacksModal";
import NewEventModal from "@/components/NewEventModal/NewEventModal";
import { useIsUserEditor } from "@/hooks/useIsUserEditor";


type Chapter = {
  id: string;
  name: string;
  slug?: string;
};

const HoverMenu = ({ navigation_item_with_sublinks, currentPath }) => {
    const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <span
        className="relative inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        {navigation_item_with_sublinks.name}
        {isOpen && (
          <div className="absolute left-0 top-full z-10 mt-1 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
            <div
              className="py-1"
              onMouseEnter={() => setIsOpen(true)}
              onMouseLeave={() => setIsOpen(false)}
            >
              {navigation_item_with_sublinks.subLinks?.map((item) => (
                <Link
                  key={item.name}
                  href={item.href || "#"}
                  onClick={(e) => {
                    if (item.onClick) {
                      e.preventDefault();
                      item.onClick();
                    }
                  }}
                  className={classNames(
                    currentRouteIsActive(currentPath, item.href ?? "")
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                    "block px-4 py-2 text-sm cursor-pointer"
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </span>
    </>
  );
};

const TopNavigationBar = ({ currentPath, navigation, chaptersLoading }) => {
  return (
    <>
      {navigation.map((item) => {
        if (item.subLinks) {
          // Show loading only for Chapters, not for Admin
          const isChaptersItem = item.name === "Chapters";
          return chaptersLoading && isChaptersItem ? (
            <span key={item.name} className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-400">
              Loading Chapters...
            </span>
          ) : (
            <HoverMenu
              key={item.name}
              navigation_item_with_sublinks={item}
              currentPath={currentPath}
            />
          );
        } else {
          return (
            <Link
              key={item.name}
              href={item.href}
              className={classNames(
                currentRouteIsActive(currentPath, item.href ?? "")
                  ? "border-gray-500  text-gray-900"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                "inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium"
              )}
            >
              Home
            </Link>
          );
        }
      })}
    </>
  );
};

const HamburgerNavigationBar = ({
  currentPath,
  navigation,
  user,
  router,
  handleButtonClick,
  chaptersLoading,
}) => {
  return (
    <>
      <Disclosure.Panel className="sm:hidden">
        <div className="space-y-1 pt-2 pb-4">
          {navigation.map((item) => {
            if (!item.subLinks) {
              return (
                <Disclosure.Button
                  key={item.name}
                  as="a"
                  href={item.href}
                  className={classNames(
                    currentRouteIsActive(currentPath, item.href)
                      ? "border-gray-500 bg-gray-50 text-gray-700"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700",
                    "block border-l-4 py-2 pl-3 pr-4 text-base font-medium"
                  )}
                >
                  {item.name}
                </Disclosure.Button>
              );
            } else {
              return (
                <>
                  <Disclosure.Button
                    key={item.name}
                    as="span"
                    className="block cursor-default select-none border-l-4 border-transparent py-2 pl-3 pr-4 font-medium text-gray-500"
                  >
                    {item.name}
                  </Disclosure.Button>
                  {chaptersLoading ? (
                    <Disclosure.Button
                      as="span"
                      className="block cursor-default select-none border-l-4 border-transparent py-2 pl-8 pr-4 text-base font-medium text-gray-400"
                    >
                      Loading Chapters...
                    </Disclosure.Button>
                  ) : (
                    item.subLinks.map((subItem) => (
                      <Disclosure.Button
                        key={subItem.name}
                        as="a"
                        href={subItem.href || "#"}
                        onClick={(e) => {
                          if (subItem.onClick) {
                            e.preventDefault();
                            subItem.onClick();
                          }
                        }}
                        className={classNames(
                          currentRouteIsActive(currentPath, subItem.href)
                            ? "border-gray-500 bg-gray-50 text-gray-700"
                            : "border-transparent text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700",
                          "block border-l-4 py-2 pl-8 pr-4 text-base font-medium"
                        )}
                      >
                        {subItem.name}
                      </Disclosure.Button>
                    ))
                  )}
                </>
              );
            }
          })}
          {user && (
            <Disclosure.Button
              as="a"
              onClick={() => void router.push(`/user/${user.id}`)}
              className="block border-l-4 border-transparent py-2 pl-3
                  pr-4 text-base font-medium text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700"
            >
              Profile
            </Disclosure.Button>
          )}
          <Disclosure.Button
            as="a"
            onClick={() => void handleButtonClick()}
            className="block border-l-4 border-transparent py-2 pl-3
                  pr-4 text-base font-medium text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700"
          >
            {user ? "Logout" : "Login"}
          </Disclosure.Button>
        </div>
      </Disclosure.Panel>
    </>
  );
};

export default function NavBar() {
  const [isManageMembersOpen, setIsManageMembersOpen] = useState(false);
  const [isManageChaptersOpen, setIsManageChaptersOpen] = useState(false);
  const [isManageTechStacksOpen, setIsManageTechStacksOpen] = useState(false);
  const [isNewEventOpen, setIsNewEventOpen] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  const {
    data: chapters = [],
    isLoading: chaptersLoading,
  } = api.chapters.getAll.useQuery();

  const user = useUserSession();
  const userIsEditor = useIsUserEditor();

  const navigation = [
    { name: "Home", href: "/", current: false },
    {
      name: "Chapters",
      href: "",
      current: false,
      subLinks: chapters.map((c) => ({
        name: c.name,
        href: `/events?chapterId=${c.id}`,
        current: false,
      })),
    },
    // Add Admin dropdown - only show if user is an editor
    ...(userIsEditor && user ? [{
      name: "Admin",
      href: "",
      current: false,
      subLinks: [
        {
          name: "Members",
          onClick: () => setIsManageMembersOpen(true),
          current: false,
        },
        {
          name: "Chapters",
          onClick: () => setIsManageChaptersOpen(true),
          current: false,
        },
        {
          name: "Tech Stacks",
          onClick: () => setIsManageTechStacksOpen(true),
          current: false,
        },
        {
          name: "Create Events",
          onClick: () => setIsNewEventOpen(true),
          current: false,
        },
      ],
    }] : []),
  ];
  
  const router = useRouter();
  const pathname = router.pathname;

  const handleButtonClick = () => {
    return user ? signOut() : signIn();
  };
  
  return (
    <Disclosure as="nav" className="bg-white shadow">
      {({ open }) => (
        <>
          <ManageMembersModal
            isOpen={isManageMembersOpen}
            setIsOpen={setIsManageMembersOpen}
          />
          <ManageChaptersModal
            isOpen={isManageChaptersOpen}
            setIsOpen={setIsManageChaptersOpen}
          />
          <ManageTechStacksModal
            isOpen={isManageTechStacksOpen}
            setIsOpen={setIsManageTechStacksOpen}
          />
          <NewEventModal
            isOpen={isNewEventOpen}
            setIsOpen={setIsNewEventOpen}
          />
          <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
            <div className="relative flex h-16 justify-between">
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                {/* Mobile menu button */}
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-800">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
              <div className="flex flex-1 items-center justify-between sm:items-stretch sm:justify-start">
                <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                  <div className="flex flex-shrink-0 items-center">
                    <img
                      className="block h-8 w-auto lg:hidden"
                      src="https://user-images.githubusercontent.com/47466645/194220749-19cff7cf-65d1-4019-84f3-b08669817b0b.png"
                      alt="SDC"
                    />
                    <img
                      className="hidden h-8 w-auto lg:block"
                      src="https://user-images.githubusercontent.com/47466645/194220749-19cff7cf-65d1-4019-84f3-b08669817b0b.png"
                      alt="SDC"
                    />
                  </div>
                  <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                    {/* Current: "border-gray-500 text-gray-900", Default: "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700" */}
                    <TopNavigationBar
                      currentPath={pathname}
                      navigation={navigation}
                      chaptersLoading={chaptersLoading}
                    />
                  </div>
                </div>
                <div className="hidden items-center gap-4 sm:flex sm:flex-row sm:justify-center">
                  {user && (
                    <>
                      <Link
                        href={`/user/${user.id}`}
                        className="group block flex-shrink-0"
                      >
                        <div className="flex items-center">
                          <div>
                            <img
                              className="inline-block h-9 w-9 rounded-full"
                              src={user.image || "/images/blank-avatar.png"}
                              alt=""
                            />
                          </div>
                          <div className="ml-3 flex flex-col">
                            <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                              {user.name}
                            </span>
                            <span className="text-xs font-medium text-gray-500 group-hover:text-gray-900">
                              View profile
                            </span>
                          </div>
                        </div>
                      </Link>
                    </>
                  )}

                  <button
                    type="button"
                    className="inline-flex items-center rounded-md border border-transparent bg-gray-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    onClick={() => void handleButtonClick()}
                  >
                    {user ? "Logout" : "Login"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <HamburgerNavigationBar
            currentPath={pathname}
            navigation={navigation}
            user={user}
            router={router}
            handleButtonClick={handleButtonClick}
            chaptersLoading={chaptersLoading}
          />
        </>
      )}
    </Disclosure>
  );
}
