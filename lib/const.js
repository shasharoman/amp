// VERSION:2 [version:1, mode: 1, reserved:2, len:4, arg-len:4, arg-payload:{arg-len}]
module.exports = {
    VERSION: 2,

    VERSION_BYTES: 1,
    MODE_BYTES: 1,
    // MSG_LEN_BYTES: 4,
    ARG_LEN_BYTES: 4,

    VERSION_OFFSET: 0,
    MODE_OFFSET: 1,
    LEN_OFFSET: 4,
    MSG_OFFSET: 8,

    MODE: {
        BUFFER: 0,
        JSON: 1,
        STRING: 2,
    },
};
