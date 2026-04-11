export interface FactionNode {
  id: string;
  name: string;
  description?: string;
  children?: FactionNode[];
  depth: number;
  category?: string;
  tags?: string[];
  status?: string;
  metadata?: Record<string, any>;
  // Premium Card Fields
  vibe?: string;
  representation?: string;
  tone?: string;
  summary?: string;
  philosophy?: string;
  highlights?: string;
  motto?: string;
  parentName?: string;
  relatedFactions?: {
    similar: string[];
    opposite: string[];
  };
}

export interface TreeData extends FactionNode {
  children: FactionNode[];
}
