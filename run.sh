#!/usr/bin/env bash
# =============================================================================
#  run.sh — GEHU Placement Portal startup script
#  Compatible with: macOS and Linux (bash)
#  Usage: bash run.sh [--skip-db] [--no-browser]
# =============================================================================

set -euo pipefail

# ─── PARSE FLAGS ─────────────────────────────────────────────────────────────
SKIP_DB=false
NO_BROWSER=false
for arg in "$@"; do
  case $arg in
    --skip-db)    SKIP_DB=true ;;
    --no-browser) NO_BROWSER=true ;;
  esac
done

# ─── COLORS ──────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

info()    { echo -e "${BLUE}[INFO]${RESET}  $*"; }
success() { echo -e "${GREEN}[OK]${RESET}    $*"; }
warn()    { echo -e "${YELLOW}[WARN]${RESET}  $*"; }
error()   { echo -e "${RED}[ERROR]${RESET} $*" >&2; }
step()    { echo -e "\n${BOLD}${CYAN}▶ $*${RESET}"; }
divider() { echo -e "${CYAN}──────────────────────────────────────────────${RESET}"; }

# ─── CLEANUP ON EXIT ─────────────────────────────────────────────────────────
PIDS=()
cleanup() {
  echo ""
  warn "Shutting down all processes..."
  for pid in "${PIDS[@]}"; do
    kill "$pid" 2>/dev/null && info "Stopped PID $pid" || true
  done
  success "Cleanup complete. Goodbye!"
  exit 0
}
trap cleanup SIGINT SIGTERM

# ─── RESOLVE PROJECT ROOT ────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"
ENV_FILE="$BACKEND_DIR/.env"

# ─── BANNER ──────────────────────────────────────────────────────────────────
divider
echo -e "${BOLD}${GREEN}"
echo "   ██████╗ ███████╗██╗  ██╗██╗   ██╗"
echo "  ██╔════╝ ██╔════╝██║  ██║██║   ██║"
echo "  ██║  ███╗█████╗  ███████║██║   ██║"
echo "  ██║   ██║██╔══╝  ██╔══██║██║   ██║"
echo "  ╚██████╔╝███████╗██║  ██║╚██████╔╝"
echo "   ╚═════╝ ╚══════╝╚═╝  ╚═╝ ╚═════╝ "
echo -e "${RESET}"
echo -e "        ${BOLD}GEHU Placement Portal${RESET}"
divider

# =============================================================================
# STEP 1 — Check Node.js
# =============================================================================
step "Checking Node.js installation..."

if ! command -v node &>/dev/null; then
  error "Node.js is not installed."
  error "Install it from https://nodejs.org (v14 or higher required)."
  exit 1
fi

NODE_VERSION=$(node -v)
NODE_MAJOR=$(echo "$NODE_VERSION" | sed 's/v//' | cut -d. -f1)
success "Node.js $NODE_VERSION detected"

if [ "$NODE_MAJOR" -lt 14 ]; then
  warn "Node.js v14+ is recommended. You have $NODE_VERSION."
fi

# =============================================================================
# STEP 2 — Install backend dependencies
# =============================================================================
step "Checking backend dependencies..."

if [ ! -d "$BACKEND_DIR/node_modules" ]; then
  info "node_modules not found. Running npm install..."
  (cd "$BACKEND_DIR" && npm install) || {
    error "npm install failed."
    exit 1
  }
  success "Dependencies installed."
else
  success "node_modules already present. Skipping install."
fi

# =============================================================================
# STEP 3 — Load .env and extract DATABASE_URL
# =============================================================================
step "Loading environment configuration..."

if [ ! -f "$ENV_FILE" ]; then
  error ".env file not found at $ENV_FILE"
  error "Create it and set DATABASE_URL to your Render PostgreSQL External URL."
  exit 1
fi

DATABASE_URL=$(grep -E '^DATABASE_URL=' "$ENV_FILE" | cut -d= -f2- | tr -d '[:space:]"')
BACKEND_PORT=$(grep -E '^PORT=' "$ENV_FILE" | cut -d= -f2 | tr -d '[:space:]"')
BACKEND_PORT="${BACKEND_PORT:-5000}"

if [ -z "$DATABASE_URL" ] || [[ "$DATABASE_URL" == *"<YOUR_PASSWORD>"* ]]; then
  error "DATABASE_URL is not set or still contains placeholder values."
  error "Open $ENV_FILE and paste your Render External Database URL."
  exit 1
fi

success "DATABASE_URL loaded | Backend port: $BACKEND_PORT"

