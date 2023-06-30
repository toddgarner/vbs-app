import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  Link,
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import invariant from "tiny-invariant";
import { sendQrCode, textQrCode } from "~/models/aws.server";

import { deleteChild, getChild } from "~/models/registration.server";
import { requireUserId } from "~/session.server";

export const loader = async ({ params, request }: LoaderArgs) => {
  const userId = await requireUserId(request);
  invariant(params.registrantId, "Child not found");

  const child = await getChild({ id: params.registrantId, userId });
  if (!child) {
    throw new Response("Not Found", { status: 404 });
  }
  return json({ child });
};

export const action = async ({ params, request }: ActionArgs) => {
  const userId = await requireUserId(request);
  invariant(params.registrantId, "Child not found");

  const formData = await request.formData();
  const action = formData.get("_action");
  const phone = formData.get("phone")?.toString() || "";
  const registrant = formData.get("registrant")?.toString() || "";
  const qrcode = formData.get("qrcode")?.toString() || "";
  const email = formData.get("email")?.toString() || "";

  if (action === "deleteChild") {
    await deleteChild({ id: params.registrantId, userId });
    return redirect("/registrants");
  } else if (action === "sendQrCode") {
    await sendQrCode(email, registrant, qrcode);
    return redirect("/registrants");
  } else if (action === "textQrCode") {
    await textQrCode(phone, registrant);
    return redirect("/registrants");
  }
};

export default function ChildDetailsPage() {
  const data = useLoaderData<typeof loader>();

  return (
    <div>
      <h3 className="text-2xl font-bold">{data.child.registrant}</h3>
      <p className="py-2">Email: {data.child.email}</p>
      <p className="py-2">Phone: {data.child.phone}</p>
      <p className="py-2">Grade: {data.child.age}</p>
      <p className="py-2">DOB: {data.child.dob.substring(0, 10)}</p>
      <p className="py-2">
        Medical concerns: {data.child.medical ? data.child.medical : "none"}
      </p>

      <div className="mx-auto my-4 w-full pb-1">
        <img src={data.child.qrcode} alt={"child qr code"} />
      </div>

      <hr className="my-4" />
      <div className="flex">
        <Link
          to={`/registrants/${data.child.id}-edit`}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400"
        >
          Edit
        </Link>

        <Form method="post">
          <input type="hidden" name="registrantId" value={data.child.id} />
          <input type="hidden" name="phone" value={data.child.phone} />
          <input
            type="hidden"
            name="registrant"
            value={data.child.registrant}
          />
          <input type="hidden" name="qrcode" value={data.child.qrcode} />
          <input
            type="hidden"
            name="email"
            value={data.child.email.toLowerCase()}
          />
          <button
            type="submit"
            name="_action"
            value="sendQrCode"
            className="mx-2 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400"
          >
            Send QR Code
          </button>
        </Form>
        {/* <Form method="post">
          <input type="hidden" name="phone" value={data.child.phone} />
          <input
            type="hidden"
            name="registrant"
            value={data.child.registrant}
          />
          <button
            type="submit"
            name="_action"
            value="textQrCode"
            className="mx-2 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400"
          >
            Text QR Code
          </button>
        </Form> */}
      </div>
      <Form method="post">
        <button
          type="submit"
          name="_action"
          value="deleteChild"
          className="my-2 rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600 focus:bg-red-400"
        >
          Delete
        </button>
      </Form>
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (error instanceof Error) {
    return <div>An unexpected error occurred: {error.message}</div>;
  }

  if (!isRouteErrorResponse(error)) {
    return <h1>Unknown Error</h1>;
  }

  if (error.status === 404) {
    return <div>Note not found</div>;
  }

  return <div>An unexpected error occurred: {error.statusText}</div>;
}
