/**
 * Loads the configuration from environmental variables and make them available
 * via this module across the application
 */
module.exports = (envars = process.env) => {
    return {
        apiEndpoint: envars.API_ENDPOINT,
        shouldTimestamp: envars.TIMESTAMP
    }
}