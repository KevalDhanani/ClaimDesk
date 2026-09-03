function normalizeEvidence(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function evidenceMatches(claim: string, clues: string[]): boolean {
  const normalizedClaim = normalizeEvidence(claim);
  if (!normalizedClaim || normalizedClaim.length < 4) return false;

  return clues.some((clue) => {
    const normalizedClue = normalizeEvidence(clue);
    if (!normalizedClue) return false;
    if (normalizedClaim.includes(normalizedClue)) return true;
    if (normalizedClue.includes(normalizedClaim) && normalizedClaim.length >= 8) {
      return true;
    }

    const claimTokens = new Set(normalizedClaim.split(" ").filter((t) => t.length > 2));
    const clueTokens = normalizedClue.split(" ").filter((t) => t.length > 2);
    if (clueTokens.length === 0) return false;
    const hits = clueTokens.filter((t) => claimTokens.has(t)).length;
    return hits / clueTokens.length >= 0.6;
  });
}

export function ownershipChallengePrompt(): {
  challengeType: "internal_detail";
  prompt: string;
  guidance: string;
} {
  return {
    challengeType: "internal_detail",
    prompt:
      "Share one identifying detail inside or on the item that would not appear on the public listing.",
    guidance:
      "Ask the passenger for a private detail (for example contents, engravings, or accessories). Do not invent or reveal restricted evidence. Submit their answer with verify_ownership.",
  };
}
