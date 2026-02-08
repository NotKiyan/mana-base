declare module 'stream-json' {
    export function parser(): NodeJS.ReadWriteStream;
    const StreamJson: {
        parser: typeof parser;
    };
    export default StreamJson;
}

declare module 'stream-json/streamers/StreamArray.js' {
    export function streamArray(): NodeJS.ReadWriteStream;
    const StreamArray: {
        streamArray: typeof streamArray;
    };
    export default StreamArray;
}
