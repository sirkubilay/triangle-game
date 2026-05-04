export function generatePoints(count, width = 760, height = 500, padding = 72) {
  const points = [];
  const minDist = Math.max(65, Math.min(width, height) / (count * 0.72));
  let attempts = 0;

  while (points.length < count && attempts < 8000) {
    const x = padding + Math.random() * (width - 2 * padding);
    const y = padding + Math.random() * (height - 2 * padding);
    const tooClose = points.some(p => Math.hypot(p.x - x, p.y - y) < minDist);
    if (!tooClose) points.push({ id: points.length, x: Math.round(x), y: Math.round(y) });
    attempts++;
  }
  return points;
}

export function lineKey(a, b) {
  return `${Math.min(a, b)}-${Math.max(a, b)}`;
}

export function lineExists(lines, a, b) {
  const k = lineKey(a, b);
  return lines.some(l => lineKey(l.p1, l.p2) === k);
}

export function getNeighbors(pointId, lines) {
  return lines
    .filter(l => l.p1 === pointId || l.p2 === pointId)
    .map(l => (l.p1 === pointId ? l.p2 : l.p1));
}

// 2B çapraz çarpım: o merkezine göre a ve b vektörlerinin yönü
function cross2d(o, a, b) {
  return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
}

// İki doğru parçasının gerçek (uç nokta dışı) kesişimini kontrol eder
export function segmentsIntersect(a1, a2, b1, b2) {
  const d1 = cross2d(b1, b2, a1);
  const d2 = cross2d(b1, b2, a2);
  const d3 = cross2d(a1, a2, b1);
  const d4 = cross2d(a1, a2, b2);

  // Her parçanın uç noktaları diğer parçanın iki farklı tarafındaysa → kesişir
  if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) &&
      ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) return true;

  return false; // ortak uç nokta veya paralel = kesişmez
}

// Yeni çizgi (p1Id→p2Id) mevcut hiçbir çizgiyi kesiyor mu?
export function isMoveLegal(lines, points, p1Id, p2Id) {
  const pt1 = points[p1Id];
  const pt2 = points[p2Id];

  for (const line of lines) {
    // Ortak uç nokta paylaşan çizgiler kesişmez, atla
    if (line.p1 === p1Id || line.p1 === p2Id ||
        line.p2 === p1Id || line.p2 === p2Id) continue;

    if (segmentsIntersect(pt1, pt2, points[line.p1], points[line.p2])) return false;
  }
  return true;
}

export function findNewTriangles(existingLines, newP1, newP2) {
  const nbrs1   = getNeighbors(newP1, existingLines);
  const nbrs2Set = new Set(getNeighbors(newP2, existingLines));
  const result  = [];

  for (const c of nbrs1) {
    if (nbrs2Set.has(c) && c !== newP1 && c !== newP2) {
      const [a, b, d] = [newP1, newP2, c].sort((x, y) => x - y);
      result.push({ p1: a, p2: b, p3: d });
    }
  }
  return result;
}

// Tüm yasal hamleler: çizgi yok + kesişme yok
export function getAllPossibleMoves(lines, points) {
  const n = points.length;
  const existing = new Set(lines.map(l => lineKey(l.p1, l.p2)));
  const moves = [];

  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++)
      if (!existing.has(lineKey(i, j)) && isMoveLegal(lines, points, i, j))
        moves.push({ p1: i, p2: j });

  return moves;
}

// Oyun, yasal hamle kalmayana kadar devam eder
export function isGameOver(lines, points) {
  return getAllPossibleMoves(lines, points).length === 0;
}

export function opponentThreats(currentLines, move, points) {
  const after = [...currentLines, { p1: move.p1, p2: move.p2 }];
  return getAllPossibleMoves(after, points)
    .reduce((sum, m) => sum + findNewTriangles(after, m.p1, m.p2).length, 0);
}
