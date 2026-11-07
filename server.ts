import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const BANKS_DIR = path.join(DATA_DIR, 'hindsight_banks');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(BANKS_DIR)) fs.mkdirSync(BANKS_DIR, { recursive: true });

const CLIENTS_FILE = path.join(DATA_DIR, 'clients.json');
const LEARNING_FILE = path.join(DATA_DIR, 'learning_history.json');

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Seed Data Helpers
function getClients(): Record<string, any> {
  if (fs.existsSync(CLIENTS_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(CLIENTS_FILE, 'utf-8'));
    } catch (e) {
      console.error('Error reading clients:', e);
    }
  }
  const defaults: Record<string, any> = {
    c_apex: {
      id: 'c_apex',
      name: 'Sarah Chen',
      company: 'Apex Digital Labs',
      industry: 'B2B SaaS / Growth',
      role: 'VP of Growth & Marketing',
      status: 'Active Client',
      monthly_value: '₹1,50,000/mo',
      avatar_url: '/src/assets/images/avatar_sarah_chen_1794039525628.jpg',
      created_at: '2026-09-12T10:00:00Z',
      health_score: 94,
      notes: 'Hyper-focused on customer acquisition cost and pipeline velocity.'
    },
    c_quantum: {
      id: 'c_quantum',
      name: 'Marcus Vance',
      company: 'Quantum Retail Tech',
      industry: 'Omnichannel E-commerce',
      role: 'Founder & CEO',
      status: 'Proposal Review',
      monthly_value: '₹3,20,000/mo',
      avatar_url: '/src/assets/images/avatar_marcus_vance_1794039526648.jpg',
      created_at: '2026-10-01T14:30:00Z',
      health_score: 78,
      notes: 'Evaluating 3 agencies. Highly receptive to social proof in retail tech.'
    },
    c_lumina: {
      id: 'c_lumina',
      name: 'Elena Rostova',
      company: 'Lumina Health Systems',
      industry: 'MedTech / Health Diagnostics',
      role: 'Director of Commercial Strategy',
      status: 'Onboarding',
      monthly_value: '₹2,10,000/mo',
      avatar_url: '/src/assets/images/avatar_elena_rostova_1794039526396.jpg',
      created_at: '2026-10-18T09:15:00Z',
      health_score: 88,
      notes: 'HIPAA compliance and clinical accuracy are non-negotiable prerequisites.'
    }
  };
  fs.writeFileSync(CLIENTS_FILE, JSON.stringify(defaults, null, 2));
  return defaults;
}

function saveClients(clients: Record<string, any>) {
  fs.writeFileSync(CLIENTS_FILE, JSON.stringify(clients, null, 2));
}

function getLearningHistory(): any[] {
  if (fs.existsSync(LEARNING_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(LEARNING_FILE, 'utf-8'));
    } catch (e) {
      console.error('Error reading learning history:', e);
    }
  }
  const defaults = [
    {
      id: 'learn_01',
      client_id: 'c_quantum',
      client_name: 'Marcus Vance',
      timestamp: '2026-10-25T16:00:00Z',
      action_taken: 'Offered a 60-day performance pilot with attribution dashboard guarantee instead of 6-month lock-in',
      outcome_result: 'Success - Accepted',
      rule_learned: 'Offering 60-day milestone checkpoints overcomes rigid retainer aversion for founder-led retail startups.',
      weight_adjustment: 'positive',
      impact: 'Increased contract close probability from 45% to 85%'
    },
    {
      id: 'learn_02',
      client_id: 'c_apex',
      client_name: 'Sarah Chen',
      timestamp: '2026-10-15T11:20:00Z',
      action_taken: 'Shared detailed 18-page PDF deck regarding creative concepts',
      outcome_result: 'Delayed - Ignored',
      rule_learned: 'Executive growth leaders prefer 3-bullet metric summaries over long PDF design decks.',
      weight_adjustment: 'negative',
      impact: 'Decreased email response latency by switching to bulleted executive memos'
    }
  ];
  fs.writeFileSync(LEARNING_FILE, JSON.stringify(defaults, null, 2));
  return defaults;
}

function saveLearningHistory(history: any[]) {
  fs.writeFileSync(LEARNING_FILE, JSON.stringify(history, null, 2));
}

