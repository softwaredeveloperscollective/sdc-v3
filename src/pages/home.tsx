import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import ContributorsThanks from "@/components/Contributor/Contributor";

const HomePage: NextPage = () => {
  return (
    <>
      <Head>
        <title>SDC;</title>
        <meta name="description" content="" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="lg:relative">
        <div className="mx-auto w-full max-w-7xl pt-16 pb-20 text-center lg:py-48 lg:text-left">
          <div className="px-4 sm:px-8 lg:w-1/2 xl:pr-16">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl">
              <span className="block xl:inline">Meet people,</span>
              <span className="block text-gray-600 xl:inline">build stuff</span>
            </h1>
            <p className="mx-auto mt-3 max-w-md text-lg text-gray-500 sm:text-xl md:mt-5 md:max-w-3xl">
              Software Developers Collective is a community where developers can
              learn together by building together. Come to one of our mini
              hackathon events and meet some super cool people!
            </p>
            <div className="mt-10 sm:flex sm:justify-center lg:justify-start">
              <div className="rounded-md shadow">
                <Link
                  href="/events"
                  className="flex w-full items-center justify-center rounded-md border border-transparent bg-gray-600 px-8 py-3 text-base font-medium text-white hover:bg-gray-700 md:py-4 md:px-10 md:text-lg"
                >
                  Check Out Events
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="relative h-64 w-full sm:h-72 md:h-96 lg:absolute lg:inset-y-0 lg:right-0 lg:h-full lg:w-1/2">
          <img
            className="absolute inset-0 h-full w-full object-cover"
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80"
            alt=""
          />
        </div>
      </main>

      <div className="relative bg-gray-400">
        <div className="absolute inset-0">
          <img
            className="h-full w-full object-cover"
            src="https://images.unsplash.com/photo-1525130413817-d45c1d127c42?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1920&q=60&&sat=-100"
            alt=""
          />
          <div
            className="absolute inset-0 bg-gray-400 mix-blend-multiply"
            aria-hidden="true"
          />
        </div>
        <div className="relative mx-auto max-w-7xl py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Build
          </h1>
          <p className="mt-6 max-w-3xl text-xl text-gray-100">
            The best way to learn is to build together
          </p>
        </div>
      </div>

      <section className="overflow-hidden bg-white">
        <div className="relative mx-auto max-w-7xl px-4 pt-20 pb-12 sm:px-6 lg:px-8 lg:py-20">
          <svg
            className="absolute top-full left-0 translate-x-80 -translate-y-24 transform lg:hidden"
            width={784}
            height={404}
            fill="none"
            viewBox="0 0 784 404"
            aria-hidden="true"
          >
            <defs>
              <pattern
                id="e56e3f81-d9c1-4b83-a3ba-0d0ac8c32f32"
                x={0}
                y={0}
                width={20}
                height={20}
                patternUnits="userSpaceOnUse"
              >
                <rect
                  x={0}
                  y={0}
                  width={4}
                  height={4}
                  className="text-gray-200"
                  fill="currentColor"
                />
              </pattern>
            </defs>
            <rect
              width={784}
              height={404}
              fill="url(#e56e3f81-d9c1-4b83-a3ba-0d0ac8c32f32)"
            />
          </svg>

          <svg
            className="absolute right-full top-1/2 hidden translate-x-1/2 -translate-y-1/2 transform lg:block"
            width={404}
            height={784}
            fill="none"
            viewBox="0 0 404 784"
            aria-hidden="true"
          >
            <defs>
              <pattern
                id="56409614-3d62-4985-9a10-7ca758a8f4f0"
                x={0}
                y={0}
                width={20}
                height={20}
                patternUnits="userSpaceOnUse"
              >
                <rect
                  x={0}
                  y={0}
                  width={4}
                  height={4}
                  className="text-gray-200"
                  fill="currentColor"
                />
              </pattern>
            </defs>
            <rect
              width={404}
              height={784}
              fill="url(#56409614-3d62-4985-9a10-7ca758a8f4f0)"
            />
          </svg>

          <div className="relative lg:flex lg:items-center">
            <div className="hidden lg:block lg:flex-shrink-0">
              <img
                className="xl:h-62 xl:w-62 h-48 w-48 rounded-full"
                src="https://user-images.githubusercontent.com/47466645/194219745-2cb2cdd7-6c2b-4979-a721-b886a70b69bf.jpeg"
                alt=""
              />
            </div>

            <div className="relative lg:ml-10">
              <svg
                className="absolute top-0 left-0 h-36 w-36 -translate-x-8 -translate-y-24 transform text-gray-200 opacity-50"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 144 144"
                aria-hidden="true"
              >
                <path
                  strokeWidth={2}
                  d="M41.485 15C17.753 31.753 1 59.208 1 89.455c0 24.664 14.891 39.09 32.109 39.09 16.287 0 28.386-13.03 28.386-28.387 0-15.356-10.703-26.524-24.663-26.524-2.792 0-6.515.465-7.446.93 2.327-15.821 17.218-34.435 32.11-43.742L41.485 15zm80.04 0c-23.268 16.753-40.02 44.208-40.02 74.455 0 24.664 14.891 39.09 32.109 39.09 15.822 0 28.386-13.03 28.386-28.387 0-15.356-11.168-26.524-25.129-26.524-2.792 0-6.049.465-6.98.93 2.327-15.821 16.753-34.435 31.644-43.742L121.525 15z"
                />
              </svg>
              <blockquote className="relative">
                <div className="text-2xl font-medium leading-9 text-gray-900">
                  <p>
                    {`I was recently at a meetup in another city where a bunch of
                    current/new Software Developers would get together and work
                    on projects, or walk through tutorials together. It was
                    useful. When one person didn't know something, often someone
                    else did. It was just a helpful way to learn and grow as a
                    software developer.`}
                  </p>
                </div>
                <footer className="mt-8">
                  <div className="flex">
                    <div className="flex-shrink-0 lg:hidden">
                      <img
                        className="h-12 w-12 rounded-full"
                        src="https://user-images.githubusercontent.com/47466645/194219745-2cb2cdd7-6c2b-4979-a721-b886a70b69bf.jpeg"
                        alt=""
                      />
                    </div>
                    <div className="ml-4 lg:ml-0">
                      <div className="text-base font-medium text-gray-900">
                        Simon
                      </div>
                      <div className="text-base font-medium text-gray-600">
                        January 26, 2019
                      </div>
                    </div>
                  </div>
                </footer>
              </blockquote>
            </div>
          </div>
        </div>
      </section>
      
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ContributorsThanks />
        </div>
      </section>
    </>
  );
};

export default HomePage;
