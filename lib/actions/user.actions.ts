"use server";

import {
  shippingAddressSchema,
  signInFormSchema,
  signUpFormSchema,
  paymentMethodSchema,
  updateUserRoleSchema,
  updateProfileSchema,
  updatePasswordSchema,
} from "../validator";
import { auth, signIn, signOut } from "@/auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { hashSync, compareSync } from "bcrypt-ts-edge";
import { prisma } from "@/db/prisma";
import { formatError } from "../utils";
import { ShippingAddress } from "@/types";
import { PAGE_SIZE } from "../constants";
import { requireAdmin } from "@/lib/auth-guard";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import z from "zod";

// Sign in rhe user with credentials

export async function signInwithCredentials(
  prevState: unknown,
  formData: FormData
) {
  try {
    const user = signInFormSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    });
    await signIn("credentials", user);
    return { success: true, message: "Signed in successfully" };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    return { success: false, message: "Invalid email or password" };
  }
}
// sign out the user

export async function signOutUser() {
  await signOut();
}

// Sign up the user with credentials

export async function signUpUser(prevState: unknown, formData: FormData) {
  try {
    const user = signUpFormSchema.parse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    });
    const plainPassword = user.password;
    // Store emails lower-cased: the unique index is case-sensitive, so without
    // this "A@b.com" and "a@b.com" would become two separate accounts.
    const email = user.email.toLowerCase();
    user.password = hashSync(user.password, 10);
    await prisma.user.create({
      data: {
        name: user.name,
        email,
        password: user.password,
      },
    });

    await signIn("credentials", {
      email,
      password: plainPassword,
    });
    return { success: true, message: "User Registered successfully" };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    return { success: false, message: formatError(error) };
  }
}

// Get user by the ID
export async function getUserById(userId: string) {
  const user = await prisma.user.findFirst({
    where: { id: userId },
  });
  if (!user) throw new Error("User not found");
  return user;
}
// Update the user's address
export async function updateUserAddress(data: ShippingAddress) {
  try {
    const session = await auth();

    const currentUser = await prisma.user.findFirst({
      where: { id: session?.user?.id },
    });

    if (!currentUser) throw new Error("User not found");

    const address = shippingAddressSchema.parse(data);

    await prisma.user.update({
      where: { id: currentUser.id },
      data: { address },
    });

    return {
      success: true,
      message: "User updated successfully",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Update user's payment method
export async function updateUserPaymentMethod(
  data: z.infer<typeof paymentMethodSchema>
) {
  try {
    const session = await auth();
    const currentUser = await prisma.user.findFirst({
      where: { id: session?.user?.id },
    });

    if (!currentUser) throw new Error("User not found");

    const paymentMethod = paymentMethodSchema.parse(data);

    await prisma.user.update({
      where: { id: currentUser.id },
      data: { paymentMethod: paymentMethod.type },
    });

    return {
      success: true,
      message: "User updated successfully",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
// Update the user profile (name, and optionally email with a password check)
export async function updateProfile(user: {
  name: string;
  email: string;
  currentPassword?: string;
}) {
  try {
    const session = await auth();

    const currentUser = await prisma.user.findFirst({
      where: {
        id: session?.user?.id,
      },
    });

    if (!currentUser) throw new Error('User not found');

    const parsed = updateProfileSchema.parse(user);
    const { name, currentPassword } = parsed;
    const email = parsed.email.toLowerCase();

    const emailChanged = email !== currentUser.email.toLowerCase();

    if (emailChanged) {
      // Email is the credential login identifier, so gate the change on the
      // current password.
      if (!currentUser.password) {
        throw new Error('This account cannot change its email');
      }
      if (
        !currentPassword ||
        !compareSync(currentPassword, currentUser.password)
      ) {
        throw new Error('Current password is incorrect');
      }

      // Make sure the new email isn't already used by another account.
      const existing = await prisma.user.findFirst({ where: { email } });
      if (existing && existing.id !== currentUser.id) {
        throw new Error('Email already exists');
      }
    }

    await prisma.user.update({
      where: {
        id: currentUser.id,
      },
      data: {
        name,
        ...(emailChanged ? { email } : {}),
      },
    });

    return {
      success: true,
      message: 'Profile updated successfully',
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Change the signed-in user's password
export async function updatePassword(data: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}) {
  try {
    const session = await auth();

    const currentUser = await prisma.user.findFirst({
      where: {
        id: session?.user?.id,
      },
    });

    if (!currentUser) throw new Error('User not found');
    if (!currentUser.password) {
      throw new Error('This account has no password set');
    }

    const { currentPassword, newPassword } = updatePasswordSchema.parse(data);

    if (!compareSync(currentPassword, currentUser.password)) {
      throw new Error('Current password is incorrect');
    }

    await prisma.user.update({
      where: { id: currentUser.id },
      data: { password: hashSync(newPassword, 10) },
    });

    return {
      success: true,
      message: 'Password updated successfully',
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Get all users (admin)
export async function getAllUsers({
  limit = PAGE_SIZE,
  page,
  query,
}: {
  limit?: number;
  page: number;
  query?: string;
}) {
  await requireAdmin();

  const queryFilter: Prisma.UserWhereInput =
    query && query !== 'all'
      ? {
          name: {
            contains: query,
            mode: 'insensitive',
          } as Prisma.StringFilter,
        }
      : {};

  const data = await prisma.user.findMany({
    where: { ...queryFilter },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: (page - 1) * limit,
  });

  const dataCount = await prisma.user.count({ where: { ...queryFilter } });

  return {
    data,
    totalPages: Math.ceil(dataCount / limit),
  };
}

// Delete a user (admin)
export async function deleteUser(id: string) {
  const session = await requireAdmin();
  try {
    if (session?.user?.id === id) {
      return { success: false, message: 'You cannot delete your own account' };
    }

    await prisma.user.delete({ where: { id } });

    revalidatePath('/admin/users');

    return {
      success: true,
      message: 'User deleted successfully',
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Update a user's role (admin)
export async function updateUserRole(userId: string, role: string) {
  const session = await requireAdmin();
  try {
    if (session?.user?.id === userId) {
      return { success: false, message: 'You cannot change your own role' };
    }

    const data = updateUserRoleSchema.parse({ userId, role });

    await prisma.user.update({
      where: { id: data.userId },
      data: { role: data.role },
    });

    revalidatePath('/admin/users');

    return {
      success: true,
      message: 'User role updated successfully',
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
