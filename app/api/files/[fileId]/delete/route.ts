import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";

export async function DELETE(request: NextRequest, props: {params: Promise<{fileId: string}>}){

    try {
        const {userId} = await auth()
        const {fileId} = await props.params

        if(!userId){
            return NextResponse.json({error: "Unauthorized"}, {status: 401})
        }

        if(!fileId){
            return NextResponse.json({error:"File not found"}, {status: 404})
        }

        const deletedFile = await db.delete(files).where(
            and(
                eq(files.id, fileId),
                eq(files.userId, userId)
            )
        )
        if(!deletedFile){
            return NextResponse.json({error: "File not found"}, {status: 404})
        }
        return NextResponse.json({message: "File deleted successfully"}, {status: 200})
    }catch(error){
        console.error(error)
        return NextResponse.json({error: "Internal server error with the delete endpoint"}, {status: 500})
    }
}