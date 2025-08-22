// in app/api/files/route.ts

import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, and, isNull, desc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = request.nextUrl;
        const parentId = searchParams.get("parentId");
        const isStarred = searchParams.get("isStarred") === 'true';
        const isTrash = searchParams.get("isTrash") === 'true';

        // Start with the base condition for the user
        const conditions = [eq(files.userId, userId)];

        // --- New Filtering Logic ---
        if (isStarred) {
            // If filtering for starred, show only non-trashed, starred files
            conditions.push(eq(files.isStarred, true));
            conditions.push(eq(files.isTrash, false));
        } else if (isTrash) {
            // If filtering for trash, show only trashed files
            conditions.push(eq(files.isTrash, true));
        } else {
            // This is the default "Home" or "My Drive" view
            conditions.push(eq(files.isTrash, false));
            if (parentId) {
                conditions.push(eq(files.parentId, parentId));
            } else {
                conditions.push(isNull(files.parentId));
            }
        }
        // --- End of New Logic ---

        const userFiles = await db
            .select()
            .from(files)
            .where(and(...conditions))
            .orderBy(desc(files.updatedAt)); // Order by most recently updated

        return NextResponse.json({ files: userFiles });

    } catch (error) {
        console.error("Error fetching files:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}