// version:1|mode:1|empty:2|msgLen:4|argLen:4|argPayload:2^int(argLen)
const C = require('./const');

module.exports = class Parser {
    constructor(options = {}) {
        this.mode = {
            buffer: C.MODE.BUFFER,
            json: C.MODE.JSON,
            string: C.MODE.STRING,
        } [options.mode || 'json']; // json, string, buffer
    }

    encode(...args) {
        if (this.mode === C.MODE.JSON) {
            args = args.map(item => Buffer.from(JSON.stringify(item)));
        }
        if (this.mode === C.MODE.STRING) {
            args = args.map(item => Buffer.from(item));
        }

        let msgBytes = 0;
        for (let i = 0; i < args.length; i++) {
            msgBytes += C.ARG_LEN_BYTES + args[i].length; // len|payload
        }

        let buf = Buffer.allocUnsafe(C.MSG_OFFSET + msgBytes);

        buf.writeUInt8(C.VERSION, C.VERSION_OFFSET);
        buf.writeUInt8(this.mode, C.MODE_OFFSET);
        buf.writeUInt32BE(msgBytes, C.LEN_OFFSET);

        let offset = C.MSG_OFFSET;
        args.forEach(item => {
            buf.writeUInt32BE(item.length, offset);
            offset += C.ARG_LEN_BYTES;

            item.copy(buf, offset);
            offset += item.length;
        });

        return buf;
    }

    decode(buf) {
        let version = buf.readUInt8(C.VERSION_OFFSET);
        if (version !== C.VERSION) {
            throw new Error(`version not match, expect:${C.VERSION} receive:${version}`);
        }

        let msgBytes = buf.readUInt32BE(C.LEN_OFFSET);
        if (buf.length !== C.MSG_OFFSET + msgBytes) {
            throw new Error(`length mot match, expect:${C.MSG_OFFSET + msgBytes} receive:${buf.length}`);
        }

        let args = [];
        let offset = C.MSG_OFFSET;
        while (offset < buf.length) {
            let len = buf.readUInt32BE(offset);
            offset += C.ARG_LEN_BYTES;

            args.push(buf.slice(offset, offset += len));
        }

        let mode = buf.readUInt8(C.MODE_OFFSET);
        if (mode === C.MODE.JSON) {
            return args.map(item => JSON.parse(item.toString()));
        }

        if (mode === C.MODE.STRING) {
            return args.map(item => item.toString());
        }

        return args;
    }
};
