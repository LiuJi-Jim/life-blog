var fs = require('fs')

fs.readdirSync('./').filter(name => name.endsWith('.png'))
    .forEach(name => {
        const number = name.match(/\d+/)[0]
        fs.renameSync(name, `AC-${number}.png`)
    })
