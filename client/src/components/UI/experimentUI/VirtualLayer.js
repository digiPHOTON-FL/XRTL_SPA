import MI_110422 from "../../experiment/MichelsonInterferometer/MI_110422";
import { OrbitControls, Environment } from "@react-three/drei";
import { useAppContext } from "../../../services/AppContext";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";

const VirtualLayer = () => {
  const appCtx = useAppContext();



  if (appCtx.showVirtualLayer) {
    return (
      <Canvas
        style={{
          position: "absolute",
          background: "linear-gradient(Teal, Black)",
          width: "100%",
          height: "100%",
        }}
        colorManagement
        softShadows
        camera={{ position: [0, 3, 5], fov: 40 }}
      >
        <Suspense fallback={null}>
          {/* <Stats showPanel={0}  /> */}
          <Environment files="../hdri/autoshop.hdr" />
          <OrbitControls autoRotate={appCtx.autoRotate} />
          <MI_110422
            toggleSelect={appCtx.toggleSelectedComp}
            selected={appCtx.selectedComps}
            showTags={appCtx.showTags}
            showBeam={appCtx.showBeam}
          />
        </Suspense>
      </Canvas>
    );
  } else {
    // Hier kommt die Camera hin!
    return <></>;
  }
};

export default VirtualLayer;
