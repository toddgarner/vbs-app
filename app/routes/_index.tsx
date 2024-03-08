import {
  redirect,
  type LoaderArgs,
  type V2_MetaFunction,
  json,
} from "@remix-run/node";
import { Link } from "@remix-run/react";
import { getUserId } from "~/session.server";

import { useOptionalUser } from "~/utils";

export const meta: V2_MetaFunction = () => [{ title: "VBS App" }];

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await getUserId(request);
  if (userId) return redirect("/registrants");
  return json({});
};

export default function Index() {
  const user = useOptionalUser();
  return (
    <main className="relative flex min-h-screen justify-center bg-white sm:items-center">
      <div className="relative sm:pb-16 sm:pt-8">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="mx-auto mt-6 max-w-lg text-center text-4xl text-gray-700 sm:max-w-3xl">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
              Vacation Bible School
            </h1>
            <p className="text-2xl text-gray-500 dark:text-gray-400">
              at New City Fellowship
            </p>
          </div>

          <div className="relative shadow-xl sm:overflow-hidden sm:rounded-2xl">
            <div className="absolute inset-0">
              <img
                className="h-full w-full object-cover"
                src="https://storage1.snappages.site/TPQ7FG/assets/images/5627515_3000x1546_500.jpg"
                alt="New City Fellowship"
              />
              <div className="absolute inset-0" />
            </div>
            <div className="relative px-4 pb-8 pt-16 sm:px-6 sm:pb-14 sm:pt-24 lg:px-8 lg:pb-20 lg:pt-32">
              <h1 className="text-center text-6xl font-extrabold tracking-tight sm:text-8xl lg:text-9xl">
                <span className="block uppercase text-white drop-shadow-md">
                  NCF VBS
                </span>
              </h1>
            </div>
          </div>
          <div className="mx-auto mt-10 max-w-sm sm:flex sm:max-w-none sm:justify-center">
            {user ? (
              <Link
                to="/registrants"
                className="flex items-center justify-center rounded-md border border-transparent bg-white px-4 py-3 text-base font-medium text-yellow-700 shadow-sm hover:bg-yellow-50 sm:px-8"
              >
                Please proceed
              </Link>
            ) : (
              <div className="flex">
                {/* <div>
                  <p className="mx-auto mr-2 mt-6 max-w-lg text-center text-xl text-black sm:max-w-3xl">
                    Login in or sign up to continue.
                  </p>
                </div> */}
                <div className="mx-auto space-y-4 sm:inline-grid  sm:gap-5 sm:space-y-0">
                  <Link
                    to="/login"
                    className="flex items-center justify-center rounded-md bg-yellow-500 px-4 py-3 font-medium text-white hover:bg-yellow-600"
                  >
                    Log in or sign up to continue
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
