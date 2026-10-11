// Shows each demo as up or down, from its health address. A demo is up only when the address
// answers 200 with { "status": "ok" }; anything else, or no answer, is down.
const every = 30_000
const timeout = 5_000

async function isUp(address) {
    try {
        const response = await fetch(address, { cache: 'no-store', signal: AbortSignal.timeout(timeout) })
        return response.ok && (await response.json()).status === 'ok'
    } catch {
        return false
    }
}

async function check(element) {
    const up = await isUp(element.dataset.health)
    element.dataset.state = up ? 'up' : 'down'
    element.textContent = up ? 'Up' : 'Down'
    element.hidden = false
}

function checkAll() {
    document.querySelectorAll('[data-health]').forEach(check)
}

// Checked again only while the page is looked at
function checkIfVisible() {
    if (!document.hidden) checkAll()
}

checkAll()
setInterval(checkIfVisible, every)
document.addEventListener('visibilitychange', checkIfVisible)
