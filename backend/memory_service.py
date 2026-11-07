"""
ClientPulse Memory Service
--------------------------
Orchestrates client intelligence, decoupling the Hindsight persistent memory engine
and generative AI processing from user interfaces.
"""

from datetime import datetime
import json
import os
from typing import Dict, Any, List, Optional

from backend.hindsight_engine import HindsightClient
from backend.ai_service import AIService


class ClientMemoryService:
    """
    Decoupled service handling client profiles, Hindsight memory banks,
    and adaptive learning loops.
    """

    def __init__(self, storage_dir: str = "data"):
        self.storage_dir = storage_dir
        os.makedirs(self.storage_dir, exist_ok=True)
        self.clients_file = os.path.join(self.storage_dir, "clients.json")
        self.outcomes_file = os.path.join(self.storage_dir, "learning_history.json")
        
        self.hindsight = HindsightClient(storage_dir=os.path.join(self.storage_dir, "hindsight_banks"))
        self.ai = AIService()

        self.clients: Dict[str, Dict[str, Any]] = {}
        self.learning_history: List[Dict[str, Any]] = []

        self._load_data()

    def _load_data(self):
        # Load Clients
        if os.path.exists(self.clients_file):
            try:
                with open(self.clients_file, "r", encoding="utf-8") as f:
                    self.clients = json.load(f)
            except Exception as e:
                print(f"Error loading clients: {e}")
                self._seed_default_clients()
        else:
            self._seed_default_clients()

        # Load Learning History
        if os.path.exists(self.outcomes_file):
            try:
                with open(self.outcomes_file, "r", encoding="utf-8") as f:
                    self.learning_history = json.load(f)
            except Exception as e:
                print(f"Error loading learning history: {e}")
                self._seed_default_outcomes()
        else:
            self._seed_default_outcomes()

    def _save_clients(self):
        with open(self.clients_file, "w", encoding="utf-8") as f:
            json.dump(self.clients, f, indent=2)

    def _save_learning_history(self):
        with open(self.outcomes_file, "w", encoding="utf-8") as f:
            json.dump(self.learning_history, f, indent=2)

    def _seed_default_clients(self):
        default_clients = {
            "c_apex": {
                "id": "c_apex",
                "name": "Sarah Chen",
                "company": "Apex Digital Labs",
                "industry": "B2B SaaS / Growth",
                "role": "VP of Growth & Marketing",
                "status": "Active Client",
                "monthly_value": "₹1,50,000/mo",
                "avatar_url": "/src/assets/images/avatar_sarah_chen_1794039525628.jpg",
                "created_at": "2026-09-12T10:00:00Z",
                "health_score": 94,
                "notes": "Hyper-focused on customer acquisition cost and pipeline velocity."
            },
            "c_quantum": {
                "id": "c_quantum",
                "name": "Marcus Vance",
                "company": "Quantum Retail Tech",
                "industry": "Omnichannel E-commerce",
                "role": "Founder & CEO",
                "status": "Proposal Review",
                "monthly_value": "₹3,20,000/mo",
                "avatar_url": "/src/assets/images/avatar_marcus_vance_1794039526648.jpg",
                "created_at": "2026-10-01T14:30:00Z",
                "health_score": 78,
                "notes": "Evaluating 3 agencies. Highly receptive to social proof in retail tech."
            },
            "c_lumina": {
                "id": "c_lumina",
                "name": "Elena Rostova",
                "company": "Lumina Health Systems",
                "industry": "MedTech / Health Diagnostics",
                "role": "Director of Commercial Strategy",
                "status": "Onboarding",
                "monthly_value": "₹2,10,000/mo",
                "avatar_url": "/src/assets/images/avatar_elena_rostova_1794039526396.jpg",
                "created_at": "2026-10-18T09:15:00Z",
                "health_score": 88,
                "notes": "HIPAA compliance and clinical accuracy are non-negotiable prerequisites."
            }
        }
        self.clients = default_clients
        self._save_clients()

        # Initialize Hindsight memory banks for seeded clients
        for c_id, client in default_clients.items():
            bank = self.hindsight.get_or_create_bank(c_id, client["name"])
            if not bank.world_facts:
                if c_id == "c_apex":
                    self.hindsight.retain(
                        bank.bank_id,
                        {
                            "channel": "video_meeting",
                            "summary": "Q4 Strategy Alignment Call: Targeting ₹1.8 Cr ARR by end of fiscal year.",
                            "raw_content": "Sarah stated their blended CAC target is ₹4,200. Current CAC is ₹5,800 on paid search. Wants to shift 30% of budget into LinkedIn Thought Leadership and account-based SDR enablement.",
                            "sentiment": "positive",
                            "key_quotes": ["We cannot afford vanity clicks; every lead must have an enterprise email address."]
                        },
                        extracted_facts=[
                            {"fact": "Blended target CAC is ₹4,200 (down from ₹5,800)", "category": "budget", "confidence": 0.98},
                            {"fact": "Q4 revenue target is ₹1.8 Cr ARR", "category": "budget", "confidence": 0.95},
                            {"fact": "Wants to shift 30% of search ad spend to LinkedIn ABM", "category": "preference", "confidence": 0.92}
                        ],
                        extracted_observations=[
                            {"belief": "Strongly skeptical of broad match search keywords", "category": "objection", "impact_level": "high"},
                            {"belief": "Prioritizes lead quality over lead volume", "category": "buying_signal", "impact_level": "high"}
                        ]
                    )
                elif c_id == "c_quantum":
                    self.hindsight.retain(
                        bank.bank_id,
                        {
                            "channel": "email",
                            "summary": "Contract terms inquiry regarding 6-month lock-in.",
                            "raw_content": "Marcus expressed hesitation about the mandatory 6-month commitment. Mentioned previous agency burned ₹3,50,000 on Meta ads without attribution clarity.",
                            "sentiment": "hesitant",
                            "key_quotes": ["I've been burned by long agency contracts before with no clear kill switch."]
                        },
                        extracted_facts=[
                            {"fact": "Previous agency wasted ₹3,50,000 with poor attribution", "category": "contractual", "confidence": 0.95},
                            {"fact": "Strong aversion to rigid long-term commitments", "category": "preference", "confidence": 0.99}
                        ],
                        extracted_observations=[
                            {"belief": "High trauma from unproven agency retainers; requires milestone-based exit ramp", "category": "risk", "impact_level": "high"}
                        ]
                    )

    def _seed_default_outcomes(self):
        self.learning_history = [
            {
                "id": "learn_01",
                "client_id": "c_quantum",
                "client_name": "Marcus Vance",
                "timestamp": "2026-10-25T16:00:00Z",
                "action_taken": "Offered a 60-day performance pilot with attribution dashboard guarantee instead of 6-month lock-in",
                "outcome_result": "Success - Accepted",
                "rule_learned": "Offering 60-day milestone checkpoints overcomes rigid retainer aversion for founder-led retail startups.",
                "weight_adjustment": "positive",
                "impact": "Increased contract close probability from 45% to 85%"
            },
            {
                "id": "learn_02",
                "client_id": "c_apex",
                "client_name": "Sarah Chen",
                "timestamp": "2026-10-15T11:20:00Z",
                "action_taken": "Shared detailed 18-page PDF deck regarding creative concepts",
                "outcome_result": "Delayed - Ignored",
                "rule_learned": "Executive growth leaders prefer 3-bullet metric summaries over long PDF design decks.",
                "weight_adjustment": "negative",
                "impact": "Decreased email response latency by switching to bulleted executive memos"
            }
        ]
        self._save_learning_history()

    # Client Profile Management
    def get_all_clients(self) -> List[Dict[str, Any]]:
        return list(self.clients.values())

    def get_client(self, client_id: str) -> Optional[Dict[str, Any]]:
        return self.clients.get(client_id)

    def add_client(self, client_data: Dict[str, Any]) -> Dict[str, Any]:
        c_id = client_data.get("id") or f"c_{int(datetime.utcnow().timestamp())}"
        client_data["id"] = c_id
        client_data["created_at"] = datetime.utcnow().isoformat() + "Z"
        client_data["health_score"] = client_data.get("health_score", 85)
        self.clients[c_id] = client_data
        self._save_clients()

        # Initialize Hindsight memory bank
        self.hindsight.get_or_create_bank(c_id, client_data.get("name", "New Client"))
        return client_data

    def update_client(self, client_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        if client_id not in self.clients:
            return None
        self.clients[client_id].update(updates)
        self._save_clients()
        return self.clients[client_id]

    def delete_client(self, client_id: str) -> bool:
        if client_id in self.clients:
            del self.clients[client_id]
            self._save_clients()
            return True
        return False

    # Conversation Input & Hindsight Retention
    def record_interaction(
        self,
        client_id: str,
        interaction_text: str,
        channel: str = "email"
    ) -> Dict[str, Any]:
        client = self.get_client(client_id)
        if not client:
            raise ValueError(f"Client {client_id} does not exist.")

        bank = self.hindsight.get_or_create_bank(client_id, client["name"])

        # Fetch existing memory context to assist extraction
        existing_memories = self.hindsight.recall(bank.bank_id, limit=5)
        memory_summary = json.dumps({
            "facts": [f["fact"] for f in existing_memories.get("facts", [])[:5]],
            "observations": [o["belief"] for o in existing_memories.get("observations", [])[:5]]
        })

        # Real Gemini analysis - No hardcoded answers
        extracted = self.ai.extract_memory_from_interaction(
            client_name=client["name"],
            interaction_text=interaction_text,
            channel=channel,
            existing_memory_summary=memory_summary
        )

        # Retain into Hindsight engine
        retention_result = self.hindsight.retain(
            bank_id=bank.bank_id,
            interaction={
                "channel": channel,
                "summary": extracted.get("summary", "Client interaction recorded."),
                "raw_content": interaction_text,
                "sentiment": extracted.get("sentiment", "neutral"),
                "key_quotes": extracted.get("key_quotes", [])
            },
            extracted_facts=extracted.get("world_facts", []),
            extracted_observations=extracted.get("observations", []),
            updated_mental_model=extracted.get("mental_model_updates")
        )

        return {
            "retention": retention_result,
            "extracted": extracted
        }

    # Hindsight Memory Inspection
    def get_client_memory(self, client_id: str) -> Dict[str, Any]:
        client = self.get_client(client_id)
        if not client:
            return {}
        bank = self.hindsight.get_or_create_bank(client_id, client["name"])
        recalled = self.hindsight.recall(bank.bank_id, query="", limit=50)
        return recalled

    # AI Assistant Q&A
    def ask_client_assistant(self, client_id: str, question: str) -> str:
        client = self.get_client(client_id)
        if not client:
            return "Client not found."
        memory_bundle = self.get_client_memory(client_id)
        return self.ai.answer_client_query(client["name"], question, memory_bundle)

    # Sales Follow-up Recommendations
    def get_sales_recommendations(self, client_id: str) -> Dict[str, Any]:
        client = self.get_client(client_id)
        if not client:
            return {}
        memory_bundle = self.get_client_memory(client_id)
        return self.ai.generate_sales_recommendations(
            client_name=client["name"],
            memory_bundle=memory_bundle,
            learning_history=self.learning_history
        )

    # Outcome Learning & History
    def log_interaction_outcome(
        self,
        client_id: str,
        action_taken: str,
        outcome_result: str,
        notes: str
    ) -> Dict[str, Any]:
        client = self.get_client(client_id)
        client_name = client["name"] if client else "Client"

        learning = self.ai.analyze_outcome(
            client_name=client_name,
            action_taken=action_taken,
            outcome_result=outcome_result,
            notes=notes
        )

        new_entry = {
            "id": f"learn_{int(datetime.utcnow().timestamp())}",
            "client_id": client_id,
            "client_name": client_name,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "action_taken": action_taken,
            "outcome_result": outcome_result,
            "rule_learned": learning.get("rule_learned", "Continuous feedback recorded."),
            "weight_adjustment": learning.get("recommended_weight_adjustment", "positive"),
            "impact": learning.get("client_behavioral_shift", "Updated behavioral model.")
        }
        self.learning_history.insert(0, new_entry)
        self._save_learning_history()
        return new_entry

    def get_learning_history(self) -> List[Dict[str, Any]]:
        return self.learning_history
