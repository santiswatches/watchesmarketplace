import { useRef, useState, useCallback } from 'react';
import { Play } from 'lucide-react';
import { getVideoMimeType } from '../../utils/media';

export default function VideoPlayer({
    src,
    autoPlay = false,
    muted = true,
    loop = true,
    controls = true,
    className = '',
    poster,
    onLoadedData,
}) {
    const videoRef = useRef(null);
    const [paused, setPaused] = useState(!autoPlay);

    const handlePlayOverlay = useCallback(() => {
        const video = videoRef.current;
        if (!video) return;
        video.play().catch(() => {});
    }, []);

    const handlePlay = useCallback(() => setPaused(false), []);
    const handlePause = useCallback(() => setPaused(true), []);

    return (
        <div className={`relative ${className}`}>
            <video
                ref={videoRef}
                autoPlay={autoPlay}
                muted={muted}
                loop={loop}
                controls={controls}
                playsInline
                poster={poster}
                onPlay={handlePlay}
                onPause={handlePause}
                onLoadedData={onLoadedData}
                className="w-full h-full object-contain"
            >
                <source src={src} type={getVideoMimeType(src)} />
            </video>

            {/* Play overlay when no controls and video is paused */}
            {!controls && paused && (
                <button
                    onClick={handlePlayOverlay}
                    className="absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity"
                >
                    <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                        <Play className="w-6 h-6 text-warm-black ml-1" fill="currentColor" />
                    </div>
                </button>
            )}
        </div>
    );
}
