import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = process.argv.slice(2);
const nameArg = args.find(arg => arg.startsWith('--name='));
const categoryArg = args.find(arg => arg.startsWith('--category='));

const rawName = nameArg ? nameArg.split('=')[1] : args[0];
const category = categoryArg ? categoryArg.split('=')[1] : 'general';

if (!rawName) {
    console.error('Please provide a node name: pnpm run scaffold-node --name=my-node --category=core');
    process.exit(1);
}

// Helpers
const toKebabCase = (str: string) => str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();

const toPascalCase = (str: string) => str
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');

const nodeName = toKebabCase(rawName); // e.g. my-node
const basePascal = toPascalCase(nodeName);
const className = basePascal.endsWith('Node') ? basePascal : basePascal + 'Node'; // e.g. MyNode

const nodesRoot = path.resolve(__dirname, '../packages/nodes/src');
const categoryDir = path.join(nodesRoot, category);
const nodeDir = path.join(categoryDir, nodeName);

// Ensure directories exist
if (!fs.existsSync(categoryDir)) fs.mkdirSync(categoryDir, { recursive: true });
if (!fs.existsSync(nodeDir)) fs.mkdirSync(nodeDir, { recursive: true });

const nodeFilePath = path.join(nodeDir, `${className}.ts`);
const testFilePath = path.join(nodeDir, `${className}.test.ts`);
const indexFilePath = path.join(nodesRoot, 'index.ts');

const nodeTemplate = `import { NodeExecutionArgs, NodeExecutionResult } from '@repo/types';
import { AntigravityNode } from '../../../types';

export class ${className} implements AntigravityNode {
    name = '${nodeName}';
    displayName = '${nodeName.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')}';
    description = 'Description for ${nodeName}';
    version = 1;
    defaults = {};

    async execute({ node, input }: NodeExecutionArgs): Promise<NodeExecutionResult> {
        console.log('[${className}] Executing with input:', input);
        
        return {
            status: 'success',
            output: { 
                message: 'Hello from ${className}',
                input 
            }
        };
    }
}
`;

const testTemplate = `import { describe, it, expect } from 'vitest';
import { ${className} } from './${className}';
import { NodeExecutionArgs } from '@repo/types';

describe('${className}', () => {
    it('should execute successfully', async () => {
        const node = new ${className}();
        const args: NodeExecutionArgs = {
            node: {
                id: 'test-node',
                type: '${nodeName}',
                position: { x: 0, y: 0 },
                data: {}
            },
            input: { foo: 'bar' },
            context: {
                workflowId: 1,
                executionId: 1,
                input: {},
                results: {}
            }
        };

        const result = await node.execute(args);

        expect(result.status).toBe('success');
        expect(result.output).toBeDefined();
        expect(result.output.message).toBe('Hello from ${className}');
    });
});
`;

if (fs.existsSync(nodeFilePath)) {
    console.error(`Node ${className} already exists at ${nodeFilePath}`);
    process.exit(1);
}

fs.writeFileSync(nodeFilePath, nodeTemplate);
console.log(`Created node file: ${nodeFilePath}`);

fs.writeFileSync(testFilePath, testTemplate);
console.log(`Created test file: ${testFilePath}`);

// Update index.ts
let indexContent = fs.readFileSync(indexFilePath, 'utf-8');
const exportStatement = `export * from './${category}/${nodeName}/${className}';\n`;

if (!indexContent.includes(exportStatement)) {
    fs.appendFileSync(indexFilePath, exportStatement);
    console.log(`Updated index.ts: ${indexFilePath}`);
}

console.log("\nDone! Don't forget to register your new node in apps/api/src/execution/nodes/index.ts");
