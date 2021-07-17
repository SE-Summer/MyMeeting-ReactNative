import {printError} from "./printError";

let getRequest = (url: string, callback) => {
    fetch(url, {method: 'GET'})
        .then((response) => {
            return response.json()
        })
        .then((data) => {
            callback(data);
        })
        .catch((error) => {
            console.log(error);
        });
};

export {getRequest}
