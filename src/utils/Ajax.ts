import {printError} from "./PrintError";
import {SctpCapabilities} from "mediasoup-client/lib/SctpParameters";

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

let postRequest = (url: string, json: Object, callback) => {
    let opts = {
        method: "POST",
        body: JSON.stringify(json),
        headers: {
            'Content-Type': 'application/json'
        }
    };
    fetch(url, opts)
        .then((response) => {
            return response.json()
        })
        .then((data) => {
            callback(data);
        })
        .catch((error) => {
            console.log(error);
        });
}

export {getRequest, postRequest}
