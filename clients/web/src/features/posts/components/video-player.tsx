import { useEffect, useRef } from "react";

type VideoPlayerProps = {
    src: string;
    className?: string;
};

export default function VideoPlayer({
    src,
    className,
}: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);

    // useEffect(() => {
    //     const video = videoRef.current;
    //     if (!video) return;

    //     const observer = new IntersectionObserver(
    //         ([entry]) => {
    //             if (entry.isIntersecting) {
    //                 void video.play().catch(() => {
    //                     // Playback may be blocked by the browser.
    //                 });
    //             } else {
    //                 video.pause();
    //             }
    //         },
    //         {
    //             threshold: .5,
    //         },
    //     );

    //     observer.observe(video);

    //     return () => {
    //         observer.disconnect();
    //         video.pause();
    //     };
    // }, [src]);

    return (
        <video
            ref={videoRef}
            className={className}
            src={src}
            autoPlay={false}
            loop
            controls
            muted
            playsInline
            preload="metadata"
        />
    );
}