"use client"

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

interface WorkflowConfigPanelProps {
    selectedNode: any
    onUpdateNode?: (nodeId: string, data: any) => void
    onClose?: () => void
}

export function WorkflowConfigPanel({ selectedNode, onUpdateNode, onClose }: WorkflowConfigPanelProps) {
    const [formData, setFormData] = useState({
        label: '',
        description: '',
        model: '',
        triggerRule: '',
        language: '',
        location: '',
    })

    useEffect(() => {
        if (selectedNode?.data) {
            setFormData({
                label: selectedNode.data.label || '',
                description: selectedNode.data.description || '',
                model: selectedNode.data.model || '',
                triggerRule: selectedNode.data.triggerRule || '',
                language: selectedNode.data.language || '',
                location: selectedNode.data.location || '',
            })
        }
    }, [selectedNode])

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        if (onUpdateNode && selectedNode?.id) {
            onUpdateNode(selectedNode.id, { [field]: value })
        }
    }

    if (!selectedNode) {
        return (
            <div className={cn(
                "w-80 border-l border-border/50 bg-card/50 backdrop-blur-sm",
                "flex items-center justify-center text-muted-foreground"
            )}>
                <p className="text-sm">Select a node to configure</p>
            </div>
        )
    }

    return (
        <div className={cn(
            "w-80 border-l border-border/50 bg-card/50 backdrop-blur-sm",
            "flex flex-col overflow-hidden"
        )}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/50">
                <h3 className="font-semibold text-sm uppercase tracking-wider">Node Configuration</h3>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="p-1 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Close panel"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* Form */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="label" className="text-xs uppercase tracking-wider text-muted-foreground">
                        Label
                    </Label>
                    <Input
                        id="label"
                        value={formData.label}
                        onChange={(e) => handleChange('label', e.target.value)}
                        className="bg-background/50 border-border/50"
                        placeholder="Node label"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description" className="text-xs uppercase tracking-wider text-muted-foreground">
                        Description
                    </Label>
                    <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                        className="bg-background/50 border-border/50 min-h-[80px] resize-none"
                        placeholder="Node description"
                    />
                </div>

                {selectedNode.type === 'agent' && (
                    <>
                        <div className="space-y-2">
                            <Label htmlFor="model" className="text-xs uppercase tracking-wider text-muted-foreground">
                                Model
                            </Label>
                            <Select value={formData.model} onValueChange={(value) => handleChange('model', value)}>
                                <SelectTrigger id="model" className="bg-background/50 border-border/50">
                                    <SelectValue placeholder="Select model" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="llama-3.18b">Llama 3.1 8B</SelectItem>
                                    <SelectItem value="gpt-4">GPT-4</SelectItem>
                                    <SelectItem value="claude-3">Claude 3</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="triggerRule" className="text-xs uppercase tracking-wider text-muted-foreground">
                                Trigger Rule
                            </Label>
                            <Select value={formData.triggerRule} onValueChange={(value) => handleChange('triggerRule', value)}>
                                <SelectTrigger id="triggerRule" className="bg-background/50 border-border/50">
                                    <SelectValue placeholder="Select trigger" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="language">Language (18:18)</SelectItem>
                                    <SelectItem value="manual">Manual</SelectItem>
                                    <SelectItem value="schedule">Schedule</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="language" className="text-xs uppercase tracking-wider text-muted-foreground">
                                Language Model
                            </Label>
                            <Input
                                id="language"
                                value={formData.language}
                                onChange={(e) => handleChange('language', e.target.value)}
                                className="bg-background/50 border-border/50"
                                placeholder="Language setting"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="location" className="text-xs uppercase tracking-wider text-muted-foreground">
                                Location
                            </Label>
                            <Select value={formData.location} onValueChange={(value) => handleChange('location', value)}>
                                <SelectTrigger id="location" className="bg-background/50 border-border/50">
                                    <SelectValue placeholder="Select location" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="5_seconds">5 seconds</SelectItem>
                                    <SelectItem value="10_seconds">10 seconds</SelectItem>
                                    <SelectItem value="30_seconds">30 seconds</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
