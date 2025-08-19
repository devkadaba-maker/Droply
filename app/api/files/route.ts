import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, and, isNull, } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server";


export async function GET(request: NextRequest){
    try {
        const { userId } = await auth();
        if(!userId){
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        
        const searchParams = request.nextUrl.searchParams;
        const queryUserId = searchParams.get("userId");
        const parentId = searchParams.get("parentId")
        
        if(!queryUserId||queryUserId !== userId){
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        //get all files
        let userFiles;
        if(parentId){
            //fetching from a specific folder
            const userFiles = await db
            .select()
            .from(files)
            .where(
                and(
                    eq(files.userId, userId), 
                    eq(files.parentId, parentId), 


                )
            )
        }else{
            userFiles = await db 
            .select()
            .from(files)
            .where(
                and(
                    eq(files.userId, userId), 
                    isNull(files.parentId)

                )
            )
        }
        return NextResponse.json({
            message: "Files fetched successfully", 
            status: 200, 
            files: userFiles
        })

    } catch (error) {
        NextResponse.json({ error: "Internal Server Error, In the fethcing files section, routes.ts in the files folder." }, { status: 500 });
        
    }


}