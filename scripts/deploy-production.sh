#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
BUILD_ROOT="$(mktemp -d "${TMPDIR:-/tmp}/hayhay-deploy.XXXXXX")"
SOURCE_STAGE_DIR="${BUILD_ROOT}/source"
SOURCE_ARCHIVE="${BUILD_ROOT}/source.tar.gz"

DEPLOY_DOMAIN="${DEPLOY_DOMAIN:-hayhaydesign.com.au}"
DEPLOY_SSH_HOST="${DEPLOY_SSH_HOST:-SYN01AE.SYD5.hostyourservices.net}"
DEPLOY_SSH_PORT="${DEPLOY_SSH_PORT:-2683}"
DEPLOY_SSH_USER="${DEPLOY_SSH_USER:-hayhayde}"
DEPLOY_SSH_KEY="${DEPLOY_SSH_KEY:-${HOME}/.ssh/hayhay-production}"
DEPLOY_STRICT_HOST_KEY_CHECKING="${DEPLOY_STRICT_HOST_KEY_CHECKING:-accept-new}"
REMOTE_BUILD_BASE_DIR="${REMOTE_BUILD_BASE_DIR:-/home/hayhayde/tmp}"
REMOTE_PUBLIC_DIR="${REMOTE_PUBLIC_DIR:-/home/hayhayde/public_html}"
REMOTE_GOMAXPROCS="${REMOTE_GOMAXPROCS:-2}"
REMOTE_NODE_BIN_DIR="${REMOTE_NODE_BIN_DIR:-/opt/alt/alt-nodejs20/root/usr/bin}"

EXCLUDES_FILE="${SCRIPT_DIR}/rsync-deploy-excludes.txt"
DRY_RUN=false
REMOTE_TMP_DIR=""

if [[ "${1:-}" == "--dry-run" ]]; then
  DRY_RUN=true
fi

log() {
  printf '\n==> %s\n' "$1"
}

die() {
  printf '%s\n' "$1" >&2
  exit 1
}

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    die "Missing required command: $1"
  fi
}

cleanup() {
  if [[ -n "${REMOTE_TMP_DIR}" ]]; then
    "${ssh_base_cmd[@]}" "rm -rf '${REMOTE_TMP_DIR}'" >/dev/null 2>&1 || true
  fi

  rm -rf "${BUILD_ROOT}"
}

trap cleanup EXIT

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

scp_base_cmd=(
  scp
  -F /dev/null
  -o BatchMode=yes
  -o IdentitiesOnly=yes
  -o PreferredAuthentications=publickey
  -o PasswordAuthentication=no
  -o StrictHostKeyChecking="${DEPLOY_STRICT_HOST_KEY_CHECKING}"
  -i "${DEPLOY_SSH_KEY}"
  -P "${DEPLOY_SSH_PORT}"
)

require_remote_command() {
  local remote_command="$1"
  local command_check="PATH='${REMOTE_NODE_BIN_DIR}':\$PATH command -v '${remote_command}' >/dev/null 2>&1"

  if ! "${ssh_base_cmd[@]}" "${command_check}"; then
    die "Remote command not available on ${DEPLOY_SSH_HOST}:${DEPLOY_SSH_PORT}: ${remote_command}"
  fi
}

append_env_var() {
  local output_file="$1"
  local output_name="$2"
  local value="$3"

  if [[ -n "${value}" ]]; then
    printf '%s=%q\n' "${output_name}" "${value}" >> "${output_file}"
  fi
}

write_build_env() {
  local output_file="${SOURCE_STAGE_DIR}/.env"

  : > "${output_file}"

  append_env_var \
    "${output_file}" \
    "NUXT_PUBLIC_SHOPIFY_STORE_DOMAIN" \
    "${NUXT_PUBLIC_SHOPIFY_STORE_DOMAIN:-}"
  append_env_var \
    "${output_file}" \
    "NUXT_PUBLIC_SHOPIFY_STOREFRONT_PUBLIC_TOKEN" \
    "${NUXT_PUBLIC_SHOPIFY_STOREFRONT_PUBLIC_TOKEN:-}"
  append_env_var \
    "${output_file}" \
    "NUXT_PUBLIC_SHOPIFY_STOREFRONT_API_VERSION" \
    "${NUXT_PUBLIC_SHOPIFY_STOREFRONT_API_VERSION:-2026-01}"
}

