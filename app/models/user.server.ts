import type { Password, User } from "@prisma/client";
import bcrypt from "bcryptjs";

import { prisma } from "~/db.server";

export async function getUserById(id: User["id"]) {
  return prisma.user.findUnique({
    where: { id },
    include: {
      role: true,
      children: true,
    },
  });
}

export async function getUserByEmail(email: User["email"]) {
  return prisma.user.findUnique({
    where: { email },
    include: {
      role: true,
      children: true,
    },
  });
}

export async function createUser(
  email: User["email"],
  password: string,
  roleId: number,
  phone: User["phone"],
  name: User["name"]
) {
  const hashedPassword = await bcrypt.hash(password, 10);

  const role = await prisma.role.findUnique({ where: { id: roleId } });
  if (!role) {
    throw new Error(`Role with ID ${roleId} does not exist`);
  }

  return prisma.user.create({
    data: {
      email,
      phone,
      name,
      roleId,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  });
}

export async function deleteUserByEmail(email: User["email"]) {
  return prisma.user.delete({ where: { email } });
}

export async function verifyLogin(
  email: User["email"],
  password: Password["hash"]
) {
  const userWithPassword = await prisma.user.findUnique({
    where: { email },
    include: {
      password: true,
    },
  });

  if (!userWithPassword || !userWithPassword.password) {
    return null;
  }

  const isValid = await bcrypt.compare(
    password,
    userWithPassword.password.hash
  );

  if (!isValid) {
    return null;
  }

  const { password: _password, ...userWithoutPassword } = userWithPassword;

  return userWithoutPassword;
}
