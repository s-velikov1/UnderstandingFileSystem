const fs = require('fs/promises');

// Watching command file
(async () => {
    // commands
    const CREATE_FILE = 'create a file';
    const DELETE_FILE = 'delete the file';
    const RENAME_FILE = 'rename the file';
    const ADD_TO_FILE = 'add to the file';

    const createFile = async (path) => {
        try {
            // we want to check whether or not we have that file
            const existingFileHandle = await fs.open(path, 'r');
            existingFileHandle.close();
            
            // we already have that file...
            return console.log(`The file ${path} already exists.`);
        } catch (e) {
            // we don't have the file, now we should create it
            const newFileHandle = await fs.open(path, 'w');
            console.log('A new file was successfully created.');
            newFileHandle.close();
        }
    };
    
    const deleteFile = async (path) => {
        console.log(`Deleting ${path}`);
        try {
            await fs.rm(path);
            console.log(`The file ${path} has been successfully deleted.`)
        } catch (e) {
            if (e.code === 'ENOENT') {
                console.error(`The file ${path} doesn\'t exist.`);
            } else {
                console.error('Error deleting file: ');
                console.error(e);
            }
        }
    }

    const renameFile = async (oldPath, newPath) => {
        console.log(`Rename ${oldPath} to ${newPath}`);
        try {
            await fs.rename(oldPath, newPath);
            console.log(`The file ${path} has been successfully renamed to ${newPath}`);
        } catch (e) {
            if (e.code === 'ENOENT') {
                console.error(`The file you are trying to rename doesn\'t exist.`)
            } else {
                console.error('Error renaming file: ');
                console.error(e);
            }
        }
    }

    const addToFile = async (path, content) => {
        console.log(`Adding to ${path}`);
        console.log(`Content: ${content}`);
        try {
            await fs.appendFile(path, Buffer.from(content));
            console.log(`Content has been successfully added.`)
        } catch (e) {
            if (e.code === 'ENOENT') {
                console.error(`The file ${path} doesn\'t exist.`);
            } else {
                console.error('Error add to file: ');
                console.error(e);
            }
        }
    }

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
        // the position that we want to start reading the file from
        const position = 0;
        
        // we always want to read the whole content (from beginning all the way to the end)
        await commandFileHandler.read(
            buff,
            offset,
            length,
            position
        );
        
        // decoder 0101 => meaningful
        // encoder meaningful => 0101

        const command = buff.toString('utf-8');

        // create a file:
        // create a file <path>
        if (command.includes(CREATE_FILE)) {
            const filePath = command.substring(CREATE_FILE.length + 1);
            createFile(filePath);
        }
        
        // delete a file
        // delete the file <path>
        if (command.includes(DELETE_FILE)) {
            const filePath = command.substring(DELETE_FILE.length + 1);
            deleteFile(filePath);
        }


        // rename file
        // rename the file <path> to <new-path>
        if (command.includes(RENAME_FILE)) {
            const _idx = command.indexOf(' to ');
            const oldFilePath = command.substring(RENAME_FILE.length + 1, _idx);
            const newFilePath = command.substring(_idx + 4);

            renameFile(oldFilePath, newFilePath);
        }
    
        // add to file:
        // add to the file <path> this content: <content>
        if (command.includes(ADD_TO_FILE)) {
            const _idx = command.indexOf(' this content: ');
            const filePath = command.substring(ADD_TO_FILE.length  + 1, _idx);
            const content = command.substring(_idx + 15);

            addToFile(filePath, content);
        }
    })

    // watcher...
    for await (const event of watcher) {
        if (event.eventType === 'change') {
            commandFileHandler.emit('change');
        }
    }
})();