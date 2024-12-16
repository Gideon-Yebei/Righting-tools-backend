module.exports.GET = (request) => {
    console.log('Received GET request:', request);
    const msg = {message: 'Welcome to the Righting Toolz'};
    console.log('Sending response:', msg);
    return new Response(JSON.stringify(msg), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
};
