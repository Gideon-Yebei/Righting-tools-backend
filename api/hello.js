module.exports.GET = (request) => {
    console.log('Received GET request:', request);
    const msg = {message: 'Hello, World!'};
    console.log('Sending response:', msg);
    return new Response(JSON.stringify(msg), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
};

module.exports.POST = async (request) => {
    console.log('Received POST request:', request);
    const {name} = await request.json();
    console.log('Parsed request body:', {name});
    /**
     * An object containing a greeting message.
     * @type {Object}
     * @property {string} message - The greeting message including the name.
     */
    const msg = {message: `Hello, ${name}!`};
    console.log('Sending response:', msg);
    return new Response(JSON.stringify(msg), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
};
