module.exports.GET = (request) => {
  // Log incoming request details for debugging and traceability
  console.log('[GET] Received GET request:', {
    method: request.method,
    url: request.url,
    headers: request.headers
  })

  try {
    // Ensure the request is a GET request
    if (request.method !== 'GET') {
      console.error('[GET] Invalid request method:', request.method)
      return new Response(
        JSON.stringify({ error: 'Only GET requests are allowed.' }),
        {
          status: 405, // Method Not Allowed
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
    }

    // Prepare the response message
    const msg = { message: 'Welcome to the Righting Toolz' }

    // Log the message that will be sent back to the client
    console.log('[GET] Sending response:', msg)

    // Return the response with status 200 (OK)
    return new Response(JSON.stringify(msg), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  } catch (error) {
    // Log any unexpected errors
    console.error('[GET] Error processing the GET request:', error.message)

    // Return a generic error message with status 500 (Internal Server Error)
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred.' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  }
}
