import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { useEffect, useRef } from "react";
import invariant from "tiny-invariant";

import { getChild, updateChild } from "~/models/registration.server";
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

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData();
  const registrant = formData.get("registrant");
  const email = formData.get("email");
  const age = formData.get("age")?.toString() || "";
  const phone = formData.get("phone");
  const childId = formData.get("childId")?.toString() || "";
  const qrcode = formData.get("qrcode")?.toString() || "";
  const dobForm = formData.get("dob")?.toString();
  const medical = formData.get("medical")?.toString() || "";

  let dob = new Date();

  if (dobForm) {
    dob = new Date(dobForm);
  }

  if (typeof registrant !== "string" || registrant.length === 0) {
    return json(
      {
        errors: {
          email: null,
          registrant: "Registrant is required",
          age: null,
          phone: null,
          dob: null,
        },
      },
      { status: 400 }
    );
  }

  if (typeof email !== "string" || email.length === 0) {
    return json(
      {
        errors: {
          email: "Email is required",
          registrant: null,
          age: null,
          phone: null,
          dob: null,
        },
      },
      { status: 400 }
    );
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json(
      {
        errors: {
          email: "Email is invalid",
          registrant: null,
          age: null,
          phone: null,
          dob: null,
        },
      },
      { status: 400 }
    );
  }

  const ageInt = parseInt(age);

  if (typeof age !== "string" || age.length === 0) {
    return json(
      {
        errors: {
          email: null,
          registrant: null,
          age: "Age is required",
          phone: null,
          dob: null,
        },
      },
      { status: 400 }
    );
  } else if (isNaN(ageInt)) {
    return json(
      {
        errors: {
          email: null,
          registrant: null,
          age: "Age must be a number",
          phone: null,
          dob: null,
        },
      },
      { status: 400 }
    );
  }

  const phoneRegex: RegExp =
    /^(\([0-9]{3}\)|[0-9]{3})[- ]?[0-9]{3}[- ]?[0-9]{4}$/gm;

  if (typeof phone !== "string" || phone.length === 0) {
    return json(
      {
        errors: {
          email: null,
          registrant: null,
          age: null,
          phone: "Phone is required",
        },
      },
      { status: 400 }
    );
  } else if (!phoneRegex.test(phone)) {
    return json(
      {
        errors: {
          email: null,
          registrant: null,
          age: null,
          phone: "Phone is invalid",
        },
      },
      { status: 400 }
    );
  }

  const child = await updateChild(
    childId,
    registrant,
    ageInt,
    phone,
    email,
    qrcode,
    dob,
    medical
  );

  return redirect(`/registrants/${child.id}`);
};

export default function NewNotePage() {
  const data = useLoaderData<LoaderData>();
  const actionData = useActionData<typeof action>();
  const registrantRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLTextAreaElement>(null);
  const ageRef = useRef<HTMLTextAreaElement>(null);
  const phoneRef = useRef<HTMLTextAreaElement>(null);
  const dobRef = useRef<HTMLTextAreaElement>(null);
  const medicalRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (actionData?.errors?.registrant) {
      registrantRef.current?.focus();
    } else if (actionData?.errors?.body) {
      emailRef.current?.focus();
    } else if (actionData?.errors?.age) {
      ageRef.current?.focus();
    } else if (actionData?.errors?.phone) {
      phoneRef.current?.focus();
    }
  }, [actionData]);

  return (
    <Form
      method="post"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        width: "100%",
      }}
    >
      <div>
        <label className="flex w-full flex-col gap-1">
          <span>registrant: </span>
          <input
            ref={registrantRef}
            defaultValue={data.child.registrant}
            name="registrant"
            className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
            aria-invalid={actionData?.errors?.registrant ? true : undefined}
            aria-errormessage={
              actionData?.errors?.registrant ? "registrant-error" : undefined
            }
          />
        </label>
        {actionData?.errors?.registrant ? (
          <div className="pt-1 text-red-700" id="registrant-error">
            {actionData.errors.registrant}
          </div>
        ) : null}
      </div>

      <div>
        <label className="flex w-full flex-col gap-1">
          <span>Email: </span>
          <input
            ref={emailRef}
            defaultValue={data.child.email}
            name="email"
            className="w-full flex-1 rounded-md border-2 border-blue-500 px-3 py-2 text-lg leading-6"
            aria-invalid={actionData?.errors?.email ? true : undefined}
            aria-errormessage={
              actionData?.errors?.email ? "email-error" : undefined
            }
          />
        </label>
        {actionData?.errors?.email ? (
          <div className="pt-1 text-red-700" id="email-error">
            {actionData.errors.email}
          </div>
        ) : null}
      </div>

      <div>
        <label className="flex w-16 flex-col gap-1">
          <span>Grade: </span>
          <input
            ref={ageRef}
            name="age"
            defaultValue={data.child.age}
            maxLength={2}
            className="w-16 flex-1 rounded-md border-2 border-blue-500 px-3 py-2 text-lg leading-6"
            aria-invalid={actionData?.errors?.age ? true : undefined}
            aria-errormessage={
              actionData?.errors?.age ? "age-error" : undefined
            }
          />
        </label>
        {actionData?.errors?.age ? (
          <div className="pt-1 text-red-700" id="age-error">
            {actionData.errors.age}
          </div>
        ) : null}
      </div>

      <div>
        <label className="flex w-64 flex-col gap-1">
          <span>DOB: </span>
          <input
            ref={dobRef}
            name="dob"
            type="date"
            defaultValue={data.child.dob.substring(0, 10)}
            className="w-64 flex-1 rounded-md border-2 border-blue-500 px-3 py-2 text-lg leading-6"
            aria-invalid={actionData?.errors?.dob ? true : undefined}
            aria-errormessage={
              actionData?.errors?.age ? "dob-error" : undefined
            }
          />
        </label>
        {actionData?.errors?.dob ? (
          <div className="pt-1 text-red-700" id="dob-error">
            {actionData.errors.dob}
          </div>
        ) : null}
      </div>

      <div>
        <label className="flex w-full flex-col gap-1">
          <span>Phone: </span>
          <input
            ref={phoneRef}
            defaultValue={data.child.phone}
            name="phone"
            className="w-full flex-1 rounded-md border-2 border-blue-500 px-3 py-2 text-lg leading-6"
            aria-invalid={actionData?.errors?.phone ? true : undefined}
            aria-errormessage={
              actionData?.errors?.phone ? "phone-error" : undefined
            }
          />
        </label>
        {actionData?.errors?.phone ? (
          <div className="pt-1 text-red-700" id="phone-error">
            {actionData.errors.phone}
          </div>
        ) : null}
      </div>

      <div>
        <label className="flex w-full flex-col gap-1">
          <span>Medical Concerns: </span>
          <input
            ref={medicalRef}
            defaultValue={data.child.medical}
            name="medical"
            className="w-full flex-1 rounded-md border-2 border-blue-500 px-3 py-2 text-lg leading-6"
          />
        </label>
      </div>

      <div className="text-right">
        <button
          type="submit"
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400"
        >
          Save
        </button>
      </div>
      <input type="hidden" name="childId" value={data.child.id} />
      <input type="hidden" name="qrcode" value={data.child.qrcode} />
    </Form>
  );
}
