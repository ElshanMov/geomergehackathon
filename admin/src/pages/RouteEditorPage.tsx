// Admin → Marşrut ox redaktoru. Status node-ları + oxlar (transition). @xyflow/react.
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  MarkerType,
  addEdge,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import type { Node, Edge, Connection, NodeProps } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { api } from '../api/client';
import type { Route, RouteStep, RouteTransition } from '../types';
import { Icon } from '../lib/icon';
import { useToast } from '../components/Toast';

type StepData = {
  code: string;
  name: string;
  stepType: string; // start | normal | external | end
  role: string;
  color: string;
};
type StepNode = Node<StepData, 'step'>;
type FlowEdge = Edge<{ kind: string }>;

const PALETTE = ['#64748B', '#3B82F6', '#0EA5E9', '#8B5CF6', '#F59E0B', '#F97316', '#10B981', '#EF4444'];

const STEP_TYPES: [string, string][] = [
  ['start', 'Başlanğıc'],
  ['normal', 'Status'],
  ['external', 'Xarici qurum'],
  ['end', 'Son'],
];
const STEP_TYPE_SHORT: Record<string, string> = { start: 'BAŞLA', normal: '', external: 'XARİCİ', end: 'SON' };

const ROLES: [string, string][] = [
  ['operator', 'Operator'],
  ['representative', 'Nümayəndə'],
  ['external', 'Xarici qurum'],
];
const ROLE_LABEL: Record<string, string> = Object.fromEntries(ROLES);

function edgeStyle(kind: string): Partial<FlowEdge> {
  const external = kind === 'external';
  const color = external ? '#8B5CF6' : '#475569';
  return {
    animated: external,
    style: { stroke: color, strokeWidth: 2, strokeDasharray: external ? '6 4' : undefined },
    markerEnd: { type: MarkerType.ArrowClosed, color, width: 18, height: 18 },
    labelStyle: { fontSize: 11, fontWeight: 600, fill: color },
    labelBgStyle: { fill: '#ffffff', fillOpacity: 0.92 },
    labelBgPadding: [6, 3],
    labelBgBorderRadius: 4,
  };
}

function stepToNode(s: RouteStep): StepNode {
  return {
    id: s.id,
    type: 'step',
    position: { x: s.x, y: s.y },
    data: { code: s.code, name: s.name, stepType: s.type, role: s.role, color: s.color },
  };
}

function transitionToEdge(t: RouteTransition): FlowEdge {
  return { id: t.id, source: t.from, target: t.to, label: t.label, data: { kind: t.kind }, ...edgeStyle(t.kind) };
}

function StepNodeView({ data, selected }: NodeProps<StepNode>) {
  const short = STEP_TYPE_SHORT[data.stepType] ?? '';
  return (
    <div
      style={{
        minWidth: 158,
        background: '#fff',
        border: '1px solid var(--border)',
        borderLeft: `4px solid ${data.color}`,
        borderRadius: 10,
        boxShadow: selected ? '0 0 0 3px rgba(14,165,233,.30)' : 'var(--shadow-sm)',
        padding: '9px 12px',
      }}
    >
      <Handle type="target" position={Position.Left} style={{ background: data.color, width: 9, height: 9, border: '2px solid #fff' }} />
      <div className="col" style={{ gap: 3 }}>
        <div className="row" style={{ justifyContent: 'space-between', gap: 8 }}>
          <span style={{ fontWeight: 700, fontSize: 12.5, color: 'var(--text)' }}>{data.name}</span>
          {short && (
            <span style={{ fontSize: 8.5, fontWeight: 800, letterSpacing: '.06em', color: data.color, background: `${data.color}1A`, padding: '2px 5px', borderRadius: 5 }}>
              {short}
            </span>
          )}
        </div>
        <span className="mono" style={{ fontSize: 10, color: 'var(--muted)' }}>
          {data.code} · {ROLE_LABEL[data.role] ?? data.role}
        </span>
      </div>
      <Handle type="source" position={Position.Right} style={{ background: data.color, width: 9, height: 9, border: '2px solid #fff' }} />
    </div>
  );
}

