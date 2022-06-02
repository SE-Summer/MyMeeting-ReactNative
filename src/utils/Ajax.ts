async function getRequest(url: string)
{
    try {
        const response = await fetch(url, {method: 'GET'});
        return response.json();
    } catch (err) {
        console.error(err);
    }
}

async function postRequest(url: string, json: Object)
{
    const opts = {
        method: "POST",
        body: JSON.stringify(json),
        headers: {
            'Content-Type': 'application/json'
        }
    };
    try {
        const response = await fetch(url, opts);
        return response.json();
    } catch (err) {
        console.error(err);
    }
}

export {getRequest, postRequest}
