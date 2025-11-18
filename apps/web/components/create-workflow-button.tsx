"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@repo/ui/button";

export function CreateWorkflowButton() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleCreate = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("http://localhost:3002/workflows", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: `Protocol-${Math.floor(Math.random() * 10000)}`,
                    nodes: [],
                    edges: [],
                }),
            });

            if (!res.ok) {
                throw new Error("Failed to create workflow");
            }

            const data = await res.json();
            router.push(`/workflow/${data.id}`);
        } catch (error) {
            console.error(error);
            alert("Failed to initialize protocol. Check console for details.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            onClick={handleCreate}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white border border-blue-400/50 shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all hover:shadow-[0_0_25px_rgba(59,130,246,0.8)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {isLoading ? "Initializing..." : "Initialize Protocol"}
        </Button>
    );
}
