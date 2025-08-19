import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";

export async function PATCH(request: NextRequest, props: {params :Promise<{fileId: string}>}){
    try {
        const {userId} = await auth()
        if(!userId){
            return NextResponse.json({error: "Unauthorized"}, {status: 401})
        }
        
        const {fileId} = await props.params

        if(!fileId){
            return NextResponse.json({error: "Invalid file ID"}, {status: 400})
        }

        const [file] = await db.select().from(files).where(
            and(
                eq(files.id, fileId), 
                eq(files.userId, userId)
            )
        )
        if(!file){
            return NextResponse.json({error: "File not found"}, {status: 404})
        }

        const isStarred = file.isStarred

        const updatedFiles = await db.update(files).set({
            isTrash: !file.isTrash
        }).where(and(
            eq(files.id, fileId), 
            eq(files.userId, userId)
        )).returning()
        const updatedFile = updatedFiles[0]
        console.log(updatedFiles)

        return NextResponse.json(updatedFile, {status: 200})

    }catch(error){
        console.error("Error starring file", error)
        return NextResponse.json({error: "Internal server error"}, {status: 500})
    }
}