log "Checking local tooling"
require_command ssh
require_command scp
require_command tar
require_command rsync
[[ -f "${DEPLOY_SSH_KEY}" ]] || die "Missing SSH key: ${DEPLOY_SSH_KEY}"
[[ -f "${EXCLUDES_FILE}" ]] || die "Missing excludes file: ${EXCLUDES_FILE}"

if [[ -f "${REPO_ROOT}/.env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "${REPO_ROOT}/.env"
  set +a
fi

log "Preparing source bundle"
mkdir -p "${SOURCE_STAGE_DIR}"
rsync \
  -az \
  --delete \
  --exclude-from="${EXCLUDES_FILE}" \
  "${REPO_ROOT}/" \
  "${SOURCE_STAGE_DIR}/"
write_build_env

COPYFILE_DISABLE=1 tar -czf "${SOURCE_ARCHIVE}" -C "${SOURCE_STAGE_DIR}" .

if [[ "${DRY_RUN}" == true ]]; then
  log "Dry run complete. Source archive was built locally and no files were uploaded."
  printf 'Source archive: %s\n' "${SOURCE_ARCHIVE}"
  exit 0
fi

log "Checking SSH access to production"
"${ssh_base_cmd[@]}" "printf 'SSH OK on %s\n' \"\$(hostname)\""

log "Checking remote tooling"
require_remote_command node
require_remote_command npm
require_remote_command tar
require_remote_command mktemp

log "Creating remote deployment workspace"
REMOTE_TMP_DIR="$("${ssh_base_cmd[@]}" "mkdir -p '${REMOTE_BUILD_BASE_DIR}' && mktemp -d '${REMOTE_BUILD_BASE_DIR}/hayhay-static.XXXXXX'")"

log "Uploading source bundle"
"${scp_base_cmd[@]}" "${SOURCE_ARCHIVE}" "${DEPLOY_SSH_USER}@${DEPLOY_SSH_HOST}:${REMOTE_TMP_DIR}/source.tar.gz"

log "Generating and publishing static site"
"${ssh_base_cmd[@]}" bash -s -- "${REMOTE_TMP_DIR}" "${REMOTE_PUBLIC_DIR}" "${REMOTE_NODE_BIN_DIR}" "${REMOTE_GOMAXPROCS}" <<'REMOTE_SCRIPT'
set -euo pipefail

remote_tmp_dir="$1"
remote_public_dir="$2"
remote_node_bin_dir="$3"
remote_gomaxprocs="$4"
source_dir="${remote_tmp_dir}/source"

run_node_command() {
  PATH="${remote_node_bin_dir}:${PATH}" GOMAXPROCS="${remote_gomaxprocs}" bash -lc "$*"
}

mkdir -p "${source_dir}" "${remote_public_dir}"
tar -xzf "${remote_tmp_dir}/source.tar.gz" -C "${source_dir}"

cd "${source_dir}"
run_node_command "npm ci"
rm -rf node_modules/sass-embedded node_modules/sass-embedded-*
run_node_command "npm run generate"

find "${remote_public_dir}" -mindepth 1 -maxdepth 1 \
  ! -name '.well-known' \
  ! -name 'cgi-bin' \
  -exec rm -rf {} +

cp -R "${source_dir}/.output/public/." "${remote_public_dir}/"

cat > "${remote_public_dir}/README_DEPLOYMENT.txt" <<README
HayHay is deployed as a static Nuxt site.

Published output:
${remote_public_dir}

Build command:
npm run generate

Shopify product data is fetched in the browser with the public Storefront API token.
README
REMOTE_SCRIPT

log "Static deploy complete"
printf 'Domain: %s\n' "${DEPLOY_DOMAIN}"
printf 'Remote public dir: %s\n' "${REMOTE_PUBLIC_DIR}"
