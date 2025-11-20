"use client"

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { Plus, Loader2, Calendar, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { WorkflowSidebar } from '@/components/workflow/workflow-sidebar'
import { formatDistanceToNow } from 'date-fns'

interface Workflow {
    id: number
    name: string
    nodes: any[]
    edges: any[]
    createdAt?: string
    updatedAt?: string
}

export default function WorkflowsPage() {
    const router = useRouter()
    const queryClient = useQueryClient()

    const { data: workflows, isLoading } = useQuery<Workflow[]>({
        queryKey: ['workflows'],
        queryFn: async () => {
            const res = await fetch('http://localhost:3002/workflows')
            if (!res.ok) throw new Error('Failed to fetch workflows')
            return res.json()
        },
    })

    const createWorkflowMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch('http://localhost:3002/workflows', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: 'Untitled Workflow',
                    nodes: [],
                    edges: [],
                }),
            })
            if (!res.ok) throw new Error('Failed to create workflow')
            return res.json()
        },
        onSuccess: (newWorkflow) => {
            queryClient.invalidateQueries({ queryKey: ['workflows'] })
            router.push(`/workflow/${newWorkflow.id}`)
        },
    })

    const handleCreateWorkflow = () => {
        createWorkflowMutation.mutate()
    }

    return (
        <div className="min-h-screen flex bg-background">
            <WorkflowSidebar />

            <div className="flex-1 ml-14 p-8">
                <div className="max-w-5xl mx-auto space-y-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Workflows</h1>
                            <p className="text-muted-foreground mt-1">
                                Manage and automate your tasks with visual workflows.
                            </p>
                        </div>
                        <Button
                            onClick={handleCreateWorkflow}
                            disabled={createWorkflowMutation.isPending}
                            className="gap-2"
                        >
                            {createWorkflowMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Plus className="h-4 w-4" />
                            )}
                            Create Workflow
                        </Button>
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-48 rounded-xl bg-card/50 animate-pulse border border-border/50" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {workflows?.map((workflow) => (
                                <Card
                                    key={workflow.id}
                                    className="group hover:border-primary/50 transition-all cursor-pointer bg-card/50 backdrop-blur-sm"
                                    onClick={() => router.push(`/workflow/${workflow.id}`)}
                                >
                                    <CardHeader>
                                        <CardTitle className="flex items-center justify-between">
                                            <span className="truncate">{workflow.name}</span>
                                            <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                                        </CardTitle>
                                        <CardDescription>
                                            ID: {workflow.id} • {workflow.nodes?.length || 0} nodes
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-20 rounded-md bg-background/50 border border-border/50 flex items-center justify-center text-muted-foreground text-xs">
                                            Workflow Preview
                                        </div>
                                    </CardContent>
                                    <CardFooter className="text-xs text-muted-foreground">
                                        <Calendar className="h-3 w-3 mr-1" />
                                        {workflow.updatedAt
                                            ? `Updated ${formatDistanceToNow(new Date(workflow.updatedAt), { addSuffix: true })}`
                                            : 'Just now'
                                        }
                                    </CardFooter>
                                </Card>
                            ))}

                            {workflows?.length === 0 && (
                                <div className="col-span-full flex flex-col items-center justify-center py-12 text-center border border-dashed border-border rounded-xl bg-card/30">
                                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                        <Plus className="h-6 w-6 text-primary" />
                                    </div>
                                    <h3 className="text-lg font-semibold">No workflows yet</h3>
                                    <p className="text-muted-foreground max-w-sm mt-2 mb-6">
                                        Create your first workflow to start automating your tasks.
                                    </p>
                                    <Button onClick={handleCreateWorkflow} variant="outline">
                                        Create Workflow
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