# =============================================================================
# STEP 4 — Test PostgreSQL connection
# =============================================================================
step "Testing database connection (Render PostgreSQL)..."
(cd "$BACKEND_DIR" && node -e "
  require('dotenv').config();
  const { Pool } = require('pg');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  pool.query('SELECT COUNT(*) FROM students').then(r => {
    console.log('DB_OK:' + r.rows[0].count);
    process.exit(0);
  }).catch(e => { console.log('DB_FAIL:' + e.message); process.exit(1); });
" 2>/dev/null) | while IFS= read -r line; do
  if [[ "$line" == DB_OK:* ]]; then
    success "Render PostgreSQL connected ✓ | Students in DB: ${line#DB_OK:}"
  elif [[ "$line" == DB_FAIL:* ]]; then
    error "Database connection FAILED: ${line#DB_FAIL:}"
    error "Check DATABASE_URL in $ENV_FILE"
    exit 1
  fi
done

# =============================================================================
# STEP 6 — Ensure uploads directory exists
# =============================================================================
step "Checking uploads directory..."

UPLOADS_DIR="$BACKEND_DIR/uploads/resumes"
if [ ! -d "$UPLOADS_DIR" ]; then
  mkdir -p "$UPLOADS_DIR"
  success "Created $UPLOADS_DIR"
else
  success "Uploads directory exists."
fi

# =============================================================================
# STEP 7 — Free ports and start backend server
# =============================================================================
step "Starting backend server on port $BACKEND_PORT..."

# Kill anything already on the backend port
if lsof -ti:"$BACKEND_PORT" &>/dev/null; then
  warn "Port $BACKEND_PORT in use. Killing existing process..."
  lsof -ti:"$BACKEND_PORT" | xargs kill -9 2>/dev/null || true
  # Wait until port is actually free
  for i in $(seq 1 10); do
    sleep 0.5
    if ! lsof -ti:"$BACKEND_PORT" &>/dev/null; then
      break
    fi
  done
  success "Port $BACKEND_PORT freed."
fi

BACKEND_LOG="$SCRIPT_DIR/backend.log"

(cd "$BACKEND_DIR" && node server.js >> "$BACKEND_LOG" 2>&1) &
BACKEND_PID=$!
PIDS+=("$BACKEND_PID")

info "Waiting for backend to be ready..."
BACKEND_READY=false
for i in $(seq 1 30); do
  sleep 0.3
  if curl -sf "http://localhost:$BACKEND_PORT/api/health" &>/dev/null; then
    BACKEND_READY=true
    break
  fi
  if ! kill -0 "$BACKEND_PID" 2>/dev/null; then
    error "Backend process exited unexpectedly."
    error "Check logs: $BACKEND_LOG"
    tail -30 "$BACKEND_LOG" >&2
    exit 1
  fi
done

if [ "$BACKEND_READY" = true ]; then
  success "Backend server is running → http://localhost:$BACKEND_PORT"
else
  warn "Backend did not respond within 10s. Check logs: $BACKEND_LOG"
fi

# =============================================================================
# STEP 8 — Frontend served by backend
# =============================================================================
step "Frontend served by backend..."

FRONTEND_LOG="$SCRIPT_DIR/frontend.log"
FRONTEND_URL="http://localhost:$BACKEND_PORT/frontend/pages/index.html"
success "Frontend → $FRONTEND_URL"

# =============================================================================
# STEP 9 — Open browser
# =============================================================================
if [ "$NO_BROWSER" = false ]; then
  step "Opening browser..."
  sleep 1
  if [[ "$(uname)" == "Darwin" ]]; then
    open "$FRONTEND_URL" 2>/dev/null && success "Browser opened → $FRONTEND_URL"
  elif command -v xdg-open &>/dev/null; then
    xdg-open "$FRONTEND_URL" 2>/dev/null && success "Browser opened → $FRONTEND_URL"
  else
    warn "Open manually: $FRONTEND_URL"
  fi
fi

# =============================================================================
# READY
# =============================================================================
divider
echo -e "${BOLD}${GREEN}  ✓ GEHU Placement Portal is running!${RESET}"
divider
echo -e "  ${BOLD}Frontend:${RESET}   $FRONTEND_URL"
echo -e "  ${BOLD}Backend:${RESET}    http://localhost:$BACKEND_PORT"
echo -e "  ${BOLD}API Health:${RESET} http://localhost:$BACKEND_PORT/api/health"
echo ""
echo -e "  ${BOLD}Logs:${RESET}"
echo -e "    Backend  → $BACKEND_LOG"
echo -e "    Frontend → $FRONTEND_LOG"
echo ""
echo -e "  ${YELLOW}Press Ctrl+C to stop all services.${RESET}"
divider

wait "${PIDS[@]}" 2>/dev/null || true
