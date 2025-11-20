import { describe, it, expect } from 'vitest'
import { nodeRegistry, getNodeDefinition, getAllNodeDefinitions } from './node-registry'

describe('Node Registry', () => {
    it('should have fetch node registered', () => {
        expect(nodeRegistry['fetch']).toBeDefined()
        expect(nodeRegistry['fetch'].name).toBe('fetch')
    })

    it('should retrieve node definition by type', () => {
        const def = getNodeDefinition('fetch')
        expect(def).toBeDefined()
        expect(def?.displayName).toBe('HTTP Request')
    })

    it('should return all node definitions', () => {
        const all = getAllNodeDefinitions()
        expect(all.length).toBeGreaterThan(0)
        expect(all.some(n => n.name === 'fetch')).toBe(true)
    })

    it('should have UI definition for fetch node', () => {
        const def = getNodeDefinition('fetch')
        expect(def?.ui).toBeDefined()
        expect(def?.ui?.inputs).toBeDefined()
        expect(def?.ui?.inputs?.some(i => i.id === 'url')).toBe(true)
        expect(def?.ui?.inputs?.some(i => i.id === 'method')).toBe(true)
    })
})
