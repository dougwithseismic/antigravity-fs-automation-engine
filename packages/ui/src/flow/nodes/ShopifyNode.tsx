import { memo } from 'react';
import { type NodeProps, type Node } from '@xyflow/react';
import { ShoppingBag } from 'lucide-react';
import { NodeContainer, nodeStyles } from '../shared/node-base';
import { InputGroup } from '../primitives/InputGroup';
import { SelectInput } from '../primitives/SelectInput';
import { TextareaInput } from '../primitives/TextareaInput';
import { OutputGroup } from '../primitives/OutputGroup';
import { OutputItem } from '../primitives/OutputItem';

export interface ShopifyNodeData {
    label?: string;
    description?: string;
    action?: string;
    handles?: any[];
}

/**
 * ShopifyNode - Shopify integration actions
 * Shows Shopify-specific operations
 */
export const ShopifyNode = memo(({ data, selected }: NodeProps<Node<ShopifyNodeData>>) => {
    const handles = (data.handles as any[]) || [];
    const dataInputs = handles.filter(h => h.type === 'target' && h.dataType !== 'flow');
    const dataOutputs = handles.filter(h => h.type === 'source' && h.dataType !== 'flow');

    const action = data.action || 'create_order';

    return (
        <NodeContainer
            id="shopify"
            selected={selected}
            type="shopify"
            label={data.label || 'Shopify Action'}
            description={data.description || 'Shopify integration'}
            icon={<ShoppingBag className="h-4 w-4" />}
            handles={handles}
        >
            <div className={nodeStyles.body}>
                {/* Shopify Badge */}
                <div className="mb-3 flex items-center gap-2 rounded-lg bg-green-500/10 px-3 py-2">
                    <ShoppingBag className="h-4 w-4 text-green-400" />
                    <span className="text-sm font-medium text-green-300">Shopify</span>
                </div>

                {/* Action Select */}
                <InputGroup
                    label="Action"
                    required
                >
                    <SelectInput defaultValue={action}>
                        <option value="create_order">Create Order</option>
                        <option value="update_order">Update Order</option>
                        <option value="create_customer">Create Customer</option>
                        <option value="update_customer">Update Customer</option>
                        <option value="create_product">Create Product</option>
                    </SelectInput>
                </InputGroup>

                {/* Data Input */}
                <InputGroup
                    label="Data"
                    typeIndicator="json"
                    handleData={dataInputs.find(h => h.id === 'data')}
                >
                    <TextareaInput
                        placeholder='{"customer": {...}, "line_items": [...]}'
                        rows={4}
                    />
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

ShopifyNode.displayName = 'ShopifyNode';
