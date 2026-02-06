import React from 'react';
import HUD from './HUD';
import { useHUDStore } from '../../store/hudStore';

const HUDContainer = () => {
    const { huds, hideHUD } = useHUDStore();

    return (
        <>
            {huds.map((hud) => (
                <HUD
                    key={hud.id}
                    type={hud.type}
                    message={hud.message}
                    duration={hud.duration || 1500}
                    onClose={() => hideHUD(hud.id)}
                    showCloseButton={hud.showCloseButton}
                />
            ))}
        </>
    );
};

export default HUDContainer;
