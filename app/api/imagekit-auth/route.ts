// in app/api/imagekit-auth/route.ts

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import ImageKit from "imagekit";

const imagekit = new ImageKit({
    publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
    urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!
});

export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // This function generates the required security parameters
        const authenticationParameters = imagekit.getAuthenticationParameters();

        // THIS IS THE FIX: Return the parameters directly
        return NextResponse.json(authenticationParameters);

    } catch (error) {
        console.error("Error generating ImageKit authentication parameters:", error);
        return NextResponse.json(
            { error: "Could not generate authentication parameters." },
            { status: 500 }
        );
    }
}