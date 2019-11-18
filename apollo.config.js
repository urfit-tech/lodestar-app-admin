module.exports = {
    client: {
        service: {
            name: 'hasura-dev',
            url: 'https://hasura-dev.kolable.com/v1/graphql',
            headers: {
                "X-Hasura-Admin-Secret": "kolable"
            },
        }
    },
};