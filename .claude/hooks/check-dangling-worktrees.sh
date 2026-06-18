#!/bin/bash
# Stop hook: previously warned about dangling agent worktrees under
# .claude/worktrees/agent-*. Disabled — the warning was noisy and the
# cleanup step (git worktree remove -f + git branch -D) is already
# handled by the worktree return protocol in CLAUDE.md.
exit 0
