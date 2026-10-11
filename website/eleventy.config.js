import path from 'node:path'
import { demosDir, readDemos } from './lib/demos.js'

export default function (eleventyConfig) {
    eleventyConfig.addPassthroughCopy('assets')

    for (const demo of readDemos()) {
        if (!demo.picture) continue
        const from = path.relative('.', path.join(demosDir, demo.name, demo.picture))
        eleventyConfig.addPassthroughCopy({ [from]: `demos/${demo.name}/${demo.picture}` })
    }

    // A change to a demo's entry rebuilds the site while it is served
    eleventyConfig.addWatchTarget('../demos/')
}

export const config = {
    dir: { input: 'pages', includes: '../_includes', data: '../_data', output: '_site' },
}
