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
        console.log(RNFS.DocumentDirectoryPath);

        const uploadFileItem = {
            name: 'file',
            filename: file.name,
            filepath: RNFS.DownloadDirectoryPath+'/1.mp4',
            filetype: 'multipart/form-data',
        };

        const uploadFileOptions = {
            toUrl: fileUploadURL(config_key.token),
            files: [uploadFileItem],
            headers: {
                // 'Content-Type': 'multipart/form-data',
            },
            method: 'POST',
            progress: (res) => {
                _onUploadProgress(res.totalBytesSent, res.totalBytesExpectedToSend);
                console.log(res.totalBytesSent / res.totalBytesExpectedToSend * 100 + '%');
            },
        };

        console.log('hit1');
        const { jobId, promise } = RNFS.uploadFiles(uploadFileOptions);
        const result = await promise;

        console.log(result);
        if (result.statusCode === 200) {
            console.log(JSON.stringify(result));
            return result;
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
            if(err.description === "cancelled") {
                console.warn('[File]  User cancelled the download');
            } else {
                console.error('[Error]  Fail to download file', JSON.stringify(err));
                return Promise.reject('Fail to download file');
            }
        }
    }
}
