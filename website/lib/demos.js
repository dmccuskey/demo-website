// The demos, read from each demo's folder: demos/<name>/demo.md, and a picture if it has one.
// Nothing lists the demos: a folder with a demo.md is a demo.
import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import markdownIt from 'markdown-it'

export const demosDir = path.resolve(import.meta.dirname, '../../demos')

const markdown = markdownIt()
const pictureNames = ['picture.png', 'picture.jpg', 'picture.webp', 'picture.svg']

export function readDemos() {
    return fs
        .readdirSync(demosDir, { withFileTypes: true })
        .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(demosDir, entry.name, 'demo.md')))
        .map((entry) => readDemo(entry.name))
        .sort((a, b) => a.title.localeCompare(b.title))
}

function readDemo(name) {
    const file = path.join(demosDir, name, 'demo.md')
    const { data, content } = matter(fs.readFileSync(file, 'utf8'))

    for (const key of ['title', 'summary', 'source']) {
        if (!data[key]) throw new Error(`${file}: "${key}" is missing`)
    }

    return {
        name,
        title: data.title,
        summary: data.summary,
        source: data.source,
        description: markdown.render(content),
        picture: pictureNames.find((picture) => fs.existsSync(path.join(demosDir, name, picture))),
    }
}
