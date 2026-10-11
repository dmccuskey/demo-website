// Where a demo is, from the domain. The domain is never written in this repository: it comes
// from DEMO_DOMAIN, set on the static host, or read from the repository's .env on your machine.
import fs from 'node:fs'
import path from 'node:path'

const envFile = path.resolve(import.meta.dirname, '../../.env')

if (!process.env.DEMO_DOMAIN && fs.existsSync(envFile)) process.loadEnvFile(envFile)

const domain = process.env.DEMO_DOMAIN

if (!domain) throw new Error('DEMO_DOMAIN is not set: set it for the build, or in the .env file')

// With `localhost` as the domain, a demo is behind Caddy on this machine, without TLS
const local = domain === 'localhost'
const port = process.env.CADDY_PORT || '8080'

export function demoAddress(name) {
    return local ? `http://${name}.localhost:${port}` : `https://${name}.${domain}`
}
