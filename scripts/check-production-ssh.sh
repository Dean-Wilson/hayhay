#!/usr/bin/env bash

set -euo pipefail

DEPLOY_DOMAIN="${DEPLOY_DOMAIN:-hayhaydesign.com.au}"
DEPLOY_SSH_HOST="${DEPLOY_SSH_HOST:-SYN01AE.SYD5.hostyourservices.net}"
DEPLOY_SSH_PORT="${DEPLOY_SSH_PORT:-2683}"
DEPLOY_SSH_USER="${DEPLOY_SSH_USER:-hayhayde}"
DEPLOY_SSH_KEY="${DEPLOY_SSH_KEY:-${HOME}/.ssh/hayhay-production}"
DEPLOY_STRICT_HOST_KEY_CHECKING="${DEPLOY_STRICT_HOST_KEY_CHECKING:-accept-new}"
REMOTE_NODE_BIN_DIR="${REMOTE_NODE_BIN_DIR:-/opt/alt/alt-nodejs20/root/usr/bin}"

if ! command -v ssh >/dev/null 2>&1; then
  printf 'Missing required command: ssh\n' >&2
  exit 1
fi

if [[ ! -f "${DEPLOY_SSH_KEY}" ]]; then
  printf 'Missing SSH key: %s\n' "${DEPLOY_SSH_KEY}" >&2
  exit 1
fi

ssh_base_cmd=(
  ssh
  -F /dev/null
  -o BatchMode=yes
  -o IdentitiesOnly=yes
  -o PreferredAuthentications=publickey
  -o PasswordAuthentication=no
  -o StrictHostKeyChecking="${DEPLOY_STRICT_HOST_KEY_CHECKING}"
  -i "${DEPLOY_SSH_KEY}"
  -p "${DEPLOY_SSH_PORT}"
  "${DEPLOY_SSH_USER}@${DEPLOY_SSH_HOST}"
)

"${ssh_base_cmd[@]}" \
  "printf 'SSH OK for ${DEPLOY_DOMAIN}: %s@%s:%s\n' '${DEPLOY_SSH_USER}' '${DEPLOY_SSH_HOST}' '${DEPLOY_SSH_PORT}'"

for remote_command in node npm tar mktemp; do
  command_check="PATH='${REMOTE_NODE_BIN_DIR}':\$PATH command -v '${remote_command}' >/dev/null 2>&1"

  if "${ssh_base_cmd[@]}" "${command_check}"; then
    printf 'Remote %s: available\n' "${remote_command}"
  else
    printf 'Remote %s: missing\n' "${remote_command}" >&2
    exit 1
  fi
done
