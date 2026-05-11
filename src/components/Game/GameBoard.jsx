import { useState, useMemo, useRef } from 'react';
import { lineKey, lineExists, isMoveLegal, isSubsegment, findConflictLine } from '../../utils/triangleLogic';
import { DEFAULT_COLORS } from '../../utils/colors';

const VW = 760, VH = 500;
const R_IDLE = 7, R_SEL = 10;
const TOUCH_THRESHOLD = 55;

export default function GameBoard({ gs, onPointClick, isAITurn, hintMove = null }) {
  const [hovered, setHovered] = useState(null);
  const svgRef = useRef(null);
  if (!gs) return null;

  const pColors = gs.playerColors ?? DEFAULT_COLORS;
  const { points, lines, triangles, selectedPoint, currentPlayer, newLineIds = [], newTriangleIds = [], rejectedMove } = gs;
  const activeColor = pColors[currentPlayer];

  const selPt = selectedPoint !== null ? points[selectedPoint] : null;
  const hovPt = hovered      !== null ? points[hovered]       : null;

  const hovExists   = selPt && hovPt && hovered !== selectedPoint && lineExists(lines, selectedPoint, hovered);
  const hovLegal    = selPt && hovPt && hovered !== selectedPoint && !hovExists && isMoveLegal(lines, points, selectedPoint, hovered);
  const hovSub      = selPt && hovPt && hovered !== selectedPoint && !hovExists && isSubsegment(lines, points, selectedPoint, hovered);
  const canDraw     = hovLegal && !hovSub;
  const wouldCross  = selPt && hovPt && hovered !== selectedPoint && !hovExists && (!hovLegal || hovSub);
  const conflictLine = (wouldCross && !hovSub) ? findConflictLine(lines, points, selectedPoint, hovered) : null;

  const lineData = useMemo(() => lines.map(l => ({
    ...l,
    pt1: points[l.p1], pt2: points[l.p2],
    color: pColors[l.player],
    isNew: newLineIds.includes(l.id),
    len: Math.hypot(points[l.p2].x - points[l.p1].x, points[l.p2].y - points[l.p1].y),
  })), [lines, newLineIds, pColors]);

  const triData = useMemo(() => triangles.map(t => ({
    ...t,
    pt1: points[t.p1], pt2: points[t.p2], pt3: points[t.p3],
    color: pColors[t.player],
    isNew: newTriangleIds.includes(t.id),
  })), [triangles, newTriangleIds, pColors]);

  function svgCoords(clientX, clientY) {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return null;
    return { x: (clientX - rect.left) * (VW / rect.width), y: (clientY - rect.top) * (VH / rect.height) };
  }

  function nearestPoint(cx, cy) {
    let best = null, minD = TOUCH_THRESHOLD;
    for (const pt of points) {
      const d = Math.hypot(pt.x - cx, pt.y - cy);
      if (d < minD) { minD = d; best = pt.id; }
    }
    return best;
  }

  function handleTouchStart(e) {
    if (isAITurn) return;
    e.preventDefault();
    const t = e.changedTouches[0];
    const c = svgCoords(t.clientX, t.clientY);
    if (!c) return;
    const id = nearestPoint(c.x, c.y);
    if (id !== null) onPointClick(id);
  }

  function handleMouseClick(e, id) { e.stopPropagation(); if (!isAITurn) onPointClick(id); }

  const gridDots = useMemo(() => {
    const d = [];
    for (let x = 50; x < VW; x += 50)
      for (let y = 50; y < VH; y += 50)
        d.push(<circle key={`${x}-${y}`} cx={x} cy={y} r={1.5} fill="#1e3a5f" opacity={0.45} />);
    return d;
  }, []);

  // Ampul ipucu noktaları
  const hintPts = hintMove ? new Set([hintMove.p1, hintMove.p2]) : new Set();

  return (
    <div className="w-full h-full flex items-center justify-center">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VW} ${VH}`}
        className="w-full h-full game-svg"
        style={{ display: 'block', maxHeight: '100%' }}
        preserveAspectRatio="xMidYMid meet"
        onTouchStart={handleTouchStart}
      >
        <rect width={VW} height={VH} fill="#0d1520" rx="16" />
        {gridDots}

        {/* ── Üçgenler ── */}
        {triData.map(t => (
          <polygon key={t.id}
            className={t.isNew ? 'tri-enter' : ''}
            points={`${t.pt1.x},${t.pt1.y} ${t.pt2.x},${t.pt2.y} ${t.pt3.x},${t.pt3.y}`}
            fill={t.color} fillOpacity={t.isNew ? 0.30 : 0.22}
            stroke={t.color} strokeWidth={1.5} strokeOpacity={0.45}
          />
        ))}

        {/* ── Ampul ipucu çizgisi ── */}
        {hintMove && !selPt && (
          <line
            x1={points[hintMove.p1].x} y1={points[hintMove.p1].y}
            x2={points[hintMove.p2].x} y2={points[hintMove.p2].y}
            stroke="#fbbf24" strokeWidth={2} strokeDasharray="8 5" strokeOpacity={0.7}
          />
        )}

        {/* ── Potansiyel çizgi (hover/seçili) ── */}
        {selPt && hovPt && hovered !== selectedPoint && (
          <line
            x1={selPt.x} y1={selPt.y} x2={hovPt.x} y2={hovPt.y}
            stroke={wouldCross ? '#ef4444' : activeColor}
            strokeWidth={wouldCross ? 1.5 : 2}
            strokeDasharray={wouldCross ? '5 5' : '9 6'}
            strokeOpacity={0.5}
          />
        )}
        {wouldCross && hovPt && (
          <text x={(selPt.x + hovPt.x) / 2} y={(selPt.y + hovPt.y) / 2 - 10}
            textAnchor="middle" fontSize="12" fill="#ef4444" opacity={0.8}
            style={{ pointerEvents: 'none', userSelect: 'none' }}>
            {hovSub ? '✕ zaten var' : '✕ kesişiyor'}
          </text>
        )}

        {/* ── Kesişen çizgi highlight ── */}
        {conflictLine && points[conflictLine.p1] && points[conflictLine.p2] && (
          <>
            <line
              x1={points[conflictLine.p1].x} y1={points[conflictLine.p1].y}
              x2={points[conflictLine.p2].x} y2={points[conflictLine.p2].y}
              stroke="#ef4444" strokeWidth={8} strokeLinecap="round" strokeOpacity={0.25}
              style={{ pointerEvents: 'none' }}
            />
            <line
              x1={points[conflictLine.p1].x} y1={points[conflictLine.p1].y}
              x2={points[conflictLine.p2].x} y2={points[conflictLine.p2].y}
              stroke="#ef4444" strokeWidth={3} strokeLinecap="round" strokeOpacity={0.9}
              strokeDasharray="6 3"
              style={{ pointerEvents: 'none' }}
            />
          </>
        )}

        {/* ── Reddedilen hamle flaşı ── */}
        {rejectedMove && points[rejectedMove.p1] && points[rejectedMove.p2] && (
          <line
            key={`rej-${rejectedMove.id}`}
            className="reject-line"
            x1={points[rejectedMove.p1].x} y1={points[rejectedMove.p1].y}
            x2={points[rejectedMove.p2].x} y2={points[rejectedMove.p2].y}
            stroke="#ef4444" strokeWidth={3} strokeLinecap="round"
          />
        )}

        {/* ── Çizgiler ── */}
        {lineData.map(l => (
          <line key={l.id} className={l.isNew ? 'line-enter' : ''}
            x1={l.pt1.x} y1={l.pt1.y} x2={l.pt2.x} y2={l.pt2.y}
            stroke={l.color} strokeWidth={2.5} strokeLinecap="round" opacity={0.95}
            style={l.isNew ? { strokeDasharray: l.len, strokeDashoffset: l.len } : {}}
          />
        ))}

        {/* ── Noktalar ── */}
        {points.map(pt => {
          const isSel    = pt.id === selectedPoint;
          const isHov    = pt.id === hovered && !isAITurn;
          const isHint   = hintPts.has(pt.id);
          const active   = isSel || isHov;
          const r        = isSel ? R_SEL : R_IDLE;
          const stroke   = isSel ? activeColor : isHov ? activeColor : isHint ? '#fbbf24' : '#475569';

          return (
            <g key={pt.id}
              onClick={e => handleMouseClick(e, pt.id)}
              onMouseEnter={() => !isAITurn && setHovered(pt.id)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: isAITurn ? 'default' : 'pointer' }}
            >
              <circle cx={pt.x} cy={pt.y} r={30} fill="transparent" />
              {isSel && (
                <circle cx={pt.x} cy={pt.y} r={r + 6} fill="none"
                  stroke={activeColor} strokeWidth={1.5} strokeOpacity={0.5} strokeDasharray="4 3"
                  style={{ pointerEvents: 'none' }}
                />
              )}
              {isHov && !isSel && (
                <circle cx={pt.x} cy={pt.y} r={r + 5} fill={activeColor} fillOpacity={0.12}
                  style={{ pointerEvents: 'none' }} />
              )}
              {isHint && !isSel && (
                <circle cx={pt.x} cy={pt.y} r={r + 5} fill="#fbbf24" fillOpacity={0.15}
                  style={{ pointerEvents: 'none' }} />
              )}
              <circle cx={pt.x} cy={pt.y} r={r}
                fill={isSel ? activeColor : '#1e2d40'} stroke={stroke}
                strokeWidth={isSel ? 2.5 : 1.5}
                style={{ transition: 'r 0.1s, fill 0.1s', pointerEvents: 'none' }}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
