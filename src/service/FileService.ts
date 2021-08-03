import DocumentPicker from "react-native-document-picker";
import {postFormData} from "../utils/Utils";
import {FileJob, FileJobStatus} from "../utils/Types";
import {DownloadBeginCallbackResult, DownloadProgressCallbackResult, DownloadResult} from "react-native-fs";

const AsyncLock = require('async-lock');
const RNFS = require('react-native-fs');

export class FileService
{
    // index: jobId
    private fileJobs: FileJob[] = null;
    private downloadFileJobs: Map<number, FileJob> = null;
    private readonly uploadURL: string = null;
    private readonly asyncLock = null;

    constructor(uploadURL: string)
    {
        this.fileJobs = [];
        this.downloadFileJobs = new Map<number, FileJob>();
        this.uploadURL = uploadURL;
        this.asyncLock = new AsyncLock();
    }

    public getDefaultDownloadPath()
    {
        return RNFS.DownloadDirectoryPath;
    }

    public async pickAndUpload(getFileDetails: (jobId: number, filename: string, fileType: string) => void): Promise<string>
    {
        console.log(this.asyncLock);
        try {
            const file = await DocumentPicker.pick({
                type: [DocumentPicker.types.allFiles],
            });
            console.log(`[Log]  File picked: URI: ${file.uri}, Type: ${file.type}, Name: ${file.name}, Size: ${file.size}`);

            let formData = new FormData();
            // @ts-ignore
            formData.append('file', file);

            let jobId: number = null;
            this.asyncLock.acquire('write_fileJobs', () => {
                jobId = this.fileJobs.length;
                this.fileJobs.push({
                    filePath: file.uri,
                    status: FileJobStatus.progressing,
                    totalBytes: file.size,
                    bytesSent: 0
                });
                getFileDetails(jobId, file.name, file.type);
            });

            const URL = this.uploadURL;
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Transfer-Encoding': 'chunked',
                },
                onUploadProgress: (progressEvent) => {
                    this.fileJobs[jobId].totalBytes = progressEvent.total;
                    this.fileJobs[jobId].bytesSent = progressEvent.loaded;
                    console.log('[Log]  File uploading ... ' + (progressEvent.loaded / progressEvent.total * 100 | 0) + '%');
                }
            }

            const result = await postFormData(URL, formData, config);
            if (result.data && result.data.status === 'OK') {
                console.log(`[Log]  File uploaded, path = ${result.data.path}`);
                this.fileJobs[jobId].status = FileJobStatus.completed;
                return result.data.path;
            } else {
                console.error('[Error]  Fail to upload file');
                this.fileJobs[jobId].status = FileJobStatus.failed;
                return Promise.reject('Fail to upload file');
            }

        } catch (err) {
            if (DocumentPicker.isCancel(err)) {
                console.warn('[File]  User cancelled file picker');
            } else {
                console.error('[Error]  Fail to upload file', err);
                return Promise.reject('Fail to upload file');
            }
        }
    }

    public async download(fromURL: string, savePath: string, getJobId: (jobId: number) => void)
    {
        try {
            const downloadOpts = {
                fromUrl: fromURL,
                toFile: savePath,
                begin: (res: DownloadBeginCallbackResult) => {
                    this.downloadFileJobs.set(res.jobId, {
                        filePath: savePath,
                        bytesSent: 0,
                        status: res.statusCode == 200 ? FileJobStatus.progressing : FileJobStatus.failed,
                        totalBytes: res.contentLength
                    });
                    console.log('[Log]  File download begins, jobId = ' + res.jobId);
                },
                progress: (res: DownloadProgressCallbackResult) => {
                    if (this.downloadFileJobs.has(res.jobId)) {
                        let fileJob = this.downloadFileJobs.get(res.jobId);
                        fileJob.bytesSent = res.bytesWritten;
                        fileJob.totalBytes = res.contentLength;
                        console.log('[Log]  File downloading ... ' + (res.bytesWritten / res.contentLength * 100 | 0) + '%');
                    }
                },
            };
            const { jobId, promise } = RNFS.downloadFile(downloadOpts);
            getJobId(jobId);
            const result: DownloadResult = await promise;

            if (!this.downloadFileJobs.has(jobId)) {
                this.downloadFileJobs.set(jobId, {
                    filePath: savePath,
                    bytesSent: 0,
                    status: FileJobStatus.progressing,
                    totalBytes: 0,
                });
            }

            if (result.statusCode == 200) {
                this.downloadFileJobs.get(jobId).status = FileJobStatus.completed;
                console.log('[Log]  File downloaded to path = ' + savePath);
            } else {
                this.downloadFileJobs.get(jobId).status = FileJobStatus.failed;
                console.error('[Error]  Fail to download file, jobId = ' + jobId);
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
