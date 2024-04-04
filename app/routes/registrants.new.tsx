import type { ActionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { useEffect, useRef } from "react";
import { createQRCode } from "~/models/aws.server";
import { saveImage } from "~/models/image.server";
import * as crypto from "crypto";
import { createChild, updateChild } from "~/models/registration.server";
import { requireUserId } from "~/session.server";

export const action = async ({ request }: ActionArgs) => {
  const userId = await requireUserId(request);
  const formData = await request.formData();
  const name = formData.get("name");
  const age = formData.get("age")?.toString() || "";
  const grade = formData.get("grade")?.toString() || "";
  const medical = formData.get("medical")?.toString() || "";
  const tshirtSize = formData.get("tshirtSize")?.toString() || "";
  const picPermission = formData.get("picPermission") === "on" ? true : false;
  const transportation = formData.get("transportation") === "on" ? true : false;
  const emergencyContactName =
    formData.get("emergencyContactName")?.toString() || "";
  const emergencyContactPhone =
    formData.get("emergencyContactPhone")?.toString() || "";
  const photo = formData.get("photo") as File;

  let photoUrl = "";

  const photoName = crypto.randomUUID() + ".png";

  if (photo) {
    const arrayBuffer = await photo.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    photoUrl = await saveImage(photoName, buffer);
  }

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

  const child = await createChild({
    name,
    age: ageInt,
    grade,
    medical,
    qrcode: "",
    photoUrl,
    tshirtSize,
    picPermission,
    transportation,
    emergencyContactName,
    emergencyContactPhone,
    checkedIn: false,
    userId: guardianId,
  });

  const qrcode = await createQRCode(child.id);

  if (child) {
    await updateChild(
      child.id,
      child.name,
      child.age,
      child.grade,
      child.userId,
      child.medical,
      qrcode,
      child.photoUrl,
      child.picPermission,
      child.tshirtSize,
      child.transportation,
      child.emergencyContactName,
      child.emergencyContactPhone,
      child.checkedIn
    );
  }

  return redirect(`/registrants/${child.id}`);
};

export default function NewNotePage() {
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

  // function validateFile(event: React.ChangeEvent<HTMLInputElement>) {
  //   const file = event.target?.files?[0];
  //   const fileSize = file.size / 1024 / 1024; // size in MB
  //   const fileType = file.type;

  //   if (fileSize > 2) {
  //     // if file size is more than 2MB
  //     alert("The file is too large. Please upload a file smaller than 2MB.");
  //     event.target.value = ""; // reset the file input
  //   } else if (!fileType.startsWith("image/")) {
  //     // if file is not an image
  //     alert("The file is not an image. Please upload an image file.");
  //     event.target.value = ""; // reset the file input
  //   }
  // }

  return (
    <div className="mx-auto w-4/5 text-lg font-semibold text-gray-700">
      <Form
        method="post"
        encType="multipart/form-data"
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
              className="w-1/2 flex-1 rounded-md border-2 border-blue-500 px-3 py-2 text-lg leading-6"
            >
              <option value="">Select size</option>
              <option value="YXS">Youth X-Small</option>
              <option value="YS">Youth Small</option>
              <option value="YM">Youth Medium</option>
              <option value="YL">Youth Large</option>
              <option value="YXL">Youth X-Large</option>
              <option value="AS">Adult Small</option>
              <option value="AM">Adult Medium</option>
              <option value="AL">Adult Large</option>
              <option value="AXL">Adult X-Large</option>
            </select>
          </label>
        </div>

        <div>
          <label className="flex w-full flex-col gap-1">
            <span>Medical Concerns / Allergies: </span>
            <input
              ref={medicalRef}
              name="medical"
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
              defaultChecked={true}
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
              defaultChecked={false}
              className="justify-self-center rounded-md border-2 border-blue-500 px-3 py-2 text-lg leading-6"
              style={{ transform: "scale(1.5)" }}
            />
          </label>
        </div>
        <div>
          <label className="flex w-32 flex-col gap-1">
            <span>Child Photo: </span>
            <input
              name="photo"
              type="file"
              accept="image/*"
              className="w-96 flex-1 rounded-md border-2 border-blue-500 px-3 py-2 text-lg leading-6"
              // onChange={validateFile}
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
      </Form>
    </div>
  );
}
