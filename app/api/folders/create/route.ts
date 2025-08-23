import { files } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { name, parentId = null } = body;

        // Validate folder name
        if (!name || typeof name !== "string" || name.trim() === "") {
            return NextResponse.json({ error: "Folder name is required" }, { status: 400 });
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

        // Create folder
        const folderData = {
            name: name.trim(),
            path: `/folders/${userId}/${uuidv4()}`,
            size: 0,
            type: "folder",
            fileUrl: "",
            thumbnailUrl: null,
            isFolder: true,
            userId,
            parentId,
            isStarred: false,
            isTrash: false,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const [newFolder] = await db.insert(files).values(folderData).returning();

        return NextResponse.json({
            success: true,
            message: "Folder created successfully",
            folder: newFolder
        }, { status: 201 });

    } catch (error) {
        console.error("Error creating folder:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}