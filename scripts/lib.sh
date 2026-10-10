# Shared by the scripts in this folder: sourced, not run.

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [[ ! -f "$root/.env" ]]; then
    echo "No .env in $root: copy .env.example to .env and set its values." >&2
    exit 1
fi

# docker compose for one Compose file, with the repository's .env
compose() {
    local file="$1"
    shift
    docker compose --env-file "$root/.env" -f "$file" "$@"
}

# Every demo's Compose file: the demos are found by listing demos/, never named
demo_files() {
    local file
    for file in "$root"/demos/*/compose.yaml; do
        [[ -f "$file" ]] && echo "$file"
    done
}

demo_name() {
    basename "$(dirname "$1")"
}
