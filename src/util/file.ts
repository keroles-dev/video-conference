import * as fs from 'fs';

async function get(path: fs.PathLike) {

    try {
        return await fs.promises.readFile(path);
    } catch (e) {
        return null;
    }
}

export {
    get, 
}