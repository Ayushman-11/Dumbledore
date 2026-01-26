import React from 'react';
import './FluidGlass.css';

const FluidGlass = ({
    children,
    className = '',
    variant = 'default',
    blur = 'medium',
    onClick,
    style = {},
    ...props
}) => {
    const variantClass = `fluid-glass-${variant}`;
    const blurClass = `fluid-glass-blur-${blur}`;

    return (
        <div
            className={`fluid-glass ${variantClass} ${blurClass} ${className}`}
            onClick={onClick}
            style={style}
            {...props}
        >
            <div className="fluid-glass-content">
                {children}
            </div>
        </div>
    );
};

export default FluidGlass;
