// in app/api/files/upload/route.ts

import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import ImageKit from "imagekit";
import { v4 as uuidv4 } from "uuid";

// Initialize ImageKit SDK
const imagekit = new ImageKit({
    publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
    urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!
});
console.log(1)
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
console.log(2)
        // --- Improved Parent Folder Logic ---
        let parentFolderPath = `/droply/${userId}`; // Default to root folder
        if (parentId) {
            const [parentFolder] = await db
                .select()
                .from(files)
                .where(
                    and(
                        eq(files.id, parentId),
                        eq(files.userId, userId),
                        eq(files.isFolder, true)
                    )
                );

            if (!parentFolder) {
                return NextResponse.json({ error: "Parent folder not found" }, { status: 404 });
            }
            parentFolderPath = parentFolder.path; // Use the parent folder's path
        }
        // --- End of Improved Logic ---
console.log(3)
        const buffer = await file.arrayBuffer();
        const fileBuffer = Buffer.from(buffer);
        const originalName = file.name;
console.log(3.5)
        // Upload to ImageKit
        const uploadResponse = await imagekit.upload({
            file: fileBuffer,
            fileName: originalName, // Let ImageKit handle unique naming if needed, or use uuidv4()
            folder: parentFolderPath,
            useUniqueFileName: true, // Recommended to avoid name conflicts
        });
console.log(4)
        // Prepare data for our database
        const fileData = {
            userId,
            name: originalName,
            path: uploadResponse.filePath,
            size: file.size,
            type: file.type,
            fileUrl: uploadResponse.url,
            thumbnailUrl: uploadResponse.thumbnailUrl,
            parentId: parentId, // This can be null for root files
            isFolder: false,
        };

        const [newFile] = await db.insert(files).values(fileData).returning();
console.log(5)
        return NextResponse.json(newFile, { status: 201 });

    } catch (error) {
        console.error("File upload error:", error);
        return NextResponse.json({ error: "Internal Server Error during file upload" }, { status: 500 });
    }
}