function getMemoryBank(clientId: string, clientName: string = 'Client') {
  const bankId = `bank_clientpulse_${clientId}`;
  const bankPath = path.join(BANKS_DIR, `${bankId}.json`);
  if (fs.existsSync(bankPath)) {
    try {
      return JSON.parse(fs.readFileSync(bankPath, 'utf-8'));
    } catch (e) {
      console.error('Error reading memory bank:', e);
    }
  }

  // Initial Seed for new bank
  const initialBank: any = {
    bank_id: bankId,
    client_id: clientId,
    client_name: clientName,
    world_facts: [],
    experiences: [],
    observations: [],
    mental_model: {
      client_id: clientId,
      persona: 'Analytical Executive',
      core_motivations: ['Demonstrated ROI', 'Predictable Lead Pipeline'],
      friction_points: ['Lack of transparent reporting', 'Slow execution'],
      preferred_communication: 'Brief bullet-pointed emails with data',
      decision_velocity: 'deliberate',
      last_updated: new Date().toISOString()
    }
  };

  if (clientId === 'c_apex') {
    initialBank.world_facts = [
      { id: 'f_apex_1', fact: 'Target blended CAC is ₹4,200 down from historical ₹5,800', category: 'budget', confidence: 0.98, created_at: '2026-10-12T10:00:00Z' },
      { id: 'f_apex_2', fact: 'Q4 revenue objective set to ₹1.8 Cr ARR', category: 'budget', confidence: 0.96, created_at: '2026-10-12T10:00:00Z' },
      { id: 'f_apex_3', fact: 'Reallocating 30% of paid search into LinkedIn ABM targeting VP titles', category: 'preference', confidence: 0.94, created_at: '2026-10-14T15:30:00Z' },
      { id: 'f_apex_4', fact: 'Uses HubSpot CRM integrated with Stripe & Razorpay Billing', category: 'tech_stack', confidence: 0.92, created_at: '2026-10-14T15:30:00Z' }
    ];
    initialBank.experiences = [
      {
        id: 'exp_apex_1',
        channel: 'video_meeting',
        summary: 'Q4 Strategy Alignment Call: Targeting ₹1.8 Cr ARR by end of fiscal year.',
        raw_content: 'Sarah stated their blended CAC target is ₹4,200. Current CAC is ₹5,800 on paid search. Wants to shift 30% of budget into LinkedIn Thought Leadership and account-based SDR enablement.',
        sentiment: 'positive',
        timestamp: '2026-10-14T15:30:00Z',
        key_quotes: ['We cannot afford vanity clicks; every lead must have an enterprise corporate domain.']
      }
    ];
    initialBank.observations = [
      { id: 'obs_apex_1', belief: 'Extremely skeptical of vanity traffic metrics and top-of-funnel fluff', evidence_ids: ['exp_apex_1'], synthesized_at: '2026-10-14T16:00:00Z', impact_level: 'high', category: 'objection' },
      { id: 'obs_apex_2', belief: 'Responds immediately when proposals include direct CAC and pipeline velocity impact', evidence_ids: ['exp_apex_1'], synthesized_at: '2026-10-14T16:00:00Z', impact_level: 'high', category: 'buying_signal' }
    ];
    initialBank.mental_model = {
      client_id: clientId,
      persona: 'High-Velocity Growth Leader',
      core_motivations: ['Predictable pipeline ARR', 'Clear CAC payback period < 6 months'],
      friction_points: ['Wasteful ad spend', 'Slow turnaround time'],
      preferred_communication: 'Concise bullet points with hard metrics',
      decision_velocity: 'rapid',
      last_updated: '2026-10-14T16:00:00Z'
    };
  } else if (clientId === 'c_quantum') {
    initialBank.world_facts = [
      { id: 'f_q_1', fact: 'Previous agency burned ₹3,50,000 on Meta Ads with zero attribution tracking', category: 'contractual', confidence: 0.99, created_at: '2026-10-20T11:00:00Z' },
      { id: 'f_q_2', fact: 'Evaluating 3 competing digital agencies for Shopify Plus migration and acquisition', category: 'stakeholder', confidence: 0.95, created_at: '2026-10-20T11:00:00Z' },
      { id: 'f_q_3', fact: 'Gross margin is 62% on direct-to-consumer catalog items', category: 'budget', confidence: 0.91, created_at: '2026-10-22T09:15:00Z' }
    ];
    initialBank.experiences = [
      {
        id: 'exp_q_1',
        channel: 'email',
        summary: 'Contract terms inquiry regarding 6-month lock-in requirement.',
        raw_content: 'Marcus expressed hesitation about the mandatory 6-month commitment. Mentioned previous agency burned ₹3,50,000 on Meta ads without attribution clarity.',
        sentiment: 'hesitant',
        timestamp: '2026-10-20T11:00:00Z',
        key_quotes: ["I've been burned by long agency contracts before with no clear kill switch."]
      }
    ];
    initialBank.observations = [
      { id: 'obs_q_1', belief: 'Deep trauma from long-term agency retainers without milestone checkpoints', evidence_ids: ['exp_q_1'], synthesized_at: '2026-10-20T11:30:00Z', impact_level: 'high', category: 'risk' }
    ];
    initialBank.mental_model = {
      client_id: clientId,
      persona: 'Skeptical Pragmatic Founder',
      core_motivations: ['Risk mitigation', 'Clear ROAS accountability', 'Clean shopify attribution'],
      friction_points: ['Long lock-in contracts', 'Hidden retainer fees'],
      preferred_communication: 'WhatsApp voice notes and direct executive check-ins',
      decision_velocity: 'deliberate',
      last_updated: '2026-10-20T11:30:00Z'
    };
  }

  saveMemoryBank(initialBank);
  return initialBank;
}

