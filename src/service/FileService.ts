import DocumentPicker, {DocumentPickerResponse} from "react-native-document-picker";
import {FileJobStatus} from "../utils/Types";
import {
    DownloadBeginCallbackResult,
    DownloadProgressCallbackResult,
    DownloadResult,
    UploadProgressCallbackResult
} from "react-native-fs";
import {fileUploadURL, serviceConfig} from "../ServiceConfig";
import {config_key} from "../Constants"
import getPath from '@flyerhq/react-native-android-uri-path'
import {Platform} from "react-native";

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
            let realPath = null;
            if (Platform.OS == 'android') {
                realPath = getPath(file.uri);
            } else if (Platform.OS == 'ios') {
                const split = file.uri.split('/');
                const name = split.pop();
                const inbox = split.pop();
                realPath = `${RNFS.TemporaryDirectoryPath}${inbox}/${name}`;
            } else {
                console.error('[Error]  Fail to convert URI to realPath: Platform not supported');
                return Promise.reject('Fail to convert URI to realPath');
            }
            console.log(`[Log]  File path converted: ${realPath}`);

            const uploadFileItem = {
                name: 'file',
                filename: file.name,
                filepath: realPath,
                filetype: 'multipart/form-data',
            };

            const uploadFileOptions = {
                toUrl: fileUploadURL(config_key.token),
                files: [uploadFileItem],
                headers: {
                    // 'Content-Type': 'multipart/form-data',
                },
                method: 'POST',
                progress: (res: UploadProgressCallbackResult) => {
                    _onUploadProgress(res.totalBytesSent, res.totalBytesExpectedToSend);
                    console.log('[Log]  File uploading ... ' + (res.totalBytesSent / res.totalBytesExpectedToSend * 100 | 0) + '%');
                },
            };

            const { jobId, promise } = RNFS.uploadFiles(uploadFileOptions);
            const result = await promise;
            const response = JSON.parse(result.body);

            if (result.statusCode == 200 && response.status == 'OK' && response.path) {
                console.log(`[Log]  File updated to path = ${response.path}`);
                return `${serviceConfig.serverURL}/${response.path}`;
            } else {
                console.error('[Error]  Fail to upload file');
                return Promise.reject('Fail to upload file');
            }
        } catch (err) {
            if(err.description == "cancelled") {
                console.warn('[File]  User cancelled the upload');
            } else {
                console.error('[Error]  Fail to upload file', JSON.stringify(err));
                return Promise.reject('Fail to upload file');
            }
        }
    }

    public async download(fromURL: string, savePath: string,
                          _onDownloadProgress: (bytesSent: number, totalBytes: number) => void,
                          setFileJobStatus: (fileJobStatus: FileJobStatus) => void): Promise<void>
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
            if(err.description == "cancelled") {
                console.warn('[File]  User cancelled the download');
            } else {
                console.error('[Error]  Fail to download file', JSON.stringify(err));
                return Promise.reject('Fail to download file');
            }
        }
    }
}
