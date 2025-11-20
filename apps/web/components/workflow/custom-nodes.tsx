import { memo, useMemo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { cn } from '@/lib/utils'
import { DefaultNode } from './default-node'
import { nodeRegistry, getAllNodeDefinitions } from '@/lib/node-registry'

// Generic Node Wrapper
const createNodeComponent = (nodeType: string) => {
    const NodeComponent = (props: any) => {
        const definition = nodeRegistry[nodeType]

        // Merge definition UI with instance data
        const mergedData = useMemo(() => ({
            ...props.data,
            ui: definition?.ui || props.data.ui,
            label: props.data.label || definition?.displayName || nodeType,
            description: props.data.description || definition?.description,
        }), [props.data, definition])

        return <DefaultNode {...props} data={mergedData} type={nodeType} />
    }
    NodeComponent.displayName = `${nodeType}Node`
    return NodeComponent
}

// Generate nodeTypes object for React Flow
export const nodeTypes = getAllNodeDefinitions().reduce((acc, node) => {
    acc[node.name] = createNodeComponent(node.name)
    return acc
}, {} as Record<string, any>)

// Add legacy/manual nodes if they don't exist in registry yet
if (!nodeTypes['tool']) {
    nodeTypes['tool'] = (props: any) => (
        <DefaultNode
            {...props}
            data={{
                ...props.data,
                ui: {
                    inputs: [
                        { id: 'operation', label: 'Operation', type: 'select', defaultValue: 'Custom Script' },
                        { id: 'timeout', label: 'Timeout', type: 'text', defaultValue: '30s' }
                    ]
                }
            }}
        />
    )
}

if (!nodeTypes['web']) {
    nodeTypes['web'] = (props: any) => (
        <DefaultNode
            {...props}
            data={{
                ...props.data,
                ui: {
                    inputs: [
                        { id: 'url', label: 'URL', type: 'text', defaultValue: props.data.url || 'https://api.example.com', placeholder: 'https://...' },
                        { id: 'method', label: 'Method', type: 'select', defaultValue: props.data.method || 'GET' },
                        { id: 'headers', label: 'Headers', type: 'text', defaultValue: '{"Content-Type": "application/json"}' }
                    ]
                }
            }}
        />
    )
}

if (!nodeTypes['agent']) {
    nodeTypes['agent'] = (props: any) => (
        <DefaultNode
            {...props}
            data={{
                ...props.data,
                ui: {
                    inputs: [
                        { id: 'model', label: 'Model', type: 'select', defaultValue: props.data.model || 'GPT-4' },
                        { id: 'system_prompt', label: 'System Prompt', type: 'text', defaultValue: 'You are a helpful assistant...' },
                        { id: 'temperature', label: 'Temperature', type: 'text', defaultValue: '0.7' }
                    ]
                }
            }}
        />
    )
}
