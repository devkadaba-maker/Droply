import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
export async function DELETE(request: NextRequest){

    try {
        const {userId} = await auth()

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const deleted = await db
        .delete(files)
        .where(
            and(
            eq(files.isTrash, true), 
            eq(files.userId, userId)
        )).returning()

        return NextResponse.json({ message: "Trash emptied successfully", deletedCount: deleted.length }, { status: 200 })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: "Internal server error with the delete endpoint" }, { status: 500 })
    }
}