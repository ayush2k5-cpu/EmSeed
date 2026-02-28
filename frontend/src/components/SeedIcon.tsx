import React from 'react';

interface SeedIconProps {
    size?: number;
    color?: string;
    animated?: boolean;
}

export default function SeedIcon({ size = 40, color = 'currentColor', animated = false }: SeedIconProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 40 40"
            fill="none"
            stroke={color}
            strokeWidth={1.5}
            className={animated ? 'animate-seed-grow' : undefined}
        >
            <path
                d="M20,35 C12,35 10,25 10,20 C10,12 18,10 20,8 C22,10 30,12 30,20 C30,25 28,35 20,35 Z"
                fill="transparent"
            />
            <path
                d="M20,8 C20,8 20,4 25,2"
            />
        </svg>
    );
}
