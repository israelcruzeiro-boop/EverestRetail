export function getYouTubeThumbnail(url: string): string {
    if (!url) return '';

    let videoId = '';
    const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);

    if (match && match[2].length === 11) {
        videoId = match[2];
    } else {
        // Try to extract if it's just the ID
        if (url.length === 11) videoId = url;
    }

    if (videoId) {
        return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }

    return '';
}
