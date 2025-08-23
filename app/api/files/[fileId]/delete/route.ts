import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";

export async function DELETE(request: NextRequest, props: { params: Promise<{ fileId: string }> }) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { fileId } = await props.params;
        if (!fileId) {
            return NextResponse.json({ error: "Invalid file ID" }, { status: 400 });
        }

        const deleted = await db
            .delete(files)
            .where(and(eq(files.id, fileId), eq(files.userId, userId)))
            .returning();

        if (deleted.length === 0) {
            return NextResponse.json({ error: "File not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "File deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal server error with the delete endpoint" }, { status: 500 });
    }
}
