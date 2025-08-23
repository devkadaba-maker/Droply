import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import ImageKit from "imagekit";

// Initialize ImageKit - this should be done once
const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const parentId = formData.get("parentId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    // --- Start of ImageKit Upload Logic ---

    // 1. Convert the file to a buffer to prepare for upload
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // 2. Use the ImageKit SDK to upload the file
    const uploadResponse = await imagekit.upload({
      file: fileBuffer,
      fileName: file.name,
      folder: `/droply/${userId}/`, // Optional: organize files in ImageKit
    });

    // --- End of ImageKit Upload Logic ---


    // 3. Prepare file data for your database, now using the REAL URL from ImageKit
    const fileId = uuidv4();
    const newFileData = {
      id: fileId,
      name: file.name,
      path: uploadResponse.filePath, // Store the ImageKit path
      size: file.size,
      type: file.type,
      fileUrl: uploadResponse.url, // THIS IS THE CRUCIAL REAL URL
      thumbnailUrl: uploadResponse.thumbnailUrl, // ImageKit provides a thumbnail too!
      isFolder: false,
      userId,
      parentId,
      isStarred: false,
      isTrash: false,
    };

    // 4. Insert the new file record into your database
    const [newFile] = await db.insert(files).values(newFileData).returning();

    return NextResponse.json(
      { success: true, message: "File uploaded successfully", file: newFile },
      { status: 201 }
    );

  } catch (error) {
    console.error("Error uploading file:", error);
    // Provide a more specific error message if it's an ImageKit error
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { error: "Failed to upload file.", details: errorMessage },
      { status: 500 }
    );
  }
}