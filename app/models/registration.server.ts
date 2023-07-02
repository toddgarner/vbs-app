import type { User, Child } from "@prisma/client";

import { prisma } from "~/db.server";

export function getChild({
  id,
  userId,
}: Pick<Child, "id"> & {
  userId: User["id"];
}) {
  return prisma.child.findFirst({
    select: {
      id: true,
      registrant: true,
      email: true,
      phone: true,
      age: true,
      qrcode: true,
      dob: true,
      medical: true,
      status: true,
    },
    where: { id, userId },
  });
}

export function getChildListItems({ userId }: { userId: User["id"] }) {
  return prisma.child.findMany({
    where: { userId },
    select: {
      id: true,
      registrant: true,
      email: true,
      phone: true,
      age: true,
      qrcode: true,
      dob: true,
      medical: true,
      status: true,
    },
    orderBy: { updatedAt: "desc" },
  });
}

export function createChild({
  userId,
  registrant,
  age,
  phone,
  email,
  qrcode,
  dob,
  medical,
  status,
}: Pick<
  Child,
  | "registrant"
  | "age"
  | "phone"
  | "email"
  | "qrcode"
  | "dob"
  | "medical"
  | "status"
> & {
  userId: User["id"];
}) {
  return prisma.child.create({
    data: {
      registrant,
      age,
      phone,
      email,
      qrcode,
      dob,
      medical,
      status,
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });
}

export async function updateChild(
  id: string,
  registrant: string,
  age: number,
  phone: string,
  email: string,
  qrcode: string,
  dob: Date,
  medical: string,
  status: string
) {
  const childInScope = await prisma.child.findUnique({ where: { id } });

  if (!childInScope) {
    throw new Error(`Child with ID ${id} not found.`);
  }

  return prisma.child.update({
    where: {
      id: childInScope.id,
    },
    data: {
      registrant,
      age,
      phone,
      email,
      qrcode,
      dob,
      medical,
      status,
    },
  });
}

export function deleteChild({
  id,
  userId,
}: Pick<Child, "id"> & { userId: User["id"] }) {
  return prisma.child.deleteMany({
    where: { id, userId },
  });
}
