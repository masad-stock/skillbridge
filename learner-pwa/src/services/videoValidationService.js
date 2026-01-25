/**
 * Video Validation Service
 * 
 * Provides comprehensive video URL validation and health checking
 * for YouTube videos used in the learning platform.
 */

// YouTube oEmbed API endpoint for validation
const YOUTUBE_OEMBED_URL = 'https://www.youtube.com/oembed';

/**
 * Extract video ID from various YouTube URL formats
 * @param {string} url - YouTube URL
 * @returns {string|null} - Video ID or null if invalid
 */
export const extractVideoId = (url) => {
    if (!url || typeof url !== 'string') return null;

    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^#&?]{11})/,
        /^([^#&?]{11})$/ // Direct video ID
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }

    return null;
};

/**
 * Validate a single YouTube video URL
 * @param {string} url - YouTube URL to validate
 * @returns {Promise<Object>} - Validation result
 */
export const validateVideoUrl = async (url) => {
    const videoId = extractVideoId(url);

    if (!videoId) {
        return {
            isValid: false,
            url,
            videoId: null,
            error: 'Invalid YouTube URL format',
            errorCode: 'INVALID_URL'
        };
    }

    try {
        const oembedUrl = `${YOUTUBE_OEMBED_URL}?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
        const response = await fetch(oembedUrl);

        if (response.ok) {
            const data = await response.json();
            return {
                isValid: true,
                url,
                videoId,
                title: data.title,
                author: data.author_name,
                thumbnailUrl: data.thumbnail_url,
                duration: null, // oEmbed doesn't provide duration
                error: null,
                errorCode: null
            };
        } else if (response.status === 404) {
            return {
                isValid: false,
                url,
                videoId,
                error: 'Video not found or is private',
                errorCode: 'VIDEO_NOT_FOUND'
            };
        } else if (response.status === 401) {
            return {
                isValid: false,
                url,
                videoId,
                error: 'Video is restricted or unavailable',
                errorCode: 'VIDEO_RESTRICTED'
            };
        } else {
            return {
                isValid: false,
                url,
                videoId,
                error: `Validation failed with status ${response.status}`,
                errorCode: 'VALIDATION_FAILED'
            };
        }
    } catch (error) {
        // Network error or CORS issue
        return {
            isValid: null, // Unknown - couldn't verify
            url,
            videoId,
            error: `Network error: ${error.message}`,
            errorCode: 'NETWORK_ERROR'
        };
    }
};

/**
 * Validate multiple video URLs in batch
 * @param {string[]} urls - Array of YouTube URLs
 * @returns {Promise<Object>} - Batch validation results
 */
export const validateVideoBatch = async (urls) => {
    const results = await Promise.all(
        urls.map(url => validateVideoUrl(url))
    );

    const valid = results.filter(r => r.isValid === true);
    const invalid = results.filter(r => r.isValid === false);
    const unknown = results.filter(r => r.isValid === null);

    return {
        total: urls.length,
        valid: valid.length,
        invalid: invalid.length,
        unknown: unknown.length,
        successRate: urls.length > 0 ? (valid.length / urls.length) * 100 : 0,
        results,
        validVideos: valid,
        invalidVideos: invalid,
        unknownVideos: unknown
    };
};

/**
 * Get video metadata from YouTube
 * @param {string} url - YouTube URL
 * @returns {Promise<Object>} - Video metadata
 */
export const getVideoMetadata = async (url) => {
    const validation = await validateVideoUrl(url);

    if (!validation.isValid) {
        return {
            success: false,
            error: validation.error,
            errorCode: validation.errorCode
        };
    }

    return {
        success: true,
        videoId: validation.videoId,
        title: validation.title,
        author: validation.author,
        thumbnailUrl: validation.thumbnailUrl,
        embedUrl: `https://www.youtube.com/embed/${validation.videoId}`,
        watchUrl: `https://www.youtube.com/watch?v=${validation.videoId}`
    };
};

/**
 * Check if YouTube API is accessible
 * @returns {Promise<Object>} - API health status
 */
export const checkYouTubeApiHealth = async () => {
    const testVideoId = 'dQw4w9WgXcQ'; // Known working video
    const startTime = Date.now();

    try {
        const result = await validateVideoUrl(`https://www.youtube.com/watch?v=${testVideoId}`);
        const responseTime = Date.now() - startTime;

        return {
            isHealthy: result.isValid === true,
            responseTime,
            timestamp: new Date().toISOString(),
            error: result.error
        };
    } catch (error) {
        return {
            isHealthy: false,
            responseTime: Date.now() - startTime,
            timestamp: new Date().toISOString(),
            error: error.message
        };
    }
};

/**
 * Generate a diagnostic report for all course videos
 * @param {Object} courseContentMap - Map of course content with video URLs
 * @returns {Promise<Object>} - Comprehensive diagnostic report
 */
export const generateVideoDiagnosticReport = async (courseContentMap) => {
    const allVideoUrls = [];
    const videoModuleMap = {};

    // Extract all video URLs from course content
    Object.entries(courseContentMap).forEach(([moduleId, module]) => {
        if (module.lessons) {
            module.lessons.forEach((lesson, index) => {
                if (lesson.youtubeUrl) {
                    allVideoUrls.push(lesson.youtubeUrl);
                    videoModuleMap[lesson.youtubeUrl] = {
                        moduleId,
                        moduleTitle: module.title,
                        lessonIndex: index,
                        lessonTitle: lesson.title
                    };
                }
            });
        }
    });

    // Validate all videos
    const batchResults = await validateVideoBatch(allVideoUrls);

    // Enrich results with module information
    const enrichedResults = batchResults.results.map(result => ({
        ...result,
        moduleInfo: videoModuleMap[result.url]
    }));

    // Generate recommendations
    const recommendations = [];

    if (batchResults.invalid > 0) {
        recommendations.push(`${batchResults.invalid} video(s) need to be replaced with working alternatives`);
    }

    if (batchResults.unknown > 0) {
        recommendations.push(`${batchResults.unknown} video(s) could not be verified - check network connectivity`);
    }

    if (batchResults.successRate < 100) {
        recommendations.push('Consider adding fallback text content for all video lessons');
    }

    return {
        timestamp: new Date().toISOString(),
        summary: {
            totalVideos: batchResults.total,
            validVideos: batchResults.valid,
            invalidVideos: batchResults.invalid,
            unknownVideos: batchResults.unknown,
            successRate: batchResults.successRate.toFixed(2) + '%'
        },
        results: enrichedResults,
        invalidVideoDetails: enrichedResults.filter(r => r.isValid === false),
        recommendations
    };
};

export default {
    extractVideoId,
    validateVideoUrl,
    validateVideoBatch,
    getVideoMetadata,
    checkYouTubeApiHealth,
    generateVideoDiagnosticReport
};