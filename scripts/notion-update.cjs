const { Client } = require('@notionhq/client')
const fs = require('fs')

const notion = new Client({ auth: process.env.NOTION_TOKEN })
const databaseId = process.env.NOTION_DB_ID

const commitMessage = fs.readFileSync('commits.txt', 'utf8')
const matches = [...commitMessage.matchAll(/EL-\d+/g)]

console.log('commitMessage...', commitMessage)
console.log('matches...', matches)
;(async () => {
  for (const match of matches) {
    const ticketId = match[0]
    console.log(`🔍 Looking for ${ticketId}...`)

    const query = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: 'ticket-id',
        number: { equals: parseInt(ticketId.replace('EL-', '')) },
      },
    })

    if (query.results.length === 0) {
      console.log(`❌ ${ticketId} not found`)
      continue
    }

    const pageId = query.results[0].id

    await notion.pages.update({
      page_id: pageId,
      properties: {
        Status: {
          status: {
            name: 'Done',
          },
        },
      },
    })

    console.log(`✅ ${ticketId} marked as Done`)
  }
})()
