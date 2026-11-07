export interface Client {
  id: string;
  name: string;
  company: string;
  role: string;
  industry: string;
  monthly_value: string;
  status: string;
  health_score: number;
  notes: string;
  avatar_url: string;
  created_at: string;
}

export interface WorldFact {
  id: string;
  fact: string;
  category: 'budget' | 'stakeholder' | 'tech_stack' | 'contractual' | 'preference' | string;
  confidence: number;
  created_at: string;
  source_interaction_id?: string;
}

export interface Experience {
  id: string;
  channel: string;
  summary: string;
  raw_content: string;
  sentiment: string;
  timestamp: string;
  key_quotes: string[];
}

export interface Observation {
  id: string;
  belief: string;
  evidence_ids: string[];
  synthesized_at: string;
  impact_level: 'high' | 'medium' | 'low' | string;
  category: 'objection' | 'buying_signal' | 'risk' | 'workflow' | string;
}

export interface MentalModel {
  client_id: string;
  persona: string;
  core_motivations: string[];
  friction_points: string[];
  preferred_communication: string;
  decision_velocity: 'rapid' | 'deliberate' | 'slow' | string;
  last_updated: string;
}

export interface MemoryBank {
  bank_id: string;
  client_id: string;
  client_name: string;
  world_facts: WorldFact[];
  experiences: Experience[];
  observations: Observation[];
  mental_model: MentalModel;
}

export interface LearningOutcome {
  id: string;
  client_id: string;
  client_name: string;
  timestamp: string;
  action_taken: string;
  outcome_result: string;
  rule_learned: string;
  weight_adjustment: 'positive' | 'negative' | 'neutral';
  impact: string;
}

export interface SalesRecommendations {
  immediate_next_step: string;
  recommended_channel: string;
  optimal_timing: string;
  strategic_pitch_hook: string;
  email_draft: {
    subject: string;
    body: string;
  };
  risk_radar: string[];
  objection_handling: Array<{
    anticipated_objection: string;
    proven_rebuttal: string;
  }>;
}

export interface HindsightStatus {
  engine: string;
  version: string;
  storage_location: string;
  active_banks: number;
  total_world_facts: number;
  total_observations: number;
  total_experiences: number;
  core_operations: string[];
  memory_types: string[];
  hindsight_api_url: string;
  connected_to_external: boolean;
  mode: string;
}
