import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { and, eq, isNull } from "drizzle-orm";
import ImageKit from "imagekit";
import {v4 as uuidv4 } from "uuid"

const imagekit = new ImageKit({
    publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "", 
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
    urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || ""
})


export async function POST(request: NextRequest){
    try {
        const {userId} = await auth()
        if(!userId){
            return NextResponse.json({error : "unauthorized"}, {status: 401})
        }
        //get form data
        const formData = await request.formData()
        const file = formData.get("file") as File
        const parentId = formData.get("parentId") as string || null

        const formUserId = formData.get("userId") as string
        if(formUserId !== userId){
            return NextResponse.json({error : "unauthorized"}, {status: 401})
        }
        
        if(!file){
            return NextResponse.json({error : "file is required"}, {status: 400})
        }

        if(parentId){
            const [parentFolder] = await db
            .select()
            .from(files)
            .where(
                and(
                    eq(files.id, parentId), 
                    eq(files.userId, userId),
                    eq(files.isFolder, true),
                ),
            )
        }else{
    return NextResponse.json({error : "parent folder not found"}, {status: 404})
}
if(!file.type.startsWith("image/") && !file.type.startsWith("application/pdf")){
    return NextResponse.json({error : "invalid file type"}, {status: 400})
}


const buffer =await file.arrayBuffer()
const fileBuffer = Buffer.from(buffer)
const originalName = file.name
const fileExtension = originalName.split("."). pop() || ""
//check for empty file extension
if(!fileExtension){
    return NextResponse.json({error : "invalid file name"}, {status: 400})
}
const uniqueFileName = `${uuidv4()}.${fileExtension}`



    const folderPath = parentId ? `/droply/${userId}/folder/${parentId}` : `/droply/${userId}`

    const uploadRespoonse = await imagekit.upload({
        file:fileBuffer, 
        fileName: uniqueFileName, 
        folder: folderPath, 
        useUniqueFileName: false
    })
const fileData = {
    userId, 
    name: originalName, 
    path: uploadRespoonse.filePath, 
    size: file.size, 
    type: file.type, 
    fileUrl: uploadRespoonse.url, 
    thumbnailUrl: uploadRespoonse.thumbnailUrl || null, 
    parentId : parentId, 
    isFolder: false, 
    isStarred: false, 
    isTrash: false, 
    createdAt: new Date(), 
    updatedAt: new Date()
}
const [newFile] = await db.insert(files).values(fileData).returning()

return NextResponse.json(newFile, {status: 200})

    } catch (error) {
        return NextResponse.json({error : "Internal Server Error"}, {status: 500})
    }
}