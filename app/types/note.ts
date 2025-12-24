export type DraftData = {
  champion?: string;
  role?: string;
  opponentChampion?: string;
  me?: {
    champion?: string;
    role?: string;
    opponentChampion?: string;
  };
  teams?: {
    allies?: Array<{ summoner?: string; champion?: string }>;
    enemies?: Array<{ summoner?: string; champion?: string }>;
  };
  gameOutcome?: "victory" | "defeat" | "unknown";
};

export type StructuredNoteData = {
  matchup?: string;
  positive?: string;
  improvements?: string;
  gameOutcome?: "victory" | "defeat" | "unknown";
};

export type Note = {
  _id: string;
  text: string;
  createdAt?: string | Date;
  draft?: DraftData;
  summonerName?: string;
  ai?: {
    tags?: string[];
    embedding?: number[];
  };
  structured?: StructuredNoteData;
  userId?: string;
};

