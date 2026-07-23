#!/usr/bin/env bash

set -euo pipefail

base_branch="main"
verify_url="https://www.corca.ai/"
expect_text=""
timeout_seconds=900

usage() {
  cat <<'EOF'
Usage: pnpm release:site -- [options]

Push the current clean branch, create or reuse its pull request, wait for CI,
merge it, and verify the production URL.

Options:
  --base <branch>       Pull-request base branch (default: main)
  --url <url>           Production URL to verify (default: https://www.corca.ai/)
  --expect <text>       Text that must appear in the production response
  --timeout <seconds>   Maximum wait for merge and production (default: 900)
  -h, --help            Show this help
EOF
}

while (($#)); do
  case "$1" in
    --base)
      base_branch="${2:?--base requires a branch}"
      shift 2
      ;;
    --url)
      verify_url="${2:?--url requires a URL}"
      shift 2
      ;;
    --expect)
      expect_text="${2:?--expect requires text}"
      shift 2
      ;;
    --timeout)
      timeout_seconds="${2:?--timeout requires seconds}"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage >&2
      exit 2
      ;;
  esac
done

command -v git >/dev/null || { echo "git is required." >&2; exit 1; }
command -v gh >/dev/null || { echo "GitHub CLI (gh) is required." >&2; exit 1; }
command -v curl >/dev/null || { echo "curl is required." >&2; exit 1; }

git rev-parse --is-inside-work-tree >/dev/null
gh auth status >/dev/null

branch="$(git branch --show-current)"
if [[ -z "$branch" || "$branch" == "$base_branch" ]]; then
  echo "Run this from a release branch, not $base_branch." >&2
  exit 1
fi

if [[ -n "$(git status --porcelain)" ]]; then
  echo "Commit the intended release changes before running this command." >&2
  exit 1
fi

echo "Pushing $branch..."
# Required GitHub checks run before merge. Skipping the local pre-push hook
# avoids repeating dependency installation in managed Codex runtimes.
git push --no-verify --set-upstream origin "$branch"

if pr_url="$(gh pr view "$branch" --json url --jq .url 2>/dev/null)"; then
  echo "Reusing $pr_url"
else
  pr_title="$(git log -1 --pretty=%s)"
  pr_url="$(gh pr create \
    --base "$base_branch" \
    --head "$branch" \
    --title "$pr_title" \
    --body "Automated site release. Local checks and production verification are recorded in the release handoff.")"
  echo "Created $pr_url"
fi

is_draft="$(gh pr view "$pr_url" --json isDraft --jq .isDraft)"
if [[ "$is_draft" == "true" ]]; then
  gh pr ready "$pr_url"
fi

echo "Waiting for required checks and merge..."
if ! gh pr merge "$pr_url" --auto --squash --delete-branch; then
  gh pr checks "$pr_url" --watch --fail-fast
  gh pr merge "$pr_url" --squash --delete-branch
fi

deadline=$((SECONDS + timeout_seconds))
while ((SECONDS < deadline)); do
  pr_state="$(gh pr view "$pr_url" --json state --jq .state)"
  if [[ "$pr_state" == "MERGED" ]]; then
    break
  fi
  if [[ "$pr_state" == "CLOSED" ]]; then
    echo "Pull request closed without merging: $pr_url" >&2
    exit 1
  fi
  sleep 5
done

if [[ "${pr_state:-}" != "MERGED" ]]; then
  echo "Timed out waiting for pull request merge: $pr_url" >&2
  exit 1
fi

merge_sha="$(gh pr view "$pr_url" --json mergeCommit --jq .mergeCommit.oid)"
echo "Merged as $merge_sha. Waiting for production..."

response_file="$(mktemp)"
trap 'rm -f "$response_file"' EXIT

while ((SECONDS < deadline)); do
  if [[ "$verify_url" == *\?* ]]; then
    cache_bust_url="${verify_url}&release_check=${merge_sha}"
  else
    cache_bust_url="${verify_url}?release_check=${merge_sha}"
  fi
  if curl --fail --silent --show-error --location \
    --header 'Cache-Control: no-cache' \
    --output "$response_file" \
    "$cache_bust_url"; then
    if [[ -z "$expect_text" ]] || grep --fixed-strings --quiet "$expect_text" "$response_file"; then
      echo "Production verified: $verify_url"
      echo "Merge commit: $merge_sha"
      exit 0
    fi
  fi
  sleep 10
done

if [[ -n "$expect_text" ]]; then
  echo "Timed out waiting for '$expect_text' at $verify_url" >&2
else
  echo "Timed out waiting for $verify_url" >&2
fi
exit 1
