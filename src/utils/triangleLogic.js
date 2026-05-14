export function generateGridPoints(rows, cols, width = 760, height = 500, padding = 60) {
  const points = [];
  const stepX = cols > 1 ? (width - 2 * padding) / (cols - 1) : 0;
  const stepY = rows > 1 ? (height - 2 * padding) / (rows - 1) : 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      points.push({ id: r * cols + c, x: Math.round(padding + c * stepX), y: Math.round(padding + r * stepY) });
    }
  }
  return points;
}

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

// P noktasının A-B doğru parçasının iç kısmında olup olmadığını kontrol eder (uç noktalar dahil değil)
// Grid koordinatlarındaki yuvarlama kaynaklı ~0.5px sapmayı tolere etmek için 8px tolerans kullanır
export function pointOnSegmentInterior(p, a, b) {
  if (p.x === a.x && p.y === a.y) return false;
  if (p.x === b.x && p.y === b.y) return false;
  const dx = b.x - a.x, dy = b.y - a.y;
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return false;
  const cross = dx * (p.y - a.y) - dy * (p.x - a.x);
  if (cross * cross > 64 * len2) return false; // >8px uzakta → değil
  const t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2;
  return t > 0.001 && t < 0.999;
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

// Önerilen çizgi (pt1→pt2) üzerinde veya yakınında (≤8px) bir uç nokta olan
// kenarı "geçiş noktası" olarak sayar ve kesişim testinden hariç tutar.
function isPassThrough(ep, pt1, pt2, dx, dy, len2) {
  const cross = dx * (ep.y - pt1.y) - dy * (ep.x - pt1.x);
  if (cross * cross > 64 * len2) return false; // >8px uzakta → geçiş değil
  const t = ((ep.x - pt1.x) * dx + (ep.y - pt1.y) * dy) / len2;
  return t > 0 && t < 1; // parçanın iç kısmında mı?
}

// Yeni çizgiyle kesişen mevcut çizgiyi döndürür (yoksa null)
export function findConflictLine(lines, points, p1Id, p2Id) {
  const pt1 = points[p1Id];
  const pt2 = points[p2Id];
  const dx = pt2.x - pt1.x, dy = pt2.y - pt1.y;
  const len2 = dx * dx + dy * dy;
  for (const line of lines) {
    if (line.p1 === p1Id || line.p1 === p2Id ||
        line.p2 === p1Id || line.p2 === p2Id) continue;
    const lp1 = points[line.p1], lp2 = points[line.p2];
    if (len2 > 0 && (isPassThrough(lp1, pt1, pt2, dx, dy, len2) || isPassThrough(lp2, pt1, pt2, dx, dy, len2))) continue;
    const ldx = lp2.x - lp1.x, ldy = lp2.y - lp1.y, llen2 = ldx*ldx + ldy*ldy;
    // Önerilen çizginin uç noktası mevcut çizgi üzerindeyse → geçiş noktası, gerçek kesişim değil
    if (llen2 > 0 && (isPassThrough(pt1, lp1, lp2, ldx, ldy, llen2) || isPassThrough(pt2, lp1, lp2, ldx, ldy, llen2))) continue;
    if (segmentsIntersect(pt1, pt2, lp1, lp2)) {
      if (llen2 > 0 && points.some(p =>
        p.id !== p1Id && p.id !== p2Id && p.id !== line.p1 && p.id !== line.p2 &&
        isPassThrough(p, pt1, pt2, dx, dy, len2) &&
        isPassThrough(p, lp1, lp2, ldx, ldy, llen2)
      )) continue;
      return line;
    }
  }
  return null;
}

// Yeni çizgi (p1Id→p2Id) mevcut hiçbir çizgiyi kesiyor mu?
export function isMoveLegal(lines, points, p1Id, p2Id) {
  const pt1 = points[p1Id];
  const pt2 = points[p2Id];
  const dx = pt2.x - pt1.x, dy = pt2.y - pt1.y;
  const len2 = dx * dx + dy * dy;

  for (const line of lines) {
    // Ortak uç nokta paylaşan çizgiler kesişmez, atla
    if (line.p1 === p1Id || line.p1 === p2Id ||
        line.p2 === p1Id || line.p2 === p2Id) continue;

    const lp1 = points[line.p1], lp2 = points[line.p2];
    // Kenarın uç noktası önerilen segment üzerinde/yakınındaysa → geçiş noktası, atla
    if (len2 > 0 && (isPassThrough(lp1, pt1, pt2, dx, dy, len2) || isPassThrough(lp2, pt1, pt2, dx, dy, len2))) continue;
    const ldx = lp2.x - lp1.x, ldy = lp2.y - lp1.y, llen2 = ldx*ldx + ldy*ldy;
    // Önerilen çizginin uç noktası mevcut çizgi üzerindeyse → geçiş noktası, gerçek kesişim değil
    if (llen2 > 0 && (isPassThrough(pt1, lp1, lp2, ldx, ldy, llen2) || isPassThrough(pt2, lp1, lp2, ldx, ldy, llen2))) continue;

    if (segmentsIntersect(pt1, pt2, lp1, lp2)) {
      if (llen2 > 0 && points.some(p =>
        p.id !== p1Id && p.id !== p2Id && p.id !== line.p1 && p.id !== line.p2 &&
        isPassThrough(p, pt1, pt2, dx, dy, len2) &&
        isPassThrough(p, lp1, lp2, ldx, ldy, llen2)
      )) continue;
      return false;
    }
  }
  return true;
}

// Bir kenarın alt-parçası mı?
// Durum A: her iki uç nokta tek bir mevcut çizgi üzerindeyse → true
// Durum B: segment, birden fazla ardışık doğrusal çizgiyle tamamen kaplıysa → true
//   (örn. 0-1 ve 1-2 varken 0-2 çizmek istemek)
export function isSubsegment(lines, points, p1Id, p2Id) {
  const pt1 = points[p1Id];
  const pt2 = points[p2Id];

  // Durum A
  for (const line of lines) {
    const lp1 = points[line.p1], lp2 = points[line.p2];
    const p1on = (line.p1 === p1Id || line.p2 === p1Id) || pointOnSegmentInterior(pt1, lp1, lp2);
    const p2on = (line.p1 === p2Id || line.p2 === p2Id) || pointOnSegmentInterior(pt2, lp1, lp2);
    if (p1on && p2on) return true;
  }

  // Durum B: segment üzerindeki tüm noktaları topla, sırala, ardışık çiftleri kontrol et
  const onSeg = [p1Id];
  for (const p of points) {
    if (p.id !== p1Id && p.id !== p2Id && pointOnSegmentInterior(p, pt1, pt2))
      onSeg.push(p.id);
  }
  onSeg.push(p2Id);
  if (onSeg.length <= 2) return false; // ara nokta yok, Durum A halletti

  onSeg.sort((a, b) =>
    Math.hypot(points[a].x - pt1.x, points[a].y - pt1.y) -
    Math.hypot(points[b].x - pt1.x, points[b].y - pt1.y)
  );

  // Ardışık çiftlerin her biri de bir alt-segment mi kontrol et (özyinelemeli).
  // Komşu çiftler arasında başka nokta olmadığından Durum A'ya indirgenir, sonsuz döngü olmaz.
  for (let i = 0; i < onSeg.length - 1; i++) {
    if (!isSubsegment(lines, points, onSeg[i], onSeg[i + 1])) return false;
  }
  return true;
}

// a ile b arasında kenar var mı? Sadece gerçekten çizilmiş çizgiler sayılır.
function edgeExists(a, b, allLines) {
  return lineExists(allLines, a, b);
}

// Degenerate üçgen testi: p noktası a-b segmentine ≤1px mesafede mi?
function nearlyOnSegment(p, a, b) {
  if (p.x === a.x && p.y === a.y) return false;
  if (p.x === b.x && p.y === b.y) return false;
  const dx = b.x - a.x, dy = b.y - a.y;
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return false;
  const cross = dx * (p.y - a.y) - dy * (p.x - a.x);
  if (cross * cross > len2) return false; // >1px uzaklık
  const t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2;
  return t > 0.001 && t < 0.999;
}

export function findNewTriangles(existingLines, newP1, newP2, points) {
  const allLines = [...existingLines, { p1: newP1, p2: newP2 }];
  const result = [];
  const seen = new Set();

  if (!points) {
    const nbrs1 = getNeighbors(newP1, existingLines);
    const nbrs2Set = new Set(getNeighbors(newP2, existingLines));
    for (const c of nbrs1) {
      if (nbrs2Set.has(c) && c !== newP1 && c !== newP2) {
        const [a, b, d] = [newP1, newP2, c].sort((x, y) => x - y);
        result.push({ p1: a, p2: b, p3: d });
      }
    }
    return result;
  }

  const pt1 = points[newP1], pt2 = points[newP2];

  // Yeni çizgi üzerindeki tüm noktalar (uç noktalar + iç grid noktaları)
  const newLinePts = [newP1];
  for (const p of points) {
    if (p.id !== newP1 && p.id !== newP2 && pointOnSegmentInterior(p, pt1, pt2))
      newLinePts.push(p.id);
  }
  newLinePts.push(newP2);

  // Yeni üçgen, en az bir kenarını yeni çizgiden almalı:
  // yani iki köşesi newLinePts içinde olmalı.
  for (let i = 0; i < newLinePts.length; i++) {
    for (let j = i + 1; j < newLinePts.length; j++) {
      const X = newLinePts[i], Y = newLinePts[j];
      for (const p of points) {
        const Z = p.id;
        if (Z === X || Z === Y) continue;
        if (!edgeExists(X, Z, allLines)) continue;
        if (!edgeExists(Y, Z, allLines)) continue;

        const [a, b, d] = [X, Y, Z].sort((x, y) => x - y);
        const key = `${a}-${b}-${d}`;
        if (seen.has(key)) continue;

        const pa = points[a], pb = points[b], pd = points[d];
        const area = Math.abs((pb.x - pa.x) * (pd.y - pa.y) - (pd.x - pa.x) * (pb.y - pa.y));
        if (area === 0) continue;
        // Koordinat yuvarlama hatası: herhangi bir köşe karşı kenara ≤1px yakınsa degenere say.
        if (nearlyOnSegment(pa, pb, pd)) continue;
        if (nearlyOnSegment(pb, pa, pd)) continue;
        if (nearlyOnSegment(pd, pa, pb)) continue;

        seen.add(key);
        result.push({ p1: a, p2: b, p3: d });
      }
    }
  }
  return result;
}

// Tüm yasal hamleler: çizgi yok + kesişme yok + alt-parça değil
export function getAllPossibleMoves(lines, points) {
  const n = points.length;
  const existing = new Set(lines.map(l => lineKey(l.p1, l.p2)));
  const moves = [];

  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++)
      if (!existing.has(lineKey(i, j)) && isMoveLegal(lines, points, i, j) && !isSubsegment(lines, points, i, j))
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
    .reduce((sum, m) => sum + findNewTriangles(after, m.p1, m.p2, points).length, 0);
}

// newTri'nin tüm köşeleri existingTri'nin sınırında (kenar uç noktası veya kenar iç noktası) ise
// newTri, existingTri'nin içinde kalan bir alt-üçgendir → tekrar sayılmamalı
export function isSubTriangleOf(newTri, existingTri, points) {
  if (newTri.id === existingTri.id) return false;
  const etVerts = new Set([existingTri.p1, existingTri.p2, existingTri.p3]);
  const etEdges = [
    [existingTri.p1, existingTri.p2],
    [existingTri.p1, existingTri.p3],
    [existingTri.p2, existingTri.p3],
  ];
  return [newTri.p1, newTri.p2, newTri.p3].every(pid =>
    etVerts.has(pid) ||
    etEdges.some(([a, b]) => pointOnSegmentInterior(points[pid], points[a], points[b]))
  );
}
