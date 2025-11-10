#!/bin/bash
set -e

# Use Claude Code's CLAUDE_PROJECT_DIR if set, otherwise detect from script location
if [ -z "$CLAUDE_PROJECT_DIR" ]; then
    # Get the directory of this script
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    # Project root is 2 levels up from .claude/hooks
    CLAUDE_PROJECT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
    export CLAUDE_PROJECT_DIR
fi

cd "$CLAUDE_PROJECT_DIR/.claude/hooks"
cat | npx tsx skill-activation-prompt.ts
