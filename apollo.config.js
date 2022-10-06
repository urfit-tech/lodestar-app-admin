module.exports = {
    client: {
        service: {
            name: 'hasura-staging',
            url: 'https://lodestar-staging.hasura.app/v1/graphql',
            headers: {
                "X-Hasura-Admin-Secret": "kolable"
            },
        }
    },
};