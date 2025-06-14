export const cosineSimilarity=function(vec1, vec2) {
    let dotProduct = 0, normA = 0, normB = 0;

    if (!vec1 || !vec2 || vec1.length !== vec2.length) return 0;
    
    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i];
      normA += vec1[i] * vec1[i];
      normB += vec2[i] * vec2[i];
    }
  
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }