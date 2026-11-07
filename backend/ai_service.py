"""
ClientPulse AI Service (Python)
-------------------------------
Handles intelligent memory extraction, client question answering,
sales follow-up generation, and outcome reinforcement learning via Gemini.

Ensures:
- NO hardcoded AI responses.
- Clean separation from UI and memory storage layers.
"""

import os
import json
from typing import Dict, Any, List, Optional
import urllib.request
import urllib.error


class AIService:
    """Provides generative AI capabilities for ClientPulse via Gemini."""

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY", "")
        self.model = "gemini-3.8-flash"

    def _call_gemini(self, prompt: str, system_instruction: str = "", response_mime: str = "text/plain") -> str:
        """Call Gemini API via direct REST to support both standalone Python and environments without external packages."""
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY environment variable is not set. Please configure it in your secrets.")

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.api_key}"
        
        payload: Dict[str, Any] = {
            "contents": [
                {
                    "parts": [{"text": prompt}]
                }
            ],
            "generationConfig": {}
        }

        if response_mime == "application/json":
            payload["generationConfig"]["responseMimeType"] = "application/json"

        if system_instruction:
            payload["systemInstruction"] = {
                "parts": [{"text": system_instruction}]
            }

        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json", "User-Agent": "aistudio-build"}
        )

        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                result = json.loads(resp.read().decode("utf-8"))
                candidates = result.get("candidates", [])
                if candidates and candidates[0].get("content", {}).get("parts"):
                    return candidates[0]["content"]["parts"][0].get("text", "")
                return ""
        except urllib.error.HTTPError as e:
            err_body = e.read().decode("utf-8")
            raise RuntimeError(f"Gemini API error ({e.code}): {err_body}")

    def extract_memory_from_interaction(
        self,
        client_name: str,
        interaction_text: str,
        channel: str,
        existing_memory_summary: str
    ) -> Dict[str, Any]:
        """
        Extracts Hindsight World Facts, Experiences, Observations, and Mental Model updates.
        """
        system_instruction = (
            "You are the Hindsight Memory Extraction Engine for ClientPulse AI. "
            "Analyze the client interaction. Extract objective facts (World Facts), "
            "synthesized behavioral observations (Observations), interaction sentiment, "
            "and subtle updates to the client's psychological mental model. "
            "Output strictly valid JSON matching the requested schema."
        )

        prompt = f"""
Client Name: {client_name}
Interaction Channel: {channel}
Existing Memory Summary:
{existing_memory_summary}

New Interaction Content:
\"\"\"
{interaction_text}
\"\"\"

Analyze this interaction and return a JSON object with:
{{
  "summary": "1-2 sentence objective summary of the exchange",
  "sentiment": "positive" | "neutral" | "hesitant" | "concerned",
  "key_quotes": ["Notable direct quotes or specific numbers mentioned"],
  "world_facts": [
    {{
      "fact": "Specific verifiable statement (e.g. Budget is ₹1.5L/mo, Q3 launch planned for Oct 14)",
      "category": "budget" | "stakeholder" | "tech_stack" | "contractual" | "preference",
      "confidence": 0.95
    }}
  ],
  "observations": [
    {{
      "belief": "Behavioral insight synthesized from tone, hesitations, or priorities",
      "category": "objection" | "buying_signal" | "risk" | "workflow",
      "impact_level": "high" | "medium" | "low"
    }}
  ],
  "mental_model_updates": {{
    "persona": "e.g. High-Velocity Growth Founder / Conservative Corporate CMO",
    "core_motivations": ["List 2-3 primary drivers"],
    "friction_points": ["List 1-2 key anxieties or objections"],
    "preferred_communication": "e.g. Direct Slack messages / Detailed formal executive memo",
    "decision_velocity": "rapid" | "deliberate" | "slow"
  }}
}}
"""
        response_text = self._call_gemini(prompt, system_instruction, response_mime="application/json")
        try:
            return json.loads(response_text)
        except Exception:
            # Fallback parsing in case of markdown fences
            clean = response_text.strip().replace("```json", "").replace("```", "").strip()
            return json.loads(clean)

    def answer_client_query(
        self,
        client_name: str,
        question: str,
        memory_bundle: Dict[str, Any]
    ) -> str:
        """
        Answers questions about a client grounded entirely in Hindsight recalled memory.
        """
        system_instruction = (
            "You are ClientPulse AI, an executive client intelligence assistant for agency owners. "
            "Your answers must be grounded in the client's Hindsight memory bank: their verified facts, "
            "past interactions, behavioral observations, and mental models. Be concise, highly strategic, "
            "and highlight specific evidence or numbers."
        )

        prompt = f"""
Client: {client_name}
User Question: "{question}"

Hindsight Recalled Memory Bank:
Facts: {json.dumps(memory_bundle.get("facts", []), indent=2)}
Observations: {json.dumps(memory_bundle.get("observations", []), indent=2)}
Recent Experiences: {json.dumps(memory_bundle.get("experiences", [])[:5], indent=2)}
Mental Model: {json.dumps(memory_bundle.get("mental_model", {}), indent=2)}

Provide a sharp, evidence-backed answer. If specific memory supports your statement, cite it directly.
"""
        return self._call_gemini(prompt, system_instruction)

    def generate_sales_recommendations(
        self,
        client_name: str,
        memory_bundle: Dict[str, Any],
        learning_history: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Generates personalized sales follow-ups, pitch hooks, and objection prep,
        informed by both the client's memory bank and the agency's historical learning outcomes.
        """
        system_instruction = (
            "You are a Senior Agency Sales Strategist at ClientPulse AI. "
            "Synthesize the client's memory profile and the agency's historical outcome learnings "
            "to formulate highly personalized, persuasive follow-up actions and pitches. "
            "Output strictly valid JSON."
        )

        prompt = f"""
Client: {client_name}
Hindsight Memory Bank:
{json.dumps(memory_bundle, indent=2)}

Agency Learning History (What has worked or failed in the past):
{json.dumps(learning_history, indent=2)}

Generate a personalized follow-up gameplan as JSON:
{{
  "immediate_next_step": "Exact concrete action the account manager should take next",
  "recommended_channel": "Email / WhatsApp / Phone / Loom Video / Lunch meeting",
  "optimal_timing": "e.g. Tuesday morning 9:30 AM before their weekly leadership sprint",
  "strategic_pitch_hook": "The specific value proposition or angle tailored to their mental model",
  "email_draft": {{
    "subject": "Compelling subject line without spammy tropes",
    "body": "Crisp 3-4 paragraph email tailored to their pain points and tone preference"
  }},
  "risk_radar": [
    "Identified risk or bottleneck to proactively mitigate"
  ],
  "objection_handling": [
    {{
      "anticipated_objection": "What they might push back on",
      "proven_rebuttal": "How to address it using their stated priorities"
    }}
  ]
}}
"""
        res = self._call_gemini(prompt, system_instruction, response_mime="application/json")
        try:
            return json.loads(res)
        except Exception:
            clean = res.strip().replace("```json", "").replace("```", "").strip()
            return json.loads(clean)

    def analyze_outcome(
        self,
        client_name: str,
        action_taken: str,
        outcome_result: str,
        notes: str
    ) -> Dict[str, Any]:
        """
        Learns from an interaction outcome (e.g. accepted pitch, ghosted, requested discount)
        to extract generalizable rules that improve future recommendations.
        """
        system_instruction = (
            "You are the Reinforcement Learning Module for ClientPulse AI. "
            "Analyze sales actions and outcomes to extract concrete behavioral learnings. "
            "Return valid JSON."
        )

        prompt = f"""
Client: {client_name}
Action Taken: {action_taken}
Outcome Result: {outcome_result} (e.g., Success / Partial Success / Rejection / Ghosted)
Notes: {notes}

Extract the core learning lesson and update rule for the agency:
{{
  "rule_learned": "Concise generalized principle (e.g. For healthcare clients, Loom walk-throughs increase proposal approval by 35%)",
  "client_behavioral_shift": "How this outcome alters our understanding of this specific client's persona",
  "recommended_weight_adjustment": "positive" | "negative" | "neutral",
  "confidence_score": 0.88
}}
"""
        res = self._call_gemini(prompt, system_instruction, response_mime="application/json")
        try:
            return json.loads(res)
        except Exception:
            clean = res.strip().replace("```json", "").replace("```", "").strip()
            return json.loads(clean)
