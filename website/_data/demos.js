import { readDemos } from '../lib/demos.js'
import { demoAddress } from '../lib/addresses.js'

export default function () {
    return readDemos().map((demo) => ({
        ...demo,
        address: demoAddress(demo.name),
        // The page's address is also in the demo's "About" dialog, from its compose.yaml
        page: `/demos/${demo.name}/`,
    }))
}
