const C = require('./const');
const EventEmit = require('events');

module.exports = class ChunkParser extends EventEmit {
    constructor(parser) {
        super();

        this.parser = parser;

        this._buffers = [];
        this._remaining = 0;
    }

    write(chunk) { // chunk complete will emit msg 
        for (let i = 0; i < chunk.length; i++) {
            let buffers = this._buffers;

            if (buffers.length < C.MSG_OFFSET) {
                buffers.push(chunk.slice(i, i + 1)); // header frame, [version:1, mode:1, ctl:2, len:4]
                continue;
            }

            if (buffers.length === C.MSG_OFFSET) {
                let buffer = Buffer.concat(this._buffers);

                let version = buffer.readUInt8(C.VERSION_OFFSET);
                if (version !== C.VERSION) {
                    this._buffers = [];
                    this._remaining = 0;
                    throw new Error(`unsupport version:${version} expect:${C.VERSION_OFFSET}`);
                }

                this._remaining = buffer.readUInt32BE(C.LEN_OFFSET);
            }

            let pos = Math.min(this._remaining + i, chunk.length);
            let part = chunk.slice(i, pos);

            buffers.push(part);
            this._remaining -= part.length;
            if (this._remaining === 0) {
                this._buffers = [];
                this.emit('msg', ...(this.parser.decode(Buffer.concat(buffers))));
            }

            i += part.length - 1;
        }
    }
};
