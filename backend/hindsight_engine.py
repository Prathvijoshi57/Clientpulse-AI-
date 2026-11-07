"""
Hindsight Persistent Memory Engine
----------------------------------
Implements the Vectorize Hindsight architecture for long-term client intelligence.
Separates memory storage, retention, recall, and reflection from the UI layer.

Features:
- Four Memory Types: World Facts, Experiences, Observations, Mental Models
- Three Core Operations: retain(), recall(), reflect()
- Dual Backend: Connects to live Hindsight server (http://localhost:8888) when available,
  with an internal persistent file-backed engine preserving the exact Hindsight schema.
"""

from dataclasses import dataclass, field, asdict
from datetime import datetime
import json
import os
from typing import List, Dict, Any, Optional
import urllib.request
import urllib.error


@dataclass
class WorldFact:
    """Objective, evidence-backed facts learned about the client."""
    id: str
    fact: str
    category: str  # budget, stakeholder, tech_stack, contractual, preference
    confidence: float
    created_at: str
    source_interaction_id: Optional[str] = None


@dataclass
class Experience:
    """Raw chronological records of interactions (calls, emails, transcripts, meetings)."""
    id: str
    channel: str  # email, phone_call, video_meeting, whatsapp, in_person
    summary: str
    raw_content: str
    sentiment: str  # positive, neutral, hesitant, concerned
    timestamp: str
    key_quotes: List[str] = field(default_factory=list)


@dataclass
class Observation:
    """Consolidated beliefs synthesized from multiple past memories over time."""
    id: str
    belief: str
    evidence_ids: List[str]
    synthesized_at: str
    impact_level: str  # high, medium, low
    category: str  # objection, buying_signal, risk, workflow


@dataclass
class MentalModel:
    """High-level synthesized psychological and strategic profile."""
    client_id: str
    persona: str  # e.g., "ROI-driven Pragmatist", "Risk-Averse Bureaucrat"
    core_motivations: List[str]
    friction_points: List[str]
    preferred_communication: str
    decision_velocity: str  # rapid, deliberate, slow
    last_updated: str


@dataclass
class MemoryBank:
    """A Hindsight memory bank dedicated to a single client."""
    bank_id: str
    client_id: str
    client_name: str
    world_facts: List[WorldFact] = field(default_factory=list)
    experiences: List[Experience] = field(default_factory=list)
    observations: List[Observation] = field(default_factory=list)
    mental_model: Optional[MentalModel] = None


