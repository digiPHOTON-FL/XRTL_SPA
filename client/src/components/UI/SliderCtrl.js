import { useState, useEffect, useRef } from "react";
import { useAppContext } from "../../services/AppContext";
import { useSocketContext } from "../../services/SocketContext";
import Slider, { SliderValueLabel } from '@mui/material/Slider';


const SliderCtrl = (props) => {
  const [sliderPos, setSliderPos] = useState(props.sliderPos);
  const appCtx = useAppContext();
  const socketCtx = useSocketContext();
  const tempSlider = useRef();

  const marks = [
    { value: parseInt(props.min), label: props.min, },
    { value: 0, label: '0', },
    { value: parseInt(props.max), label: props.max, },
  ]

  const sliderEmit = () => {
    socketCtx.socket.on("status", payload => {
      console.log(payload);
      if (payload.component === props.component) {
        setSliderPos(payload.status[props.control]);
      }
    })
  }
  tempSlider.current = sliderEmit;

  useEffect(() => {
    tempSlider.current();
  }, [socketCtx.socket])

  const handleSettingChanges = (event, newValue) => {

    socketCtx.socket.emit("command", {
      userId: socketCtx.getNewUsername(),
      componentId: props.component,
      command: {
        controlId: props.command,
        val: newValue
      }
    })
    appCtx.addLog("User set position on " + props.component + " to " + sliderPos)
  }

  return (

    <Slider aria-label="Temperature"
      id="brightnessSlider"
      defaultValue={0}
      valueLabelDisplay="auto"
      step={1}
      min={-2}
      max={2}
      value={sliderPos}
      onChange={handleSettingChanges}
      marks={marks}
    />
  )
}

export default SliderCtrl;