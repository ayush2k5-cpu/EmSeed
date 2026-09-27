# MCP Server (backend/mcp/)

## Overview

Exposes EmSeed's employee context lookup and kill switch check as MCP tools via FastMCP, separate from the FastAPI HTTP app. Registered in the repo's own `.mcp.json`, so an MCP client (including Claude Code in this repo) can call `get_team_member_context` directly instead of going through `/api/*` routes.

## Key files

| File | Owns |
|---|---|
| `server.py` | FastMCP server, exposes the `get_team_member_context` tool |
| `schema.py` | `MCPPayload` + `EmployeeContext` dataclasses, the structured context payload referenced in the root doc's MCP audit rule |

## Commands

Run standalone: `python -m backend.mcp.server` (already wired in `.mcp.json`: cwd is the repo root, python is `venv/Scripts/python.exe`)

## Conventions

- Reuses the same engines as the HTTP app (`rag.gemini_retriever`, `engines.groq_engine`, `engines.sarvam_engine`, `engines.rlm_engine`). Do not duplicate context fetching or kill switch logic here.
- The kill switch check runs inside the tool itself, before any rewrite suggestion, and returns an explicit warning string telling the caller not to send a message and to talk to the employee directly.

## Gotchas

- This is a second entry point into the backend, independent of `main.py` / FastAPI. A change to `rlm_engine.py` or `gemini_retriever.py` affects both the HTTP API and this MCP tool. Check both paths when changing either.

_Drafted by /audit from the repo, worth a quick human pass. Edit freely: once a line stops matching this draft, later runs treat it as curated and will flag rather than overwrite it._
