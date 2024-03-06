import type { User, Child } from "@prisma/client";

import { prisma } from "~/db.server";

export function getChild(id: Child["id"]) {
  return prisma.child.findUnique({
    where: { id },
    include: { user: true },
  });
}

export function getAllChildren() {
  return prisma.child.findMany();
}

export function getChildListItems(userId: User["id"]) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: { children: true },
  });
}

export function createChild({
  userId,
  name,
  age,
  grade,
  medical,
  qrcode,
  picPermission,
  tshirtSize,
  transportation,
  emergencyContactName,
  emergencyContactPhone,
  checkedIn,
}: Pick<
  Child,
  | "name"
  | "age"
  | "grade"
  | "medical"
  | "qrcode"
  | "picPermission"
  | "tshirtSize"
  | "transportation"
  | "emergencyContactName"
  | "emergencyContactPhone"
  | "checkedIn"
> & {
  userId: User["id"];
}) {
  return prisma.child.create({
    data: {
      name,
      age,
      grade,
      medical,
      qrcode,
      picPermission,
      tshirtSize,
      transportation,
      emergencyContactName,
      emergencyContactPhone,
      checkedIn,
      userId,
    },
  });
}

export async function updateChild(
  id: Child["id"],
  name: string,
  age: number,
  grade: string,
  userId: User["id"],
  medical: string,
  qrcode: string,
  picPermission: boolean,
  tshirtSize: string,
  transportation: boolean,
  emergencyContactName: string,
  emergencyContactPhone: string,
  checkedIn: boolean
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
      name,
      age,
      grade,
      userId,
      medical,
      qrcode,
      picPermission,
      tshirtSize,
      transportation,
      emergencyContactName,
      emergencyContactPhone,
      checkedIn,
    },
  });
}

export function deleteChild(id: Child["id"]) {
  return prisma.child.delete({
    where: { id },
  });
}