function saveMemoryBank(bank: any) {
  const bankPath = path.join(BANKS_DIR, `${bank.bank_id}.json`);
  fs.writeFileSync(bankPath, JSON.stringify(bank, null, 2));
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // 1. Client CRUD
  app.get('/api/clients', (req, res) => {
    const clients = getClients();
    res.json(Object.values(clients));
  });

  app.post('/api/clients', (req, res) => {
    const { name, company, role, industry, monthly_value, notes, status, health_score, avatar_url } = req.body;
    if (!name || !company) {
      return res.status(400).json({ error: 'Name and company are required.' });
    }
    const id = `c_${Date.now()}`;
    const newClient = {
      id,
      name,
      company,
      role: role || 'Key Contact',
      industry: industry || 'Digital Agency',
      monthly_value: monthly_value || '$5,000/mo',
      status: status || 'Active Client',
      health_score: health_score || 88,
      notes: notes || '',
      avatar_url: avatar_url || '/src/assets/images/avatar_sarah_chen_1794039525628.jpg',
      created_at: new Date().toISOString()
    };
    const clients = getClients();
    clients[id] = newClient;
    saveClients(clients);

    // Initialize Hindsight memory bank
    getMemoryBank(id, name);
    res.json(newClient);
  });

  app.put('/api/clients/:id', (req, res) => {
    const { id } = req.params;
    const clients = getClients();
    if (!clients[id]) {
      return res.status(404).json({ error: 'Client not found.' });
    }
    clients[id] = { ...clients[id], ...req.body };
    saveClients(clients);
    res.json(clients[id]);
  });

  app.delete('/api/clients/:id', (req, res) => {
    const { id } = req.params;
    const clients = getClients();
    if (!clients[id]) {
      return res.status(404).json({ error: 'Client not found.' });
    }
    delete clients[id];
    saveClients(clients);
    res.json({ success: true });
  });

  // 2. Hindsight Memory Bank Retrieval
  app.get('/api/clients/:id/memory', (req, res) => {
    const { id } = req.params;
    const clients = getClients();
    const client = clients[id];
    if (!client) {
      return res.status(404).json({ error: 'Client not found.' });
    }
    const bank = getMemoryBank(id, client.name);
    res.json(bank);
  });

  // 3. Conversation Input & Hindsight Retention (Live Gemini Extraction)
  app.post('/api/clients/:id/interactions', async (req, res) => {
    const { id } = req.params;
    const { content, channel } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Content is required.' });
    }
    const clients = getClients();
    const client = clients[id];
    if (!client) {
      return res.status(404).json({ error: 'Client not found.' });
    }
    const bank = getMemoryBank(id, client.name);

    try {
      const prompt = `
Client Name: ${client.name} (${client.company})
Interaction Channel: ${channel || 'email'}

Existing Memories:
- Facts: ${JSON.stringify(bank.world_facts.slice(-5).map((f: any) => f.fact))}
- Observations: ${JSON.stringify(bank.observations.slice(-5).map((o: any) => o.belief))}

New Client Interaction Content:
"""
${content}
"""

Analyze this client interaction using the Vectorize Hindsight memory architecture.
Return a clean JSON object with:
{
  "summary": "1-2 sentence concise summary",
  "sentiment": "positive" | "neutral" | "hesitant" | "concerned",
  "key_quotes": ["1-2 notable verbatim statements"],
  "world_facts": [
    {
      "fact": "Objective statement learned (e.g. Budget is ₹1.5L/mo, Q3 launch planned for Oct 14)",
      "category": "budget" | "stakeholder" | "tech_stack" | "contractual" | "preference",
      "confidence": 0.95
    }
  ],
  "observations": [
    {
      "belief": "Behavioral insight synthesized over time",
      "category": "objection" | "buying_signal" | "risk" | "workflow",
      "impact_level": "high" | "medium" | "low"
    }
  ],
  "mental_model_updates": {
    "persona": "Updated behavioral persona label",
    "core_motivations": ["List 2-3 key drivers"],
    "friction_points": ["List 1-2 anxieties"],
    "preferred_communication": "Preferred format and cadence",
    "decision_velocity": "rapid" | "deliberate" | "slow"
  }
}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are the Hindsight Memory Extraction Engine for ClientPulse AI. Extract structured long-term memory types without hallucinating. Always return valid JSON.',
          responseMimeType: 'application/json',
        },
      });

      const extracted = JSON.parse(response.text || '{}');
      const expId = `exp_${Date.now()}`;

      // 1. Add Experience
      const newExperience = {
        id: expId,
        channel: channel || 'email',
        summary: extracted.summary || 'Interaction recorded.',
        raw_content: content,
        sentiment: extracted.sentiment || 'neutral',
        timestamp: new Date().toISOString(),
        key_quotes: extracted.key_quotes || []
      };
      bank.experiences.unshift(newExperience);

      // 2. Add World Facts
      if (Array.isArray(extracted.world_facts)) {
        for (let i = 0; i < extracted.world_facts.length; i++) {
          const item = extracted.world_facts[i];
          bank.world_facts.push({
            id: `fact_${Date.now()}_${i}`,
            fact: item.fact,
            category: item.category || 'preference',
            confidence: item.confidence || 0.92,
            created_at: new Date().toISOString(),
            source_interaction_id: expId
          });
        }
      }

      // 3. Add Observations
      if (Array.isArray(extracted.observations)) {
        for (let i = 0; i < extracted.observations.length; i++) {
          const item = extracted.observations[i];
          bank.observations.push({
            id: `obs_${Date.now()}_${i}`,
            belief: item.belief,
            evidence_ids: [expId],
            synthesized_at: new Date().toISOString(),
            impact_level: item.impact_level || 'medium',
            category: item.category || 'buying_signal'
          });
        }
      }

      // 4. Update Mental Model
      if (extracted.mental_model_updates) {
        bank.mental_model = {
          ...bank.mental_model,
          ...extracted.mental_model_updates,
          last_updated: new Date().toISOString()
        };
      }

      saveMemoryBank(bank);

      res.json({
        success: true,
        retained: {
          bank_id: bank.bank_id,
          experience: newExperience,
          facts_added: (extracted.world_facts || []).length,
          observations_added: (extracted.observations || []).length
        },
        extracted
      });
    } catch (error: any) {
      console.error('Error retaining interaction:', error);
      res.status(500).json({ error: error.message || 'Failed to process interaction' });
    }
  });

  // 4. Client AI Assistant (Q&A using Hindsight Recalled Memory)
  app.post('/api/clients/:id/chat', async (req, res) => {
    const { id } = req.params;
    const { question } = req.body;
    if (!question || !question.trim()) {
      return res.status(400).json({ error: 'Question is required.' });
    }
    const clients = getClients();
    const client = clients[id];
    if (!client) {
      return res.status(404).json({ error: 'Client not found.' });
    }
    const bank = getMemoryBank(id, client.name);

    try {
      const prompt = `
Client Profile:
- Name: ${client.name}
- Company: ${client.company}
- Role: ${client.role}
- Monthly Value: ${client.monthly_value}

Hindsight Memory Bank:
- Objective World Facts:
${JSON.stringify(bank.world_facts, null, 2)}

- Consolidated Behavioral Observations:
${JSON.stringify(bank.observations, null, 2)}

- Recent Experiences & Interaction Excerpts:
${JSON.stringify(bank.experiences.slice(0, 5), null, 2)}

- Psychological Mental Model:
${JSON.stringify(bank.mental_model, null, 2)}

User Question:
"${question}"

Provide a comprehensive, highly strategic answer directly grounded in this client's memories. If citing specific facts, numbers, or past interaction quotes, reference them clearly. Be actionable for the agency account director.
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are ClientPulse AI, an executive client intelligence assistant for marketing agencies and small businesses. All answers must be grounded in the recalled Hindsight memory bank. Never give generic boilerplate answers.',
        },
      });

      res.json({
        answer: response.text || 'No answer generated.',
        bank_id: bank.bank_id,
        memories_considered: bank.world_facts.length + bank.observations.length + bank.experiences.length
      });
    } catch (error: any) {
      console.error('Error answering client query:', error);
      res.status(500).json({ error: error.message || 'Failed to generate answer' });
    }
  });

  // 5. Sales Follow-up Recommendation Panel
  app.post('/api/clients/:id/recommendations', async (req, res) => {
    const { id } = req.params;
    const clients = getClients();
    const client = clients[id];
    if (!client) {
      return res.status(404).json({ error: 'Client not found.' });
    }
    const bank = getMemoryBank(id, client.name);
    const learningHistory = getLearningHistory();

    try {
      const prompt = `
Client: ${client.name} (${client.company}) - ${client.role}
Industry: ${client.industry} | Current Status: ${client.status} | Value: ${client.monthly_value}

Hindsight Memory Bank:
- World Facts: ${JSON.stringify(bank.world_facts)}
- Observations: ${JSON.stringify(bank.observations)}
- Mental Model: ${JSON.stringify(bank.mental_model)}
- Recent Interaction Quotes: ${JSON.stringify(bank.experiences.slice(0, 3).map((e: any) => e.key_quotes))}

Historical Agency Learning Rules (What worked/failed in previous deals):
${JSON.stringify(learningHistory, null, 2)}

Formulate a high-impact, personalized sales follow-up strategy.
Return strictly valid JSON:
{
  "immediate_next_step": "Precise concrete action step for the account lead",
  "recommended_channel": "Email / WhatsApp Voice / Video Walkthrough / Direct Call",
  "optimal_timing": "e.g. Tuesday morning 9:30 AM before their weekly executive sprint",
  "strategic_pitch_hook": "Value hook tailored specifically to their stated pain points and mental model",
  "email_draft": {
    "subject": "Punchy, relevant subject line without clickbait",
    "body": "Crisp 3-paragraph email ready to copy and send"
  },
  "risk_radar": [
    "Identified risk or bottleneck requiring proactive mitigation"
  ],
  "objection_handling": [
    {
      "anticipated_objection": "What they are likely to push back on",
      "proven_rebuttal": "How to address it using their stated priorities"
    }
  ]
}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are an Elite Sales & Agency Growth Strategist at ClientPulse AI. Tailor recommendations strictly to this client\'s Hindsight memory and the agency\'s historical learnings.',
          responseMimeType: 'application/json',
        },
      });

      const recs = JSON.parse(response.text || '{}');
      res.json(recs);
    } catch (error: any) {
      console.error('Error generating recommendations:', error);
      res.status(500).json({ error: error.message || 'Failed to generate recommendations' });
    }
  });

  // 6. Learning History & Outcome Reinforcement Feedback Loop
  app.get('/api/learning-history', (req, res) => {
    res.json(getLearningHistory());
  });

  app.post('/api/clients/:id/outcomes', async (req, res) => {
    const { id } = req.params;
    const { action_taken, outcome_result, notes } = req.body;
    if (!action_taken || !outcome_result) {
      return res.status(400).json({ error: 'Action taken and outcome result are required.' });
    }
    const clients = getClients();
    const client = clients[id];
    const clientName = client ? client.name : 'Client';

    try {
      const prompt = `
Client: ${clientName}
Action Taken: ${action_taken}
Outcome Result: ${outcome_result}
Context Notes: ${notes || 'None'}

Analyze this real-world outcome and formulate the durable learning rule for the agency:
{
  "rule_learned": "Concise, transferable agency principle (e.g. Offering a 60-day milestone exit ramp increases contract close rates for risk-averse retail founders)",
  "client_behavioral_shift": "How this outcome alters our understanding of this client",
  "recommended_weight_adjustment": "positive" | "negative" | "neutral",
  "confidence_score": 0.92
}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are the Reinforcement Learning Module of ClientPulse AI. Extract durable lessons that will guide future recommendation generation.',
          responseMimeType: 'application/json',
        },
      });

      const learning = JSON.parse(response.text || '{}');
      const newEntry = {
        id: `learn_${Date.now()}`,
        client_id: id,
        client_name: clientName,
        timestamp: new Date().toISOString(),
        action_taken,
        outcome_result,
        rule_learned: learning.rule_learned || 'Outcome recorded.',
        weight_adjustment: learning.recommended_weight_adjustment || 'positive',
        impact: learning.client_behavioral_shift || 'Behavioral model reinforced.'
      };

      const history = getLearningHistory();
      history.unshift(newEntry);
      saveLearningHistory(history);

      res.json(newEntry);
    } catch (error: any) {
      console.error('Error recording outcome:', error);
      res.status(500).json({ error: error.message || 'Failed to record outcome' });
    }
  });

  // 7. Hindsight Engine Status Check
  app.get('/api/hindsight/status', (req, res) => {
    const files = fs.readdirSync(BANKS_DIR).filter(f => f.endsWith('.json'));
    const totalBanks = files.length;
    let totalFacts = 0;
    let totalObs = 0;
    let totalExp = 0;

    files.forEach(f => {
      try {
        const data = JSON.parse(fs.readFileSync(path.join(BANKS_DIR, f), 'utf-8'));
        totalFacts += (data.world_facts || []).length;
        totalObs += (data.observations || []).length;
        totalExp += (data.experiences || []).length;
      } catch (e) {}
    });

    res.json({
      engine: 'Vectorize Hindsight Persistent Engine',
      version: '1.2.0',
      storage_location: BANKS_DIR,
      active_banks: totalBanks,
      total_world_facts: totalFacts,
      total_observations: totalObs,
      total_experiences: totalExp,
      core_operations: ['retain', 'recall', 'reflect'],
      memory_types: ['World Facts', 'Experiences', 'Observations', 'Mental Models'],
      hindsight_api_url: process.env.HINDSIGHT_API_URL || 'http://localhost:8888',
      connected_to_external: false,
      mode: 'Embedded Persistent Store (Hindsight Schema Conforming)'
    });
  });

  // 8. Python Source Code Viewer (for inspecting decoupled Streamlit & Hindsight code)
  app.get('/api/python-source', (req, res) => {
    const files: Record<string, string> = {};
    const readSafe = (filePath: string) => {
      try {
        if (fs.existsSync(filePath)) return fs.readFileSync(filePath, 'utf-8');
      } catch (e) {}
      return '';
    };

    files['app.py'] = readSafe(path.join(__dirname, 'app.py'));
    files['backend/hindsight_engine.py'] = readSafe(path.join(__dirname, 'backend', 'hindsight_engine.py'));
    files['backend/memory_service.py'] = readSafe(path.join(__dirname, 'backend', 'memory_service.py'));
    files['backend/ai_service.py'] = readSafe(path.join(__dirname, 'backend', 'ai_service.py'));
    files['requirements.txt'] = readSafe(path.join(__dirname, 'requirements.txt'));

    res.json(files);
  });

  // Mount Vite dev server in development
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CLIENTPULSE AI server running at http://localhost:${PORT}`);
  });
}

startServer();
