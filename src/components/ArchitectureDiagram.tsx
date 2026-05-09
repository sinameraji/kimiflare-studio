import { ChevronDown } from 'lucide-react'

interface Node {
  id: string
  label: string
  type: 'service' | 'database'
  isNew?: boolean
}

interface Edge {
  from: string
  to: string
}

interface ArchitectureDiagramProps {
  before: { nodes: Node[]; edges: Edge[] }
  after: { nodes: Node[]; edges: Edge[] }
}

function NodeBox({ node }: { node: Node }) {
  const isDb = node.type === 'database'
  return (
    <div
      className={`rounded-lg px-4 py-3 text-xs font-medium text-center border ${
        node.isNew
          ? 'bg-studio-info-light border-studio-info text-studio-text'
          : 'bg-studio-elevated/50 border-studio-elevated text-studio-text-secondary'
      }`}
    >
      <div className={`w-2 h-2 rounded-full mx-auto mb-1.5 ${isDb ? 'bg-studio-warning' : 'bg-studio-primary'}`} />
      {node.label}
    </div>
  )
}

function Arrow() {
  return (
    <div className="flex justify-center py-1">
      <ChevronDown className="w-3.5 h-3.5 text-studio-text-tertiary" />
    </div>
  )
}

function Column({ title, nodes, edges }: { title: string; nodes: Node[]; edges: Edge[] }) {
  // Build ordered node list following edges for visual stacking
  const ordered: Node[] = []
  const visited = new Set<string>()

  // Start with nodes that have no incoming edges
  const incoming = new Set(edges.map((e) => e.to))
  const starters = nodes.filter((n) => !incoming.has(n.id))

  function visit(nodeId: string) {
    if (visited.has(nodeId)) return
    const node = nodes.find((n) => n.id === nodeId)
    if (!node) return
    visited.add(nodeId)
    ordered.push(node)
    const next = edges.filter((e) => e.from === nodeId).map((e) => e.to)
    next.forEach(visit)
  }

  starters.forEach((n) => visit(n.id))
  // Append any orphaned nodes
  nodes.forEach((n) => {
    if (!visited.has(n.id)) ordered.push(n)
  })

  return (
    <div className="flex-1">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-studio-text-tertiary block mb-3 text-center">
        {title}
      </span>
      <div className="bg-studio-surface rounded-xl border border-studio-elevated p-5">
        <div className="flex flex-col gap-1">
          {ordered.map((node, i) => (
            <div key={node.id}>
              <NodeBox node={node} />
              {i < ordered.length - 1 && <Arrow />}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function ArchitectureDiagram({ before, after }: ArchitectureDiagramProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Column title="Before" nodes={before.nodes} edges={before.edges} />
      <Column title="After" nodes={after.nodes} edges={after.edges} />
    </div>
  )
}
