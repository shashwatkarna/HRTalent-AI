"use server";

import { createClient } from "@/utils/supabase/server";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser || !authUser.email) {
      return { error: "Unauthorized access" };
    }

    const name = formData.get("name") as string;
    const contactNumber = formData.get("contactNumber") as string;
    const address = formData.get("address") as string;
    const image = formData.get("image") as string; // Base64 data URL

    // 1. Fetch current user to find their profile ID
    const user = await db.user.findUnique({
      where: { email: authUser.email },
      include: { employeeProfile: true }
    });

    if (!user) {
      return { error: "User record not found in database." };
    }

    // 2. Prepare update data for User model
    const userUpdateData: any = {};
    if (name !== null) userUpdateData.name = name;
    if (image !== null) userUpdateData.image = image;

    // Update User
    await db.user.update({
      where: { id: user.id },
      data: userUpdateData,
    });

    // 3. Update or Create EmployeeProfile
    if (user.employeeProfile) {
      await db.employeeProfile.update({
        where: { id: user.employeeProfile.id },
        data: {
          contactNumber: contactNumber || null,
          address: address || null,
        }
      });
    } else {
      await db.employeeProfile.create({
        data: {
          userId: user.id,
          employeeId: `EMP-${Math.floor(Math.random() * 9000 + 1000)}`,
          contactNumber: contactNumber || null,
          address: address || null,
          designation: user.role.replace("_", " "),
          employmentStatus: "ACTIVE",
        }
      });
    }

    revalidatePath("/profile");
    revalidatePath("/"); // Revalidate root layout header
    return { success: true };
  } catch (error: any) {
    console.error("Update Profile Server Action Error:", error);
    return { error: error.message || "Failed to update profile details." };
  }
}
