import DocumentPicker, {DocumentPickerResponse} from "react-native-document-picker";
import {postFormData} from "../utils/Utils";
import {FileJobStatus} from "../utils/Types";
import {DownloadBeginCallbackResult, DownloadProgressCallbackResult, DownloadResult} from "react-native-fs";
import {fileUploadURL} from "../ServiceConfig";
import {config_key} from "../Constants"

const RNFS = require('react-native-fs');

export class FileService
{

    constructor() {}

    public getDefaultDownloadPath()
    {
        return RNFS.DownloadDirectoryPath;
    }

    public async pickFile(): Promise<DocumentPickerResponse>
    {
        const file = await DocumentPicker.pick({
            type: [DocumentPicker.types.allFiles],
        });
        console.log(`[Log]  File picked: URI: ${file.uri}, Type: ${file.type}, Name: ${file.name}, Size: ${file.size}`);

        return file;
    }

    public async uploadFile(file: DocumentPickerResponse, _onUploadProgress: (bytesSent: number, totalBytes: number) => void): Promise<string>
    {
        try {
            let formData = new FormData();
            // @ts-ignore
            formData.append('file', file);

            const URL = fileUploadURL(config_key.token);
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Transfer-Encoding': 'chunked',
                },
                onUploadProgress: (progressEvent) => {
                    _onUploadProgress(progressEvent.loaded, progressEvent.total);
                    console.log('[Log]  File uploading ... ' + (progressEvent.loaded / progressEvent.total * 100 | 0) + '%');
                }
            }

            const result = await postFormData(URL, formData, config);
            if (result.data && result.data.status === 'OK') {
                console.log(`[Log]  File uploaded, path = ${result.data.path}`);
                return result.data.path;
            } else {
                console.error('[Error]  Fail to upload file');
                return Promise.reject('Fail to upload file');
            }

        } catch (err) {
            console.error('[Error]  Fail to upload file', err);
            return Promise.reject('Fail to upload file');
        }
    }

    public async download(fromURL: string, savePath: string,
                          _onDownloadProgress: (bytesSent: number, totalBytes: number) => void,
                          setFileJobStatus: (fileJobStatus: FileJobStatus) => void)
    {
        try {
            const downloadOpts = {
                fromUrl: fromURL,
                toFile: savePath,
                begin: (res: DownloadBeginCallbackResult) => {
                    _onDownloadProgress(0, res.contentLength);
                    setFileJobStatus(res.statusCode == 200 ? FileJobStatus.progressing : FileJobStatus.failed);
                    console.log('[Log]  File download begins, jobId = ' + res.jobId);
                },
                progress: (res: DownloadProgressCallbackResult) => {
                    _onDownloadProgress(res.bytesWritten, res.contentLength);
                    console.log('[Log]  File downloading ... ' + (res.bytesWritten / res.contentLength * 100 | 0) + '%');
                },
            };
            const { jobId, promise } = RNFS.downloadFile(downloadOpts);
            const result: DownloadResult = await promise;

            if (result.statusCode == 200) {
                setFileJobStatus(FileJobStatus.completed);
                console.log('[Log]  File downloaded to path = ' + savePath);
            } else {
                setFileJobStatus(FileJobStatus.failed);
                console.error('[Error]  Fail to download file');
                return Promise.reject('Fail to download file');
            }

        } catch (err) {
            if(err.description === "cancelled") {
                console.warn('[File]  User cancelled the download');
            } else {
                console.error('[Error]  Fail to download file', JSON.stringify(err));
                return Promise.reject('Fail to download file');
            }
        }
    }
}
