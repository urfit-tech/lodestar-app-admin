module.exports = {
    client: {
        service: {
            name: 'hasura-staging',
            url: 'https://hasura-staging.kolable.com/v1/graphql',
            headers: {
                "X-Hasura-Admin-Secret": "kolable"
            },
        }
    },
};