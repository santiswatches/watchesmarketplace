const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.mov'];

const MIME_MAP = {
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.mov': 'video/quicktime',
};

export function isVideoUrl(url) {
    if (!url) return false;
    const lower = url.toLowerCase().split('?')[0];
    return VIDEO_EXTENSIONS.some(ext => lower.endsWith(ext));
}

export function buildMediaItems(images = [], videos = []) {
    return [
        ...images.map(url => ({ type: 'image', url })),
        ...videos.map(url => ({ type: 'video', url })),
    ];
}

export function getVideoMimeType(url) {
    if (!url) return '';
    const lower = url.toLowerCase().split('?')[0];
    const ext = '.' + lower.split('.').pop();
    return MIME_MAP[ext] || 'video/mp4';
}
