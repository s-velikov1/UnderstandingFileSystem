const fs = require('fs/promises');

// Watching command file
(async () => {
    const commandFileHandler = await fs.open('./command.txt', 'r');
    const watcher = fs.watch('./command.txt');

    commandFileHandler.on('change', async () => {

        // get the size of our file
        const size = (await commandFileHandler.stat()).size;
        // allocate our buffer with the size of the file
        const buff = Buffer.alloc(size);
        // the location at which we want to start filling our buffer
        const offset = 0;
        const length = buff.byteLength;
        // the position that we want to start reading fht file from
        const position = 0;
        
        // we always want to read the whole content (from beginning all the way to the end)
        const content = await commandFileHandler.read(
            buff,
            offset,
            length,
            position
        );
        console.log(content)
    })

    for await (const event of watcher) {
        if (event.eventType === 'change') {
            commandFileHandler.emit('change');
        }
    }
})();