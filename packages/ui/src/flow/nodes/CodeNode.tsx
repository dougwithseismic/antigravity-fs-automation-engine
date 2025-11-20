import { memo } from 'react';
import { type NodeProps, type Node } from '@xyflow/react';
import { Code } from 'lucide-react';
import { NodeContainer, nodeStyles } from '../shared/node-base';
import { InputGroup } from '../primitives/InputGroup';
import { TextareaInput } from '../primitives/TextareaInput';
import { SelectInput } from '../primitives/SelectInput';
import { OutputGroup } from '../primitives/OutputGroup';
import { OutputItem } from '../primitives/OutputItem';

export interface CodeNodeData {
    label?: string;
    description?: string;
    code?: string;
    mode?: string;
    handles?: any[];
}

/**
 * CodeNode - Execute custom JavaScript code
 * Features a code editor with simple syntax awareness
 */
export const CodeNode = memo(({ data, selected }: NodeProps<Node<CodeNodeData>>) => {
    const handles = (data.handles as any[]) || [];
    const dataInputs = handles.filter(h => h.type === 'target' && h.dataType !== 'flow');
    const dataOutputs = handles.filter(h => h.type === 'source' && h.dataType !== 'flow');

    return (
        <NodeContainer
            id="code"
            selected={selected}
            type="code"
            label={data.label || 'Code'}
            description={data.description || 'Execute JavaScript'}
            icon={<Code className="h-4 w-4" />}
            handles={handles}
            duration="Variable"
        >
            <div className={nodeStyles.body}>
                {/* Code Input */}
                <InputGroup
                    label="JavaScript Code"
                    typeIndicator="js"
                    required
                    handleData={dataInputs.find(h => h.id === 'code')}
                >
                    <TextareaInput
                        rows={6}
                        placeholder="// Return something from here&#10;return { result: 'Hello' };"
                        defaultValue={data.code}
                        spellCheck={false}
                        style={{
                            fontFamily: 'monospace',
                            fontSize: '0.85rem',
                            lineHeight: '1.5'
                        }}
                    />
                </InputGroup>

                {/* Mode Selector */}
                <InputGroup
                    label="Execution Mode"
                    typeIndicator="string"
                >
                    <SelectInput defaultValue={data.mode || 'runOnce'}>
                        <option value="runOnce">Run Once</option>
                    </SelectInput>
                </InputGroup>
            </div>

            {/* Data Outputs */}
            {dataOutputs.length > 0 && (
                <OutputGroup>
                    {dataOutputs.map((handle) => (
                        <OutputItem
                            key={handle.id}
                            label={handle.label || handle.id}
                            handleData={handle}
                        />
                    ))}
                </OutputGroup>
            )}
        </NodeContainer>
    );
});

CodeNode.displayName = 'CodeNode';
