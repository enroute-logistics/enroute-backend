const { exec } = require('child_process')

function waitForDatabase(retries = 10) {
  if (retries === 0) {
    console.error('❌ Could not connect to the database')
    process.exit(1)
  }

  console.log(`⏳ Trying to connect to DB... (${retries} retries left)`)

  exec('npx prisma db pull', (error, stdout, stderr) => {
    if (!error) {
      console.log('✅ Database is ready!')
      process.exit(0)
    } else {
      setTimeout(() => waitForDatabase(retries - 1), 3000)
    }
  })
}

waitForDatabase()