const nodeTypes = { step: StepNodeView };

type Sel = { type: 'node' | 'edge'; id: string } | null;

export function RouteEditorPage() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const toast = useToast();

  const [route, setRoute] = useState<Route | null>(null);
  const [error, setError] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('sequential');
  const [saving, setSaving] = useState(false);
  const [sel, setSel] = useState<Sel>(null);

  const [nodes, setNodes, onNodesChange] = useNodesState<StepNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<FlowEdge>([]);

  useEffect(() => {
    if (!id) return;
    api
      .route(id)
      .then((r) => {
        setRoute(r);
        setName(r.name);
        setDescription(r.description);
        setType(r.type);
        setNodes(r.steps.map(stepToNode));
        setEdges(r.transitions.map(transitionToEdge));
      })
      .catch((e) => {
        console.warn('marşrut yüklənmədi:', e);
        setError(true);
      });
  }, [id, setNodes, setEdges]);

  const onConnect = useCallback(
    (c: Connection) =>
      setEdges((es) =>
        addEdge({ ...c, id: `e${Date.now().toString(36)}`, label: 'keçid', data: { kind: 'internal' }, ...edgeStyle('internal') } as FlowEdge, es),
      ),
    [setEdges],
  );

  const addStatus = () => {
    const nid = `s${Date.now().toString(36)}`;
    setNodes((ns) => [
      ...ns,
      {
        id: nid,
        type: 'step',
        position: { x: 140 + (ns.length % 4) * 50, y: 120 + Math.floor(ns.length / 4) * 50 },
        data: { code: 'status', name: 'Yeni status', stepType: 'normal', role: 'operator', color: '#3B82F6' },
      },
    ]);
    setSel({ type: 'node', id: nid });
  };

  const updateNodeData = (nid: string, patch: Partial<StepData>) =>
    setNodes((ns) => ns.map((n) => (n.id === nid ? { ...n, data: { ...n.data, ...patch } } : n)));

  const deleteNode = (nid: string) => {
    setNodes((ns) => ns.filter((n) => n.id !== nid));
    setEdges((es) => es.filter((e) => e.source !== nid && e.target !== nid));
    setSel(null);
  };

  const updateEdge = (eid: string, patch: { label?: string; kind?: string }) =>
    setEdges((es) =>
      es.map((e) => {
        if (e.id !== eid) return e;
        const kind = patch.kind ?? e.data?.kind ?? 'internal';
        const label = patch.label ?? (typeof e.label === 'string' ? e.label : '');
        return { ...e, label, data: { kind }, ...edgeStyle(kind) };
      }),
    );

  const deleteEdge = (eid: string) => {
    setEdges((es) => es.filter((e) => e.id !== eid));
    setSel(null);
  };

  const save = async () => {
    if (!route) return;
    if (!name.trim()) {
      toast.push('Marşrut adı tələb olunur', 'error');
      return;
    }
    setSaving(true);
    try {
      const steps: RouteStep[] = nodes.map((n) => ({
        id: n.id,
        code: n.data.code,
        name: n.data.name,
        type: n.data.stepType,
        role: n.data.role,
        color: n.data.color,
        x: Math.round(n.position.x),
        y: Math.round(n.position.y),
      }));
      const transitions: RouteTransition[] = edges.map((e) => ({
        id: e.id,
        from: e.source,
        to: e.target,
        label: typeof e.label === 'string' ? e.label : '',
        kind: e.data?.kind ?? 'internal',
      }));
      await api.updateRoute(route.id, { name, description, type, steps, transitions });
      toast.push('Marşrut yadda saxlanıldı');
    } catch (e) {
      toast.push('Saxlanmadı', 'error');
      console.warn(e);
    } finally {
      setSaving(false);
    }
  };

  const selNode = sel?.type === 'node' ? nodes.find((n) => n.id === sel.id) : undefined;
  const selEdge = sel?.type === 'edge' ? edges.find((e) => e.id === sel.id) : undefined;

  if (error) {
    return (
      <div className="col gap-3" style={{ alignItems: 'flex-start' }}>
        <button className="btn btn-secondary" onClick={() => nav('/routes')}>
          <Icon name="arrow-left" size={15} />
          Geri
        </button>
        <div className="card" style={{ padding: 28, color: 'var(--muted)' }}>Marşrut tapılmadı.</div>
      </div>
    );
  }

  return (
    <div className="col gap-3" style={{ height: 'calc(100vh - 104px)' }}>
      {/* Toolbar */}
      <div className="row" style={{ justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div className="row gap-2" style={{ flex: 1, minWidth: 0 }}>
          <button className="btn btn-ghost btn-icon" onClick={() => nav('/routes')} title="Geri">
            <Icon name="arrow-left" size={17} />
          </button>
          <input className="input" style={{ maxWidth: 320, fontWeight: 600 }} value={name} onChange={(e) => setName(e.target.value)} placeholder="Marşrut adı" />
          <select className="select" style={{ width: 'auto' }} value={type} onChange={(e) => setType(e.target.value)}>
            <option value="sequential">Ardıcıl</option>
            <option value="parallel">Paralel</option>
          </select>
        </div>
        <div className="row gap-2">
          <button className="btn btn-secondary" onClick={addStatus}>
            <Icon name="plus" size={15} />
            Status əlavə et
          </button>
          <button className="btn btn-accent" onClick={save} disabled={saving}>
            <Icon name="save" size={15} />
            {saving ? 'Saxlanılır…' : 'Yadda saxla'}
          </button>
        </div>
      </div>

      {/* Canvas + inspector */}
      <div className="row" style={{ flex: 1, minHeight: 0, gap: 12, alignItems: 'stretch' }}>
        <div className="card" style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            onNodeClick={(_, n) => setSel({ type: 'node', id: n.id })}
            onEdgeClick={(_, e) => setSel({ type: 'edge', id: e.id })}
            onPaneClick={() => setSel(null)}
            fitView
            fitViewOptions={{ padding: 0.25 }}
          >
            <Background gap={18} color="#E2E8F0" />
            <Controls showInteractive={false} />
            <MiniMap pannable zoomable nodeColor={(n) => ((n.data as StepData)?.color ?? '#94A3B8')} style={{ background: 'var(--surface-2)' }} />
          </ReactFlow>
        </div>

        {/* Inspector */}
        <div className="card col" style={{ width: 312, flexShrink: 0, padding: 16, gap: 14, overflowY: 'auto' }}>
          {selNode ? (
            <NodeInspector
              key={selNode.id}
              data={selNode.data}
              onChange={(patch) => updateNodeData(selNode.id, patch)}
              onDelete={() => deleteNode(selNode.id)}
            />
          ) : selEdge ? (
            <EdgeInspector
              key={selEdge.id}
              label={typeof selEdge.label === 'string' ? selEdge.label : ''}
              kind={selEdge.data?.kind ?? 'internal'}
              onChange={(patch) => updateEdge(selEdge.id, patch)}
              onDelete={() => deleteEdge(selEdge.id)}
            />
          ) : (
            <RouteMeta description={description} setDescription={setDescription} stepCount={nodes.length} edgeCount={edges.length} />
          )}
        </div>
      </div>
    </div>
  );
}

function Lbl({ children }: { children: React.ReactNode }) {
  return <span className="label" style={{ marginBottom: 0 }}>{children}</span>;
}

function NodeInspector({ data, onChange, onDelete }: { data: StepData; onChange: (p: Partial<StepData>) => void; onDelete: () => void }) {
  return (
    <>
      <div className="row gap-2" style={{ justifyContent: 'space-between' }}>
        <span style={{ fontWeight: 700, fontSize: 13.5 }}>Status</span>
        <button className="btn btn-ghost btn-icon" title="Statusu sil" onClick={onDelete}>
          <Icon name="trash-2" size={15} color="var(--danger)" />
        </button>
      </div>
      <div className="col" style={{ gap: 5 }}>
        <Lbl>Ad</Lbl>
        <input className="input" value={data.name} onChange={(e) => onChange({ name: e.target.value })} />
      </div>
      <div className="col" style={{ gap: 5 }}>
        <Lbl>Kod</Lbl>
        <input className="input mono" value={data.code} onChange={(e) => onChange({ code: e.target.value })} />
      </div>
      <div className="col" style={{ gap: 5 }}>
        <Lbl>Tip</Lbl>
        <select className="select" value={data.stepType} onChange={(e) => onChange({ stepType: e.target.value })}>
          {STEP_TYPES.map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
      </div>
      <div className="col" style={{ gap: 5 }}>
        <Lbl>İcraçı rol</Lbl>
        <select className="select" value={data.role} onChange={(e) => onChange({ role: e.target.value })}>
          {ROLES.map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
      </div>
      <div className="col" style={{ gap: 6 }}>
        <Lbl>Rəng</Lbl>
        <div className="row gap-1" style={{ flexWrap: 'wrap' }}>
          {PALETTE.map((c) => (
            <button
              key={c}
              onClick={() => onChange({ color: c })}
              title={c}
              style={{
                width: 26,
                height: 26,
                borderRadius: 7,
                background: c,
                border: data.color === c ? '2px solid var(--text)' : '2px solid transparent',
                boxShadow: data.color === c ? '0 0 0 2px #fff inset' : 'none',
                cursor: 'pointer',
              }}
            />
          ))}
        </div>
      </div>
    </>
  );
}

function EdgeInspector({
  label,
  kind,
  onChange,
  onDelete,
}: {
  label: string;
  kind: string;
  onChange: (p: { label?: string; kind?: string }) => void;
  onDelete: () => void;
}) {
  return (
    <>
      <div className="row gap-2" style={{ justifyContent: 'space-between' }}>
        <span style={{ fontWeight: 700, fontSize: 13.5 }}>Keçid (ox)</span>
        <button className="btn btn-ghost btn-icon" title="Keçidi sil" onClick={onDelete}>
          <Icon name="trash-2" size={15} color="var(--danger)" />
        </button>
      </div>
      <div className="col" style={{ gap: 5 }}>
        <Lbl>Etiket</Lbl>
        <input className="input" value={label} onChange={(e) => onChange({ label: e.target.value })} />
      </div>
      <div className="col" style={{ gap: 5 }}>
        <Lbl>Növ</Lbl>
        <select className="select" value={kind} onChange={(e) => onChange({ kind: e.target.value })}>
          <option value="internal">Daxili (RİH)</option>
          <option value="external">Xarici (İDDA Gateway)</option>
        </select>
      </div>
      <span style={{ fontSize: 11.5, color: 'var(--muted)', lineHeight: 1.5 }}>
        Xarici keçidlər kəsik bənövşəyi oxla göstərilir — başqa quruma göndərmə.
      </span>
    </>
  );
}

function RouteMeta({
  description,
  setDescription,
  stepCount,
  edgeCount,
}: {
  description: string;
  setDescription: (v: string) => void;
  stepCount: number;
  edgeCount: number;
}) {
  return (
    <>
      <span style={{ fontWeight: 700, fontSize: 13.5 }}>Marşrut</span>
      <div className="col" style={{ gap: 5 }}>
        <Lbl>Təsvir</Lbl>
        <textarea className="textarea" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div className="row gap-3" style={{ fontSize: 12, color: 'var(--muted)' }}>
        <span className="row gap-1">
          <Icon name="circle-dot" size={13} />
          {stepCount} status
        </span>
        <span className="row gap-1">
          <Icon name="arrow-right" size={13} />
          {edgeCount} keçid
        </span>
      </div>
      <div className="divider" />
      <span style={{ fontSize: 11.5, color: 'var(--muted)', lineHeight: 1.55 }}>
        Status seç → sağda redaktə et. Bir status-un sağ nöqtəsindən digərinin sol nöqtəsinə dartıb ox çək. Dəyişiklikləri saxlamaq üçün “Yadda saxla”.
      </span>
    </>
  );
}
