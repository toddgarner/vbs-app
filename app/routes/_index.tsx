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
    <main className="flex justify-center sm:items-center">
      <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="mx-auto h-4/5 w-4/5 sm:h-full sm:w-full">
          <div className="mx-auto mt-6 max-w-lg text-center text-4xl text-gray-700 sm:max-w-3xl">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
              Vacation Bible School
            </h1>
            <p className="pb-2 text-2xl text-gray-700 dark:text-gray-400">
              at New City Fellowship
            </p>
          </div>
          <img
            className="h-[50vh] w-full object-contain sm:h-[70vh]"
            src="/LandingPage.jpeg"
            alt="New City Fellowship"
          />
          <div className="mx-auto max-w-sm sm:mt-10 sm:flex sm:max-w-none sm:justify-center">
            {user ? (
              <Link
                to="/registrants"
                className="flex items-center justify-center rounded-md border border-transparent bg-white px-4 py-3 text-base font-medium text-yellow-700 shadow-sm hover:bg-yellow-50 sm:px-8"
              >
                Please proceed
              </Link>
            ) : (
              <div className="flex">
                <div className="mx-auto space-y-4 sm:inline-grid  sm:gap-5 sm:space-y-0">
                  <Link
                    to="/login"
                    className="flex items-center justify-center rounded-md bg-gray-900 px-4 py-3 font-bold text-white hover:bg-gray-700"
                    style={{ color: "#ffde59" }}
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
