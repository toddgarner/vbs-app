import { useState } from "react";
import type { SetStateAction } from "react";
import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, NavLink, Outlet, useLoaderData } from "@remix-run/react";

import {
  getAllChildren,
  getChildListItems,
} from "~/models/registration.server";
import { requireUserId } from "~/session.server";
import { useUser } from "~/utils";
import { getUserById } from "~/models/user.server";

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await requireUserId(request);
  const url = new URL(request.url);
  const pathname = url.pathname;

  const user = await getUserById(userId);
  const children = await getAllChildren();

  const adminChildListItems = { ...user, children };

  const childListItems =
    user?.role.name === "Admin"
      ? adminChildListItems
      : await getChildListItems(userId);

  return json({ childListItems, pathname });
};

export default function RegistrantsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // ["out", "in", "all"] "
  const data = useLoaderData<typeof loader>();
  const user = useUser();

  const filteredItems = data.childListItems?.children.filter((child) => {
    const isMatchedSearchTerm = child.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    if (statusFilter === "all") return isMatchedSearchTerm;
    if (statusFilter === "in")
      return isMatchedSearchTerm && child.checkedIn === true;
    if (statusFilter === "out")
      return isMatchedSearchTerm && child.checkedIn === false;
    return isMatchedSearchTerm;
  });

  const pathname = data.pathname;

  const handleSearch = (e: { target: { value: SetStateAction<string> } }) => {
    setSearchTerm(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  return (
    <div className="flex h-full min-h-screen flex-col">
      <header className="flex items-center justify-between bg-slate-800 p-4 text-white">
        <h1 className="text-3xl font-bold">
          <Link to="." reloadDocument>
            Registrations
          </Link>
        </h1>
        <p className="hidden md:block">Signed In User: {user.name}</p>
        <Form action="/logout" method="post">
          <button
            type="submit"
            className="rounded bg-slate-600 px-4 py-2 text-blue-100 hover:bg-blue-500 active:bg-blue-600"
          >
            Logout
          </button>
        </Form>
      </header>

      <main className="flex h-full flex-col bg-white sm:flex-row">
        <div className="border-r bg-gray-50 sm:w-80">
          <Link
            to="new"
            reloadDocument
            className="block p-4 text-xl text-blue-500"
          >
            + New Registration
          </Link>
          {user.role.name === "Admin" && (
            <>
              <Link
                to="scan"
                reloadDocument
                className="block p-4 text-xl text-blue-500"
              >
                Scan
              </Link>
              <div className="flex items-center justify-between p-4 text-xl text-blue-500">
                <label htmlFor="statusFilter" className="mr-2">
                  Status:
                </label>
                <select
                  id="statusFilter"
                  className="rounded-md border border-gray-300 px-2 py-1 text-gray-900"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All</option>
                  <option value="in">In</option>
                  <option value="out">Out</option>
                </select>
              </div>
            </>
          )}
          <hr />
          <div className="hidden sm:block">
            <div className="flex items-center">
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                placeholder="Search"
                className="flex-1 p-4"
              />
              {searchTerm && (
                <button
                  onClick={handleClearSearch}
                  className="p-4 text-red-500"
                >
                  Clear
                </button>
              )}
            </div>
            {filteredItems?.length === 0 ? (
              <p className="p-4">No registrants</p>
            ) : (
              <ol className="sm:mt-4">
                {filteredItems?.map((child) => (
                  <li key={child.id}>
                    <NavLink
                      className={({ isActive }) =>
                        `block border-b p-4 text-xl ${
                          isActive ? "bg-white" : ""
                        }`
                      }
                      to={child.id}
                    >
                      📝 {child.name}
                    </NavLink>
                  </li>
                ))}
              </ol>
            )}
          </div>
          {pathname === "/registrants" && (
            <div className="block sm:hidden">
              <div className="flex items-center">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearch}
                  placeholder="Search"
                  className="flex-1 p-4"
                />
                {searchTerm && (
                  <button
                    onClick={handleClearSearch}
                    className="p-4 text-red-500"
                  >
                    Clear
                  </button>
                )}
              </div>

              {filteredItems?.length === 0 ? (
                <p className="p-4">No registrants</p>
              ) : (
                <ol className="sm:mt-4">
                  {filteredItems?.map((child) => (
                    <li key={child.id}>
                      <NavLink
                        reloadDocument
                        className={({ isActive }) =>
                          `block border-b p-4 text-xl ${
                            isActive ? "bg-white" : ""
                          }`
                        }
                        to={child.id}
                      >
                        📝 {child.name}
                      </NavLink>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          )}
        </div>

        <div className="flex-1 p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
