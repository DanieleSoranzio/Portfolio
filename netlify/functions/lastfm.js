exports.handler = async () => {
    const res = await fetch(
        `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=Soransen&api_key=${process.env.LASTFM_KEY}&limit=1&format=json`
    );
    const data = await res.json();
    return {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify(data)
    };
};