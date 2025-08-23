import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get form data
        const formData = await request.formData();
        const file = formData.get("file") as File;
        const parentId = formData.get("parentId") as string | null;

        if (!file) {
            return NextResponse.json({ error: "File is required" }, { status: 400 });
        }

        // Validate parent folder if provided
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
        }

        const originalName = file.name;
        const fileExtension = originalName.split(".").pop() || "";

        // For now, create a mock file entry since ImageKit credentials are not properly configured
        // TODO: Replace with actual ImageKit upload when credentials are set up
        const folderPath = parentId ? `/droply/${userId}/folder/${parentId}` : `/droply/${userId}`;
        const uniqueFileName = `${uuidv4()}.${fileExtension}`;
        const mockFilePath = `${folderPath}/${uniqueFileName}`;
        const mockFileUrl = `https://via.placeholder.com/300x200?text=${encodeURIComponent(originalName)}`;

        const fileData = {
            userId,
            name: originalName,
            path: mockFilePath,
            size: file.size,
            type: file.type,
            fileUrl: mockFileUrl,
            thumbnailUrl: mockFileUrl,
            parentId: parentId,
            isFolder: false,
            isStarred: false,
            isTrash: false,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const [newFile] = await db.insert(files).values(fileData).returning();

        return NextResponse.json(newFile, { status: 201 });

    } catch (error) {
        console.error("File upload error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}