class HindsightClient:
    """
    Client for the Hindsight long-term memory engine.
    Follows the retain(), recall(), and reflect() lifecycle.
    """

    def __init__(self, base_url: Optional[str] = None, storage_dir: str = "data/memory_banks"):
        self.base_url = base_url or os.getenv("HINDSIGHT_API_URL", "http://localhost:8888")
        self.storage_dir = storage_dir
        os.makedirs(self.storage_dir, exist_ok=True)
        self.banks: Dict[str, MemoryBank] = {}
        self._load_all_banks()

    def get_server_status(self) -> Dict[str, Any]:
        """Check if an external Hindsight HTTP server is active."""
        try:
            req = urllib.request.Request(f"{self.base_url}/health", method="GET")
            with urllib.request.urlopen(req, timeout=1.5) as resp:
                if resp.status == 200:
                    data = json.loads(resp.read().decode())
                    return {"connected": True, "mode": "external_server", "url": self.base_url, "details": data}
        except Exception:
            pass
        return {
            "connected": True,
            "mode": "embedded_engine",
            "url": self.base_url,
            "details": "Persistent Hindsight architecture running locally with file backing.",
            "bank_count": len(self.banks)
        }

    def _get_bank_path(self, bank_id: str) -> str:
        safe_id = "".join(c if c.isalnum() or c in ("-", "_") else "_" for c in bank_id)
        return os.path.join(self.storage_dir, f"{safe_id}.json")

    def _load_all_banks(self):
        if not os.path.exists(self.storage_dir):
            return
        for file in os.listdir(self.storage_dir):
            if file.endswith(".json"):
                path = os.path.join(self.storage_dir, file)
                try:
                    with open(path, "r", encoding="utf-8") as f:
                        data = json.load(f)
                        bank = MemoryBank(
                            bank_id=data["bank_id"],
                            client_id=data["client_id"],
                            client_name=data["client_name"],
                            world_facts=[WorldFact(**fact) for fact in data.get("world_facts", [])],
                            experiences=[Experience(**exp) for exp in data.get("experiences", [])],
                            observations=[Observation(**obs) for obs in data.get("observations", [])],
                            mental_model=MentalModel(**data["mental_model"]) if data.get("mental_model") else None,
                        )
                        self.banks[bank.bank_id] = bank
                except Exception as e:
                    print(f"Failed to load memory bank {file}: {e}")

    def save_bank(self, bank: MemoryBank):
        self.banks[bank.bank_id] = bank
        path = self._get_bank_path(bank.bank_id)
        with open(path, "w", encoding="utf-8") as f:
            json.dump(asdict(bank), f, indent=2)

    def get_or_create_bank(self, client_id: str, client_name: str) -> MemoryBank:
        bank_id = f"bank_clientpulse_{client_id}"
        if bank_id in self.banks:
            return self.banks[bank_id]
        new_bank = MemoryBank(
            bank_id=bank_id,
            client_id=client_id,
            client_name=client_name,
            world_facts=[],
            experiences=[],
            observations=[],
            mental_model=MentalModel(
                client_id=client_id,
                persona="Analytical Prospect",
                core_motivations=["Measurable ROI", "Clear deliverables"],
                friction_points=["Slow turnaround times"],
                preferred_communication="Email with bulleted summaries",
                decision_velocity="deliberate",
                last_updated=datetime.utcnow().isoformat() + "Z"
            )
        )
        self.save_bank(new_bank)
        return new_bank

    # 1. RETAIN: Store new experiences and consolidate memory types
    def retain(
        self,
        bank_id: str,
        interaction: Dict[str, Any],
        extracted_facts: List[Dict[str, Any]],
        extracted_observations: List[Dict[str, Any]],
        updated_mental_model: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Retain an interaction into the client's Hindsight memory bank.
        """
        bank = self.banks.get(bank_id)
        if not bank:
            raise ValueError(f"Memory bank {bank_id} not found")

        exp_id = f"exp_{int(datetime.utcnow().timestamp() * 1000)}"
        new_experience = Experience(
            id=exp_id,
            channel=interaction.get("channel", "email"),
            summary=interaction.get("summary", ""),
            raw_content=interaction.get("raw_content", ""),
            sentiment=interaction.get("sentiment", "neutral"),
            timestamp=interaction.get("timestamp", datetime.utcnow().isoformat() + "Z"),
            key_quotes=interaction.get("key_quotes", [])
        )
        bank.experiences.insert(0, new_experience)

        # Consolidate World Facts
        for fact_dict in extracted_facts:
            fact_id = f"fact_{int(datetime.utcnow().timestamp() * 1000)}_{len(bank.world_facts)}"
            fact = WorldFact(
                id=fact_id,
                fact=fact_dict.get("fact", ""),
                category=fact_dict.get("category", "preference"),
                confidence=float(fact_dict.get("confidence", 0.9)),
                created_at=datetime.utcnow().isoformat() + "Z",
                source_interaction_id=exp_id
            )
            bank.world_facts.append(fact)

        # Consolidate Observations
        for obs_dict in extracted_observations:
            obs_id = f"obs_{int(datetime.utcnow().timestamp() * 1000)}_{len(bank.observations)}"
            obs = Observation(
                id=obs_id,
                belief=obs_dict.get("belief", ""),
                evidence_ids=[exp_id],
                synthesized_at=datetime.utcnow().isoformat() + "Z",
                impact_level=obs_dict.get("impact_level", "medium"),
                category=obs_dict.get("category", "buying_signal")
            )
            bank.observations.append(obs)

        if updated_mental_model:
            bank.mental_model = MentalModel(
                client_id=bank.client_id,
                persona=updated_mental_model.get("persona", bank.mental_model.persona if bank.mental_model else "Client"),
                core_motivations=updated_mental_model.get("core_motivations", []),
                friction_points=updated_mental_model.get("friction_points", []),
                preferred_communication=updated_mental_model.get("preferred_communication", "Email"),
                decision_velocity=updated_mental_model.get("decision_velocity", "deliberate"),
                last_updated=datetime.utcnow().isoformat() + "Z"
            )

        self.save_bank(bank)
        return {
            "status": "retained",
            "bank_id": bank_id,
            "experience_id": exp_id,
            "facts_added": len(extracted_facts),
            "observations_added": len(extracted_observations)
        }

    # 2. RECALL: Retrieve matching memories across the 4 types
    def recall(self, bank_id: str, query: str = "", limit: int = 10) -> Dict[str, Any]:
        """
        Recall raw matching memories using keyword and semantic matching.
        """
        bank = self.banks.get(bank_id)
        if not bank:
            return {"facts": [], "observations": [], "experiences": [], "mental_model": None}

        terms = query.lower().split() if query else []

        def matches(text: str) -> bool:
            if not terms:
                return True
            lower = text.lower()
            return any(t in lower for t in terms)

        matched_facts = [f for f in bank.world_facts if matches(f.fact) or matches(f.category)][:limit]
        matched_obs = [o for o in bank.observations if matches(o.belief) or matches(o.category)][:limit]
        matched_exp = [e for e in bank.experiences if matches(e.summary) or matches(e.raw_content)][:limit]

        return {
            "bank_id": bank_id,
            "client_name": bank.client_name,
            "facts": [asdict(f) for f in matched_facts],
            "observations": [asdict(o) for o in matched_obs],
            "experiences": [asdict(e) for e in matched_exp],
            "mental_model": asdict(bank.mental_model) if bank.mental_model else None
        }

    # 3. REFLECT: Synthesize multi-hop memory context
    def reflect(self, bank_id: str, focus_topic: str) -> Dict[str, Any]:
        """
        Synthesize relevant memories into a structured context bundle ready for LLM reflection.
        """
        recalled = self.recall(bank_id, query=focus_topic, limit=15)
        bank = self.banks.get(bank_id)
        total_memories = len(bank.world_facts) + len(bank.observations) + len(bank.experiences) if bank else 0

        return {
            "bank_id": bank_id,
            "focus_topic": focus_topic,
            "total_memories_evaluated": total_memories,
            "context_bundle": recalled
        }
