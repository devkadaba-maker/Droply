"use client"

import { ThemeProvider } from "next-themes";
import { HeroUIProvider } from "@heroui/react"

export interface ProviderProps{
    children: React.ReactNode
}

export function Providers({children}: ProviderProps){
    return(
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <HeroUIProvider>
                {children}
            </HeroUIProvider>
        </ThemeProvider>
    )
}