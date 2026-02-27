# RLM Contagion + Kill-Switch Engine
# Based on: arxiv:2512.24601 | github.com/alexzhang13/rlm
# Pure Python — no external API calls. Must always work even if everything else is down.

RLM_CONFIG = {
    "context_window_days": 30,
    "contagion_threshold": 0.4,      # spread coefficient to trigger team alert
    "kill_switch_floor": 25,         # resonance score floor
    "kill_switch_consecutive": 3,    # signals below floor to trigger kill-switch
    "min_team_size_for_contagion": 3,
}


def check_kill_switch(employee_id: str, recent_signals: list) -> dict:
    """
    Checks last N signals for sustained low resonance.
    Returns kill-switch payload if triggered, otherwise {"status": "ok"}.

    recent_signals: list of dicts with "resonance_score" key (most recent last).
    """
    n = RLM_CONFIG["kill_switch_consecutive"]
    if len(recent_signals) < n:
        return {"status": "ok", "employee_id": employee_id}

    last_n = [s["resonance_score"] for s in recent_signals[-n:]]
    if all(score < RLM_CONFIG["kill_switch_floor"] for score in last_n):
        return {
            "status": "kill_switch_engaged",
            "employee_id": employee_id,
            "reason": "sustained_low_resonance",
            "scores": last_n,
            "recommendation": "direct_human_conversation",
            "message": "This person doesn't need a better message. They need you.",
        }
    return {"status": "ok", "employee_id": employee_id}


def compute_contagion(team_signals: dict) -> dict:
    """
    team_signals: { employee_id: [list of resonance scores] }
    Returns contagion coefficient and whether team alert should fire.
    """
    if not team_signals:
        return {
            "contagion_coefficient": 0.0,
            "affected_count": 0,
            "total_count": 0,
            "alert": False,
        }

    low_count = sum(
        1 for signals in team_signals.values()
        if signals and signals[-1] < 40
    )
    total = len(team_signals)
    coefficient = low_count / total if total > 0 else 0.0

    return {
        "contagion_coefficient": round(coefficient, 2),
        "affected_count": low_count,
        "total_count": total,
        "alert": coefficient >= RLM_CONFIG["contagion_threshold"],
    }
