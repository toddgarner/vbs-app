import type { ActionArgs, AppData, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { useEffect, useRef } from "react";
import invariant from "tiny-invariant";

import { getChild, updateChild } from "~/models/registration.server";
import { requireUserId } from "~/session.server";

export const loader = async ({ params, request }: LoaderArgs) => {
  const userId = await requireUserId(request);
  invariant(params.registrantId, "Child not found");

  const child = await getChild(params.registrantId);
  if (!child) {
    throw new Response("Not Found", { status: 404 });
  }
  return json({ child });
};

export const action = async ({ request }: ActionArgs) => {
  const userId = await requireUserId(request);
  const formData = await request.formData();
  const name = formData.get("name");
  const age = formData.get("age")?.toString() || "";
  const grade = formData.get("grade")?.toString() || "";
  const childId = formData.get("childId")?.toString() || "";
  const qrcode = formData.get("qrcode")?.toString() || "";
  const medical = formData.get("medical")?.toString() || "";
  const tshirtSize = formData.get("tshirtSize")?.toString() || "";
  const picPermission = formData.get("picPermission") === "on" ? true : false;
  const transportation = formData.get("transportation") === "on" ? true : false;
  const emergencyContactName =
    formData.get("emergencyContactName")?.toString() || "";
  const emergencyContactPhone =
    formData.get("emergencyContactPhone")?.toString() || "";

  const guardianId = userId;

  if (typeof name !== "string" || name.length === 0) {
    return json(
      {
        errors: {
          name: "Child name is required",
          age: null,
          grade: null,
          emergencyContactName: null,
          emergencyContactPhone: null,
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
          name: null,
          age: "Age is required",
          grade: null,
          emergencyContactName: null,
          emergencyContactPhone: null,
        },
      },
      { status: 400 }
    );
  } else if (isNaN(ageInt)) {
    return json(
      {
        errors: {
          name: null,
          age: "Age must be a number",
          grade: null,
          emergencyContactName: null,
          emergencyContactPhone: null,
        },
      },
      { status: 400 }
    );
  }

  if (typeof grade !== "string" || grade.length === 0) {
    return json(
      {
        errors: {
          name: null,
          age: null,
          grade: "Grade is required",
          emergencyContactName: null,
          emergencyContactPhone: null,
        },
      },
      { status: 400 }
    );
  }

  if (
    typeof emergencyContactName !== "string" ||
    emergencyContactName.length === 0
  ) {
    return json(
      {
        errors: {
          name: null,
          age: null,
          grade: null,
          emergencyContactName: "Emergency contact is required",
          emergencyContactPhone: null,
        },
      },
      { status: 400 }
    );
  }

  const phoneRegex: RegExp =
    /^(\([0-9]{3}\)|[0-9]{3})[- ]?[0-9]{3}[- ]?[0-9]{4}$/gm;

  if (
    typeof emergencyContactPhone !== "string" ||
    emergencyContactPhone.length === 0
  ) {
    return json(
      {
        errors: {
          name: null,
          age: null,
          grade: null,
          emergencyContactName: null,
          emergencyContactPhone: "Emergency contact phone is required",
        },
      },
      { status: 400 }
    );
  } else if (!phoneRegex.test(emergencyContactPhone)) {
    return json(
      {
        errors: {
          name: null,
          age: null,
          grade: null,
          emergencyContactName: null,
          emergencyContactPhone: "Emergency contact phone is invalid",
        },
      },
      { status: 400 }
    );
  }

  const child = await getChild(childId);

  if (child) {
    await updateChild(
      child.id,
      name,
      ageInt,
      grade,
      child.userId,
      medical,
      qrcode,
      child.photoUrl,
      picPermission,
      tshirtSize,
      transportation,
      emergencyContactName,
      emergencyContactPhone,
      child.checkedIn
    );
  }

  if (child) {
    return redirect(`/registrants/${child.id}`);
  } else {
    return redirect(`/registrants`);
  }
};

export default function NewNotePage() {
  const data = useLoaderData<AppData>();
  const actionData = useActionData<typeof action>();
  const nameRef = useRef<HTMLInputElement>(null) as any;
  const ageRef = useRef<HTMLTextAreaElement>(null) as any;
  const gradeRef = useRef<HTMLTextAreaElement>(null) as any;
  const medicalRef = useRef<HTMLTextAreaElement>(null) as any;
  const emergencyContactNameRef = useRef<HTMLTextAreaElement>(null) as any;
  const emergencyContactPhoneRef = useRef<HTMLTextAreaElement>(null) as any;

  useEffect(() => {
    if (actionData?.errors?.name) {
      nameRef.current?.focus();
    } else if (actionData?.errors?.name) {
      ageRef.current?.focus();
    } else if (actionData?.errors?.age) {
      gradeRef.current?.focus();
    }
    // else if (actionData?.errors?.medical) {
    //   medicalRef.current?.focus();
    // }
  }, [actionData]);

  return (
    <div className="mx-auto w-4/5 text-lg font-semibold text-gray-700">
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
            <span>Child Name: </span>
            <input
              ref={nameRef}
              name="name"
              required
              defaultValue={data.child.name}
              className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
              aria-invalid={actionData?.errors?.name ? true : undefined}
              aria-errormessage={
                actionData?.errors?.name ? "name-error" : undefined
              }
            />
          </label>
          {actionData?.errors?.name ? (
            <div className="pt-1 text-red-700" id="name-error">
              {actionData.errors.name}
            </div>
          ) : null}
        </div>

        <div>
          <label className="flex w-32 flex-col gap-1">
            <span>Child Age: </span>
            <input
              ref={ageRef}
              name="age"
              required
              defaultValue={+data.child.age}
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
          <label className="flex w-32 flex-col gap-1">
            <span>Grade: </span>
            <input
              ref={gradeRef}
              name="grade"
              required
              defaultValue={data.child.grade}
              maxLength={2}
              className="w-16 flex-1 rounded-md border-2 border-blue-500 px-3 py-2 text-lg leading-6"
            />
          </label>
          {actionData?.errors?.grade ? (
            <div className="pt-1 text-red-700" id="grade-error">
              {actionData.errors.grade}
            </div>
          ) : null}
        </div>

        <div>
          <label className="flex w-1/2 flex-col gap-1">
            <span>T-Shirt Size: </span>
            <select
              name="tshirtSize"
              required
              defaultValue={data.child.tshirtSize}
              className="w-1/2 flex-1 rounded-md border-2 border-blue-500 px-3 py-2 text-lg leading-6"
            >
              <option value="">Select size</option>
              <option value="YXS">Youth X-Small</option>
              <option value="YS">Youth Small</option>
              <option value="YM">Youth Medium</option>
              <option value="YL">Youth Large</option>
              <option value="YXL">Youth X-Large</option>
              <option value="S">Adult Small</option>
              <option value="M">Adult Medium</option>
              <option value="L">Adult Large</option>
              <option value="XL">Adult X-Large</option>
              <option value="XXL">Adult XX-Large</option>
            </select>
          </label>
        </div>

        <div>
          <label className="flex w-full flex-col gap-1">
            <span>Medical Concerns / Allergies: </span>
            <input
              ref={medicalRef}
              name="medical"
              defaultValue={data.child.medical}
              className="w-full flex-1 rounded-md border-2 border-blue-500 px-3 py-2 text-lg leading-6"
            />
          </label>
        </div>

        <div>
          <label className="flex w-full flex-col gap-1">
            <span>Emergency Contact Name: </span>
            <input
              name="emergencyContactName"
              ref={emergencyContactNameRef}
              required
              defaultValue={data.child.emergencyContactName}
              className="w-full flex-1 rounded-md border-2 border-blue-500 px-3 py-2 text-lg leading-6"
            />
          </label>
          {actionData?.errors?.emergencyContactName ? (
            <div className="pt-1 text-red-700" id="grade-error">
              {actionData.errors.emergencyContactName}
            </div>
          ) : null}
        </div>
        <div>
          <label className="flex w-full flex-col gap-1">
            <span>Emergency Contact Phone: </span>
            <input
              name="emergencyContactPhone"
              ref={emergencyContactPhoneRef}
              required
              defaultValue={data.child.emergencyContactPhone}
              className="w-full flex-1 rounded-md border-2 border-blue-500 px-3 py-2 text-lg leading-6"
            />
          </label>
          {actionData?.errors?.emergencyContactPhone ? (
            <div className="pt-1 text-red-700" id="grade-error">
              {actionData.errors.emergencyContactPhone}
            </div>
          ) : null}
        </div>

        <div className="grid gap-2">
          <label
            className="grid grid-cols-2 items-center gap-1"
            style={{ gridTemplateColumns: "3fr 1fr" }}
          >
            <span>
              Please unselect if you do not give permission for your child's
              picture to be used:{" "}
            </span>
            <input
              name="picPermission"
              type="checkbox"
              defaultChecked={data.child.picPermission}
              className="justify-self-center rounded-md border-2 border-blue-500 px-3 py-2 text-lg leading-6"
              style={{ transform: "scale(1.5)" }}
            />
          </label>

          <label
            className="grid grid-cols-2 items-center gap-1"
            style={{ gridTemplateColumns: "3fr 1fr" }}
          >
            <span>Please select if your child needs transportation: </span>
            <input
              name="transportation"
              type="checkbox"
              defaultChecked={data.child.transportation}
              className="justify-self-center rounded-md border-2 border-blue-500 px-3 py-2 text-lg leading-6"
              style={{ transform: "scale(1.5)" }}
            />
          </label>
        </div>
        <div className="mt-2 text-center">
          <button
            type="submit"
            className="w-64 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400"
          >
            Submit
          </button>
        </div>

        <input type="hidden" name="childId" value={data.child.id} />
        <input type="hidden" name="qrcode" value={data.child.qrcode} />
        <input type="hidden" name="photoUrl" value={data.child.photoUrl} />
      </Form>
    </div>
  );
}
