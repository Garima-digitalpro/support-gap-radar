const EPSILON = 1e-12;

export function normalizeVector(vector) {
  let sum = 0;
  for (const value of vector) sum += value * value;
  const norm = Math.sqrt(sum);
  if (norm < EPSILON) return [...vector];
  return vector.map((value) => value / norm);
}

export function cosineSimilarity(left, right) {
  if (!left?.length || left.length !== right?.length) return 0;
  let dot = 0;
  let leftNorm = 0;
  let rightNorm = 0;
  for (let index = 0; index < left.length; index += 1) {
    dot += left[index] * right[index];
    leftNorm += left[index] * left[index];
    rightNorm += right[index] * right[index];
  }
  const denominator = Math.sqrt(leftNorm) * Math.sqrt(rightNorm);
  return denominator < EPSILON ? 0 : dot / denominator;
}

function squaredDistance(left, right) {
  let sum = 0;
  for (let index = 0; index < left.length; index += 1) {
    const delta = left[index] - right[index];
    sum += delta * delta;
  }
  return sum;
}

function initializeCentroids(vectors, count) {
  const centroids = [normalizeVector(vectors[0])];
  const chosen = new Set([0]);

  while (centroids.length < count) {
    let bestIndex = -1;
    let bestDistance = -1;

    for (let index = 0; index < vectors.length; index += 1) {
      if (chosen.has(index)) continue;
      let nearest = Number.POSITIVE_INFINITY;
      for (const centroid of centroids) {
        nearest = Math.min(nearest, squaredDistance(vectors[index], centroid));
      }
      if (nearest > bestDistance) {
        bestDistance = nearest;
        bestIndex = index;
      }
    }

    if (bestIndex < 0) break;
    chosen.add(bestIndex);
    centroids.push(normalizeVector(vectors[bestIndex]));
  }

  return centroids;
}

export function kMeans(vectors, requestedClusters, maxIterations = 24) {
  if (!vectors?.length) return { assignments: [], centroids: [] };
  const clusterCount = Math.max(1, Math.min(requestedClusters, vectors.length));
  let centroids = initializeCentroids(vectors, clusterCount);
  let assignments = new Array(vectors.length).fill(-1);

  for (let iteration = 0; iteration < maxIterations; iteration += 1) {
    let changed = false;

    for (let vectorIndex = 0; vectorIndex < vectors.length; vectorIndex += 1) {
      let bestCluster = 0;
      let bestDistance = Number.POSITIVE_INFINITY;
      for (let clusterIndex = 0; clusterIndex < centroids.length; clusterIndex += 1) {
        const distance = squaredDistance(vectors[vectorIndex], centroids[clusterIndex]);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestCluster = clusterIndex;
        }
      }
      if (assignments[vectorIndex] !== bestCluster) {
        assignments[vectorIndex] = bestCluster;
        changed = true;
      }
    }

    const totals = Array.from({ length: centroids.length }, () =>
      new Array(vectors[0].length).fill(0),
    );
    const counts = new Array(centroids.length).fill(0);

    for (let vectorIndex = 0; vectorIndex < vectors.length; vectorIndex += 1) {
      const clusterIndex = assignments[vectorIndex];
      counts[clusterIndex] += 1;
      for (let dimension = 0; dimension < vectors[vectorIndex].length; dimension += 1) {
        totals[clusterIndex][dimension] += vectors[vectorIndex][dimension];
      }
    }

    centroids = totals.map((total, clusterIndex) => {
      if (!counts[clusterIndex]) return centroids[clusterIndex];
      return normalizeVector(total.map((value) => value / counts[clusterIndex]));
    });

    if (!changed) break;
  }

  return { assignments, centroids };
}

export function chooseClusterCount(ticketCount) {
  if (ticketCount <= 6) return 2;
  return Math.max(2, Math.min(6, Math.round(Math.sqrt(ticketCount / 2))));
}

export function chunkDocuments(documents, maxCharacters = 1500) {
  const chunks = [];

  for (const document of documents) {
    const paragraphs = String(document.text || "")
      .split(/\n\s*\n/g)
      .map((paragraph) => paragraph.replace(/\s+/g, " ").trim())
      .filter(Boolean);
    let current = "";
    let chunkIndex = 0;

    const pushCurrent = () => {
      if (!current.trim()) return;
      chunks.push({
        id: `${document.name}::${chunkIndex}`,
        sourceName: document.name,
        text: current.trim(),
      });
      chunkIndex += 1;
      current = "";
    };

    for (const paragraph of paragraphs) {
      if (paragraph.length > maxCharacters) {
        pushCurrent();
        for (let start = 0; start < paragraph.length; start += maxCharacters) {
          chunks.push({
            id: `${document.name}::${chunkIndex}`,
            sourceName: document.name,
            text: paragraph.slice(start, start + maxCharacters),
          });
          chunkIndex += 1;
        }
        continue;
      }

      const candidate = current ? `${current}\n\n${paragraph}` : paragraph;
      if (candidate.length > maxCharacters) pushCurrent();
      current = current ? `${current}\n\n${paragraph}` : paragraph;
    }
    pushCurrent();
  }

  return chunks;
}

export function retrieveTopChunks(queryVector, chunks, chunkVectors, limit = 3) {
  return chunks
    .map((chunk, index) => ({
      ...chunk,
      similarity: cosineSimilarity(queryVector, chunkVectors[index]),
    }))
    .sort((left, right) => right.similarity - left.similarity)
    .slice(0, limit);
}

export const COVERAGE_WEIGHTS = {
  covered: 1,
  partial: 0.5,
  missing: 0,
  contradiction: 0,
};

export function calculateCoverage(items) {
  if (!items?.length) return 0;
  const score = items.reduce(
    (sum, item) => sum + (COVERAGE_WEIGHTS[item.status] ?? 0),
    0,
  );
  return Math.round((score / items.length) * 100);
}

export function countStatuses(items) {
  const counts = { covered: 0, partial: 0, missing: 0, contradiction: 0 };
  for (const item of items || []) {
    if (Object.hasOwn(counts, item.status)) counts[item.status] += 1;
  }
  return counts;
}
