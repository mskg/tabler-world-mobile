import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import { cachedAolloClient } from '../../apollo/bootstrapApollo';
import { getCacheEntry } from '../../components/Image/getCacheEntry';
import { PrepareFileUpload, PrepareFileUploadVariables } from '../../model/graphql/PrepareFileUpload';
import { PrepareFileUploadMutation } from '../../queries/Conversations/PrepareFileUploadMutation';
import { logger } from './logger';

export async function uploadImage(conversationId: string, baseImage: string): Promise<string | null> {
    const client = cachedAolloClient();

    const resizedImage = await ImageManipulator.manipulateAsync(
        baseImage,
        [
            {
                resize: {
                    width: 1920,
                },
            },
            {
                resize: {
                    height: 1080,
                },
            },
        ],
        {
            compress: 0.75,
            format: ImageManipulator.SaveFormat.JPEG,
        },
    );

    const imageUri = resizedImage.uri;

    const signedUrl = await client.mutate<PrepareFileUpload, PrepareFileUploadVariables>({
        mutation: PrepareFileUploadMutation,
        variables: {
            conversationId,
        },
    });

    if (signedUrl.data) {
        const params = signedUrl.data.prepareFileUpload;

        // this will be the final url
        const { path } = await getCacheEntry(`${params.url}/${params.fields.key}`, 'chat');
        try {
            // prepare cache
            logger.debug('Moving', imageUri, 'to', path);
            await FileSystem.moveAsync({ from: imageUri, to: path });
        } catch (e) {
            logger.log('Error moving', imageUri, path);
        }

        const formData = new FormData();
        // formData.append('Content-Type', 'image/jpeg');
        Object.entries(params.fields).forEach(([k, v]) => {
            formData.append(k, v as string);
        });

        // required
        formData.append('Content-Type', 'image/jpeg');

        // @ts-ignore
        formData.append('file', { uri: path, type: 'image/jpeg', name: 'upload.jpg' });

        logger.log('Uploading', path, 'to', params.url, 'using', params.fields);
        const result = await fetch(params.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            body: formData,
        });

        if (result.status >= 300) {
            throw new Error(result.status + ' ' + result.statusText);
        }

        return params.fields.key as string;
    }

    return null;
}
