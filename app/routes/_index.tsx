import type { V2_MetaFunction } from "@remix-run/node";
import { useOptionalUser } from "~/utils";
import { Link } from "@remix-run/react";

export const meta: V2_MetaFunction = () => [{ title: "VBS App" }];

export default function Index() {
  let user = useOptionalUser();

  if (user)
    return (
      <main className="relative min-h-screen bg-white sm:flex sm:items-center sm:justify-center">
        <div className="text-lg font-semibold text-gray-700">
          Welcome to NCF! To have your child(ren) attend VBS{" "}
          <a
            href="/registrants"
            className="text-blue-500 underline hover:text-blue-700"
          >
            register here
          </a>
          .
        </div>
      </main>
    );

  return (
    <main className="relative min-h-screen bg-white sm:flex sm:items-center sm:justify-center">
      <div className="text-lg font-semibold text-gray-700">
        Welcome to NCF! To have your child(ren) attend VBS{" "}
        <a
          href="/login"
          className="text-blue-500 underline hover:text-blue-700"
        >
          log in
        </a>
        .
      </div>
    </main>
  );
}
