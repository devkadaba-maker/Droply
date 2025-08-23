import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// This function will handle PATCH requests to update the file's name
export async function PATCH(
  request: NextRequest,
  { params }: { params: { fileId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const fileId = params.fileId;
    // Get the new name from the request's body
    const { name } = await request.json();

    // Validate the new name to make sure it's not empty
    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json({ error: "Invalid name" }, { status: 400 });
    }

    // Update the file in the database where the ID and userId match
    const [updatedFile] = await db
      .update(files)
      .set({ 
          name: name.trim(),
          // We also update the 'updatedAt' timestamp
          updatedAt: new Date() 
        })
      .where(and(eq(files.id, fileId), eq(files.userId, userId)))
      .returning(); // Return the updated file data

    if (!updatedFile) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, file: updatedFile },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error renaming file:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}