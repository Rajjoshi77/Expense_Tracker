import { useRive, Layout, Fit, Alignment } from '@rive-app/react-canvas';
import { useEffect, useRef } from 'react';
import dogFile from '../assets/dog.riv';

const DogAnimation = () => {
  const { rive, RiveComponent } = useRive({
    src: dogFile,
    stateMachines: "State Machine 1",
    autoplay: true,
    layout: new Layout({
      fit: Fit.Contain,
      alignment: Alignment.Center,
    }),
  });

  const mousePos = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const handleMouseMove = (e) => {
      mousePos.current = {
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      };
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    let frameId;

    const update = () => {
      if (rive) {
        const smName = rive.stateMachineNames[0] || "State Machine 1";
        const inputs = rive.stateMachineInputs(smName);

        if (inputs) {
          const { x, y } = mousePos.current;

          inputs.forEach(input => {
            const name = input.name.toLowerCase();
            // x and y are 0-100.
            // Some Rive files expect 0-100, others expect -100 to 100. We will set it to 0-100 by default.
            // If the input name implies a percentage or coordinates, 0-100 usually works for the standard Rive dog.
            if (name === 'lookx' || name === 'x' || name === 'xaxis' || name === 'pointerx' || name === 'mousex') {
              input.value = x;
            } else if (name === 'looky' || name === 'y' || name === 'yaxis' || name === 'pointery' || name === 'mousey') {
              input.value = y;
            }
          });
        }
      }
      frameId = requestAnimationFrame(update);
    };

    frameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frameId);
  }, [rive]);

  return (
    <div className="fixed bottom-6 right-6 w-24 h-24 z-[100] pointer-events-none select-none drop-shadow-2xl">
      <RiveComponent />
    </div>
  );
};

export default DogAnimation;
