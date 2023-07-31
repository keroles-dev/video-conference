import * as path from 'path';

const PUBLIC_PATH = path.join(process.cwd(), "public/");
const VIEW_PATH = path.join(PUBLIC_PATH, "view/");
const ASSET_PATH = path.join(process.cwd(), "public/asset/");

export {
    PUBLIC_PATH,
    VIEW_PATH,
    ASSET_PATH,
}