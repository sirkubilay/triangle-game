import { getAllPossibleMoves, findNewTriangles, opponentThreats } from './triangleLogic';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function bestScoringMove(moves, lines, points) {
  let best = [], max = 0;
  for (const m of moves) {
    const n = findNewTriangles(lines, m.p1, m.p2, points).length;
    if (n > max) { max = n; best = [m]; }
    else if (n === max && n > 0) best.push(m);
  }
  return max > 0 ? randomFrom(best) : null;
}

export function getEasyMove(lines, points) {
  const moves = shuffle(getAllPossibleMoves(lines, points));
  return moves[0] ?? null;
}

export function getMediumMove(lines, points) {
  const moves = shuffle(getAllPossibleMoves(lines, points));
  if (!moves.length) return null;
  return bestScoringMove(moves, lines, points) ?? moves[0];
}

export function getHardMove(lines, points) {
  const moves = shuffle(getAllPossibleMoves(lines, points));
  if (!moves.length) return null;

  const scoring = bestScoringMove(moves, lines, points);
  if (scoring) return scoring;

  const safe = moves.filter(m => opponentThreats(lines, m, points) === 0);
  if (safe.length) return randomFrom(safe);

  let best = [moves[0]], minT = opponentThreats(lines, moves[0], points);
  for (let i = 1; i < moves.length; i++) {
    const t = opponentThreats(lines, moves[i], points);
    if (t < minT) { minT = t; best = [moves[i]]; }
    else if (t === minT) best.push(moves[i]);
  }
  return randomFrom(best);
}

export function getAIMove(lines, points, difficulty) {
  switch (difficulty) {
    case 'easy':   return getEasyMove(lines, points);
    case 'medium': return getMediumMove(lines, points);
    case 'hard':   return getHardMove(lines, points);
    default:       return getEasyMove(lines, points);
  }
}
