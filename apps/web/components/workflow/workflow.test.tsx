import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { WorkflowSidebar } from './workflow-sidebar'
import { WorkflowConfigPanel } from './workflow-config-panel'
import { WorkflowCanvas } from './workflow-canvas'
import { ReactFlowProvider } from '@xyflow/react'

// Mock ResizeObserver for React Flow
global.ResizeObserver = class ResizeObserver {
    observe() { }
    unobserve() { }
    disconnect() { }
}

// Mock React Flow
vi.mock('@xyflow/react', async () => {
    const actual = await vi.importActual('@xyflow/react')
    return {
        ...actual,
        ReactFlow: ({ children }: { children: React.ReactNode }) => <div data-testid="react-flow">{children}</div>,
        Background: () => <div data-testid="background" />,
        Controls: () => <div data-testid="controls" />,
        MiniMap: () => <div data-testid="minimap" />,
        Panel: ({ children }: { children: React.ReactNode }) => <div data-testid="panel">{children}</div>,
    }
})

describe('Workflow Components', () => {
    describe('WorkflowSidebar', () => {
        it('renders all navigation items', () => {
            render(<WorkflowSidebar />)

            // Check for main navigation icons (by aria-label)
            expect(screen.getByLabelText('Home')).toBeDefined()
            expect(screen.getByLabelText('Workflows')).toBeDefined()
            expect(screen.getByLabelText('History')).toBeDefined()
            expect(screen.getByLabelText('Nodes')).toBeDefined()
            expect(screen.getByLabelText('Logs')).toBeDefined()
            expect(screen.getByLabelText('Settings')).toBeDefined()

            // Check for user profile
            expect(screen.getByLabelText('User Profile')).toBeDefined()
        })
    })

    describe('WorkflowConfigPanel', () => {
        it('renders empty state when no node is selected', () => {
            render(<WorkflowConfigPanel selectedNode={null} />)
            expect(screen.getByText('Select a node to configure')).toBeDefined()
        })

        it('renders configuration form for selected node', () => {
            const mockNode = {
                id: '1',
                type: 'tool',
                data: {
                    label: 'Test Node',
                    description: 'Test Description'
                }
            }

            render(<WorkflowConfigPanel selectedNode={mockNode} />)

            expect(screen.getByDisplayValue('Test Node')).toBeDefined()
            expect(screen.getByDisplayValue('Test Description')).toBeDefined()
        })

        it('calls onUpdateNode when input changes', () => {
            const mockNode = {
                id: '1',
                type: 'tool',
                data: { label: 'Test Node' }
            }
            const onUpdateNode = vi.fn()

            render(<WorkflowConfigPanel selectedNode={mockNode} onUpdateNode={onUpdateNode} />)

            const input = screen.getByDisplayValue('Test Node')
            fireEvent.change(input, { target: { value: 'Updated Node' } })

            expect(onUpdateNode).toHaveBeenCalledWith('1', { label: 'Updated Node' })
        })

        it('renders agent-specific fields for agent nodes', () => {
            const mockNode = {
                id: '1',
                type: 'agent',
                data: {
                    label: 'Agent Node',
                    model: 'gpt-4'
                }
            }

            render(<WorkflowConfigPanel selectedNode={mockNode} />)

            // Check for agent specific labels (using getAllByText because Select components might render value multiple times or in hidden inputs)
            // We check if the label exists in the document
            expect(screen.getByText('Model')).toBeDefined()
            expect(screen.getByText('Trigger Rule')).toBeDefined()
        })
    })

    describe('WorkflowCanvas', () => {
        it('renders React Flow components', () => {
            render(
                <ReactFlowProvider>
                    <WorkflowCanvas
                        nodes={[]}
                        edges={[]}
                        onNodesChange={() => { }}
                        onEdgesChange={() => { }}
                        onConnect={() => { }}
                    />
                </ReactFlowProvider>
            )

            expect(screen.getByTestId('react-flow')).toBeDefined()
            expect(screen.getByTestId('background')).toBeDefined()
            expect(screen.getByTestId('controls')).toBeDefined()
            expect(screen.getByTestId('minimap')).toBeDefined()
        })

        it('renders add node buttons', () => {
            render(
                <ReactFlowProvider>
                    <WorkflowCanvas
                        nodes={[]}
                        edges={[]}
                        onNodesChange={() => { }}
                        onEdgesChange={() => { }}
                        onConnect={() => { }}
                    />
                </ReactFlowProvider>
            )

            expect(screen.getByText('Tool')).toBeDefined()
            expect(screen.getByText('Web')).toBeDefined()
            expect(screen.getByText('Agent')).toBeDefined()
        })
    })
})
