module.exports = (envars = process.env) => {
    return {
        apiEndpoint: envars.API_ENDPOINT,
        shouldTimestamp: envars.TIMESTAMP
    }
}