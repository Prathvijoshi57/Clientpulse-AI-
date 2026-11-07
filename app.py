"""
CLIENTPULSE AI - Client Intelligence Platform
=============================================
Streamlit Web Application powered by Hindsight Persistent Memory Engine & Gemini AI.
"""

import streamlit as st
import json
from datetime import datetime
from backend.memory_service import ClientMemoryService

# Page configuration
st.set_page_config(
    page_title="CLIENTPULSE AI · Client Intelligence",
    page_icon="⚡",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom Styling for modern, clean typography
st.markdown("""
<style>
    .main {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .metric-card {
        background-color: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 18px;
        margin-bottom: 12px;
    }
    .memory-badge {
        font-size: 0.8rem;
        color: #475569;
        font-weight: 500;
    }
    .hindsight-banner {
        background-color: #f1f5f9;
        border: 1px solid #cbd5e1;
        border-radius: 6px;
        padding: 10px 14px;
        font-size: 0.85rem;
        margin-bottom: 20px;
    }
</style>
""", unsafe_allow_html=True)


@st.cache_resource
def get_service():
    return ClientMemoryService()

service = get_service()

# Sidebar: Client selection & Navigation
st.sidebar.title("CLIENTPULSE AI")
st.sidebar.caption("Client Intelligence & Persistent Memory Engine")

# Hindsight Engine Status in Sidebar
hindsight_status = service.hindsight.get_server_status()
if hindsight_status.get("mode") == "external_server":
    st.sidebar.success(f"● Hindsight Server: Active ({hindsight_status.get('url')})")
else:
    st.sidebar.info("● Hindsight Engine: Embedded Persistent Store")

# Client Selector
all_clients = service.get_all_clients()
client_options = {c["name"] + f" ({c['company']})": c["id"] for c in all_clients}

selected_client_label = st.sidebar.selectbox(
    "Select Client Context",
    options=list(client_options.keys()),
    index=0 if client_options else None
)

selected_client_id = client_options.get(selected_client_label) if selected_client_label else None
selected_client = service.get_client(selected_client_id) if selected_client_id else None

# Navigation Tabs
nav = st.sidebar.radio(
    "Navigate",
    [
        "1. Executive Dashboard",
        "2. Client Profiles",
        "3. Record Interaction",
        "4. Client Memory Bank",
        "5. AI Client Assistant",
        "6. Sales Recommendations",
        "7. Learning History"
    ]
)

# -------------------------------------------------------------
# 1. EXECUTIVE DASHBOARD
# -------------------------------------------------------------
if nav == "1. Executive Dashboard":
    st.subheader("Agency Client Intelligence Overview")
    st.caption("Live monitoring of client health, memory accumulation, and pipeline momentum.")

    col1, col2, col3, col4 = st.columns(4)
    total_mrr = sum(int(c.get("monthly_value", "0").replace("₹", "").replace("$", "").replace(",", "").replace("/mo", "").strip() or 0) for c in all_clients)
    avg_health = sum(c.get("health_score", 85) for c in all_clients) // max(len(all_clients), 1)

    with col1:
        st.metric("Total Active Clients", len(all_clients))
    with col2:
        st.metric("Tracked Monthly Revenue", f"₹{total_mrr:,}/mo")
    with col3:
        st.metric("Client Health Index", f"{avg_health}%")
    with col4:
        st.metric("Hindsight Memory Banks", len(service.hindsight.banks))

    st.markdown("---")
    
    col_left, col_right = st.columns([3, 2])

    with col_left:
        st.markdown("#### Client Portfolio Roster")
        for client in all_clients:
            with st.container():
                st.markdown(f"""
                **{client['name']}** · {client['company']} · *{client['role']}*  
                Industry: {client['industry']} | Monthly Value: **{client['monthly_value']}** | Health: **{client['health_score']}%**  
                Notes: {client.get('notes', 'No notes added.')}
                """)
                st.divider()

    with col_right:
        st.markdown("#### Recent Reinforcement Learnings")
        learnings = service.get_learning_history()[:3]
        for l in learnings:
            st.markdown(f"**{l['client_name']}** · *{l['outcome_result']}*")
            st.write(f"💡 {l['rule_learned']}")
            st.caption(f"Impact: {l.get('impact', '')}")
            st.divider()

# -------------------------------------------------------------
# 2. CLIENT PROFILES
# -------------------------------------------------------------
elif nav == "2. Client Profiles":
    st.subheader("Client Profiles & Account Management")
    st.caption("Add new accounts and view client dossiers.")

    tab_view, tab_add = st.tabs(["Active Profiles", "Add New Client"])

    with tab_view:
        if selected_client:
            st.markdown(f"### {selected_client['name']}")
            st.write(f"**Company:** {selected_client['company']} | **Role:** {selected_client['role']}")
            st.write(f"**Industry:** {selected_client['industry']} | **Value:** {selected_client['monthly_value']}")
            st.write(f"**Status:** {selected_client.get('status', 'Active')}")
            st.write(f"**Strategic Notes:** {selected_client.get('notes', 'None')}")

            # Associated Hindsight Bank ID
            st.info(f"Associated Hindsight Memory Bank: `bank_clientpulse_{selected_client['id']}`")
        else:
            st.write("No clients registered.")

    with tab_add:
        st.markdown("#### Register a New Client")
        with st.form("new_client_form"):
            c_name = st.text_input("Contact Full Name", placeholder="e.g. David Sterling")
            c_company = st.text_input("Company Name", placeholder="e.g. Apex Omnichannel")
            c_role = st.text_input("Job Title / Role", placeholder="e.g. Chief Revenue Officer")
            c_industry = st.text_input("Industry", placeholder="e.g. FinTech / WealthTech")
            c_val = st.text_input("Contract Value / Retainer", placeholder="e.g. ₹85,000/mo")
            c_notes = st.text_area("Initial Context / Background", placeholder="Key goals, past agency issues, or target objectives.")
            submitted = st.form_submit_button("Create Client & Initialize Memory Bank")

            if submitted and c_name and c_company:
                new_c = {
                    "name": c_name,
                    "company": c_company,
                    "role": c_role or "Key Stakeholder",
                    "industry": c_industry or "General Business",
                    "monthly_value": c_val or "₹75,000/mo",
                    "notes": c_notes,
                    "status": "Active Client",
                    "health_score": 90
                }
                service.add_client(new_c)
                st.success(f"Client {c_name} created with Hindsight memory bank initialized!")
                st.rerun()

# -------------------------------------------------------------
# 3. RECORD INTERACTION (CONVERSATION INPUT)
# -------------------------------------------------------------
elif nav == "3. Record Interaction":
    st.subheader(f"Record Interaction · {selected_client['name'] if selected_client else 'Client'}")
    st.caption("Paste meeting notes, emails, call transcripts, or chat messages. Hindsight will extract facts and consolidate memory.")

    if not selected_client:
        st.warning("Please select a client in the sidebar first.")
    else:
        channel = st.selectbox(
            "Interaction Channel",
            ["Email Exchange", "Video Meeting / Call Transcript", "Phone Call Notes", "WhatsApp / Slack", "In-Person Meeting"]
        )

        sample_prompts = {
            "Select sample...": "",
            "Budget & Target Update": f"{selected_client['name']} mentioned today that they are increasing the monthly performance marketing budget to ₹1,80,000 starting next quarter. They specifically want to cut back on TikTok ads because lead quality is poor, and reallocate 70% towards Google Search and high-intent LinkedIn sponsored content.",
            "Contract Hesitation": f"Had a check-in call with {selected_client['name']}. They expressed concern that our reporting dashboard isn't showing real-time CRM pipeline sync. If we cannot show closed-loop Salesforce attribution by end of month, they might delay the contract renewal.",
            "Stakeholder Introduction": f"{selected_client['name']} introduced their Chief Financial Officer, Robert Diaz. Robert is very conservative on upfront cash outlay and asked for net-45 payment terms or a 5% discount for full annual prepayment."
        }

        chosen_sample = st.selectbox("Or choose a pre-filled realistic scenario:", list(sample_prompts.keys()))
        initial_text = sample_prompts[chosen_sample] if chosen_sample != "Select sample..." else ""

        interaction_input = st.text_area(
            "Conversation / Interaction Text",
            value=initial_text,
            height=180,
            placeholder="Paste verbatim email, transcription, or call notes here..."
        )

        if st.button("Process & Retain into Hindsight Memory", type="primary"):
            if not interaction_input.strip():
                st.error("Please enter conversation content before submitting.")
            else:
                with st.spinner("Analyzing interaction with Gemini & retaining into Hindsight memory bank..."):
                    try:
                        res = service.record_interaction(
                            client_id=selected_client["id"],
                            interaction_text=interaction_input,
                            channel=channel.lower().replace(" ", "_")
                        )
                        st.success("Interaction retained successfully into Hindsight memory bank!")
                        
                        extracted = res.get("extracted", {})
                        col_a, col_b = st.columns(2)
                        with col_a:
                            st.markdown("##### Extracted World Facts")
                            for fact in extracted.get("world_facts", []):
                                st.write(f"• **[{fact.get('category')}]** {fact.get('fact')}")

                        with col_b:
                            st.markdown("##### Consolidated Observations")
                            for obs in extracted.get("observations", []):
                                st.write(f"• **[{obs.get('category')}]** {obs.get('belief')}")

                        st.info(f"Summary: {extracted.get('summary')}")
                    except Exception as e:
                        st.error(f"Error recording interaction: {str(e)}")

# -------------------------------------------------------------
# 4. CLIENT MEMORY SECTION
# -------------------------------------------------------------
elif nav == "4. Client Memory Bank":
    st.subheader(f"Hindsight Memory Bank · {selected_client['name'] if selected_client else 'Client'}")
    st.caption("Inspect remembered facts, experiences, observations, and psychological mental models.")

    if not selected_client:
        st.warning("Please select a client in the sidebar first.")
    else:
        memory = service.get_client_memory(selected_client["id"])
        
        tab_facts, tab_obs, tab_exp, tab_mental = st.tabs([
            f"World Facts ({len(memory.get('facts', []))})",
            f"Observations ({len(memory.get('observations', []))})",
            f"Raw Experiences ({len(memory.get('experiences', []))})",
            "Mental Model"
        ])

        with tab_facts:
            st.markdown("#### Objective World Facts")
            facts = memory.get("facts", [])
            if not facts:
                st.write("No world facts retained yet.")
            for f in facts:
                st.markdown(f"""
                **Fact:** {f.get('fact')}  
                Category: `{f.get('category')}` · Confidence: `{int(f.get('confidence', 0.9)*100)}%` · Date: `{f.get('created_at', '')[:10]}`
                """)
                st.divider()

        with tab_obs:
            st.markdown("#### Consolidated Behavioral Observations")
            obs = memory.get("observations", [])
            if not obs:
                st.write("No observations recorded yet.")
            for o in obs:
                st.markdown(f"""
                **Belief:** {o.get('belief')}  
                Category: `{o.get('category')}` · Impact: `{o.get('impact_level')}`
                """)
                st.divider()

        with tab_exp:
            st.markdown("#### Chronological Experiences & Transcripts")
            exps = memory.get("experiences", [])
            if not exps:
                st.write("No experiences recorded yet.")
            for e in exps:
                st.markdown(f"""
                **Channel:** `{e.get('channel')}` · Sentiment: `{e.get('sentiment')}` · Date: `{e.get('timestamp', '')[:10]}`  
                **Summary:** {e.get('summary')}  
                *Excerpt:* "{e.get('raw_content', '')[:140]}..."
                """)
                st.divider()

        with tab_mental:
            st.markdown("#### Psychological & Strategic Mental Model")
            mm = memory.get("mental_model")
            if mm:
                st.write(f"**Inferred Persona:** {mm.get('persona')}")
                st.write(f"**Decision Velocity:** {mm.get('decision_velocity')}")
                st.write(f"**Preferred Communication:** {mm.get('preferred_communication')}")
                st.write(f"**Core Motivations:** {', '.join(mm.get('core_motivations', []))}")
                st.write(f"**Friction Points & Anxieties:** {', '.join(mm.get('friction_points', []))}")
            else:
                st.write("Mental model not yet formed.")

# -------------------------------------------------------------
# 5. AI ASSISTANT (CLIENT Q&A)
# -------------------------------------------------------------
elif nav == "5. AI Client Assistant":
    st.subheader(f"AI Intelligence Assistant · {selected_client['name'] if selected_client else 'Client'}")
    st.caption("Ask questions about this client. The assistant grounds answers in Hindsight recalled memory.")

    if not selected_client:
        st.warning("Please select a client in the sidebar first.")
    else:
        sample_questions = [
            "What are their main objections regarding agency contracts?",
            "What is their target budget and key Q4 revenue targets?",
            "How should I format my next update email to match their preference?",
            "Who are the key decision-makers and what are their concerns?"
        ]
        
        st.write("Quick questions:")
        col_q1, col_q2 = st.columns(2)
        for i, sq in enumerate(sample_questions):
            col = col_q1 if i % 2 == 0 else col_q2
            if col.button(sq, key=f"sq_{i}"):
                st.session_state["user_query"] = sq

        user_query = st.text_input(
            "Ask about this client:",
            value=st.session_state.get("user_query", ""),
            placeholder="e.g. What specific metrics does this client care about most?"
        )

        if st.button("Ask Assistant", type="primary"):
            if not user_query.strip():
                st.error("Please enter a question.")
            else:
                with st.spinner("Synthesizing answer from Hindsight memory bank..."):
                    try:
                        answer = service.ask_client_assistant(selected_client["id"], user_query)
                        st.markdown("### Assistant Answer")
                        st.write(answer)
                    except Exception as e:
                        st.error(f"Error querying assistant: {str(e)}")

# -------------------------------------------------------------
# 6. SALES RECOMMENDATION PANEL
# -------------------------------------------------------------
elif nav == "6. Sales Recommendations":
    st.subheader(f"Sales Follow-up Recommendations · {selected_client['name'] if selected_client else 'Client'}")
    st.caption("AI-generated follow-up pitch, email draft, and objection defense based on memory & historical outcomes.")

    if not selected_client:
        st.warning("Please select a client in the sidebar first.")
    else:
        if st.button("Generate Fresh Recommendations", type="primary"):
            with st.spinner("Synthesizing sales strategy with Gemini..."):
                try:
                    recs = service.get_sales_recommendations(selected_client["id"])
                    st.session_state[f"recs_{selected_client['id']}"] = recs
                except Exception as e:
                    st.error(f"Error generating recommendations: {str(e)}")

        recs = st.session_state.get(f"recs_{selected_client['id']}")
        if recs:
            st.markdown("#### Immediate Recommended Action")
            st.info(f"👉 **{recs.get('immediate_next_step')}**\n\nChannel: **{recs.get('recommended_channel')}** | Timing: **{recs.get('optimal_timing')}**")

            st.markdown("#### Strategic Value Proposition Hook")
            st.success(recs.get("strategic_pitch_hook", ""))

            st.markdown("#### Ready-to-Send Email Draft")
            draft = recs.get("email_draft", {})
            st.text_input("Subject", value=draft.get("subject", ""), key="email_subj_preview")
            st.text_area("Body", value=draft.get("body", ""), height=160, key="email_body_preview")

            col_r, col_o = st.columns(2)
            with col_r:
                st.markdown("#### Risk Radar")
                for risk in recs.get("risk_radar", []):
                    st.warning(f"⚠️ {risk}")

            with col_o:
                st.markdown("#### Anticipated Objections & Rebuttals")
                for obj in recs.get("objection_handling", []):
                    st.write(f"**Objection:** {obj.get('anticipated_objection')}")
                    st.write(f"**Rebuttal:** {obj.get('proven_rebuttal')}")
                    st.divider()

# -------------------------------------------------------------
# 7. LEARNING HISTORY (REINFORCEMENT LOOPS)
# -------------------------------------------------------------
elif nav == "7. Learning History":
    st.subheader("Learning History & Reinforcement Feedback Loops")
    st.caption("How previous sales outcomes continuously refine future recommendations.")

    tab_history, tab_log = st.tabs(["Agency Learning Rules", "Log New Outcome"])

    with tab_history:
        history = service.get_learning_history()
        for item in history:
            with st.container():
                st.markdown(f"**Client:** {item.get('client_name')} · *{item.get('outcome_result')}*")
                st.markdown(f"**Action Taken:** {item.get('action_taken')}")
                st.info(f"💡 **Rule Learned:** {item.get('rule_learned')}")
                st.caption(f"Impact: {item.get('impact', '')} | Recorded: {item.get('timestamp', '')[:10]}")
                st.divider()

    with tab_log:
        st.markdown("#### Record a Real Outcome")
        with st.form("outcome_form"):
            out_client_id = selected_client["id"] if selected_client else list(client_options.values())[0]
            action = st.text_input("Action Taken", placeholder="e.g. Sent 3-point bullet email proposal with 60-day pilot offer")
            result = st.selectbox("Outcome Result", ["Success - Accepted", "Positive - Follow-up Requested", "Hesitant - Asked for Discounts", "Delayed - No Reply / Ghosted", "Rejected"])
            notes = st.text_area("Detailed Notes", placeholder="Why did they respond this way? Any feedback they shared?")
            
            submit_outcome = st.form_submit_button("Record Outcome & Update Learning Engine")
            if submit_outcome and action:
                with st.spinner("Analyzing outcome and updating reinforcement memory..."):
                    res = service.log_interaction_outcome(
                        client_id=out_client_id,
                        action_taken=action,
                        outcome_result=result,
                        notes=notes
                    )
                    st.success("Outcome logged! Learning engine reinforced with new rule.")
                    st.rerun()
