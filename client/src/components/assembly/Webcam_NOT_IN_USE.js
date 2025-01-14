import { useState, useEffect } from "react";
import Window from "../UI/Window";
import CamCtrl from "../Chat/Webcam_NOT_IN_USE";
import { useAppContext } from "../../services/AppContext";
import { usePopUpContext } from "../../services/PopUpContext"
import { useSocketContext } from "../../services/SocketContext"


const Cam = (props) => {
    const [footer, setFooter] = useState(props.footer);
    const [lastChange, setLastChange] = useState(['', '', '']);
    const [alertType, setAlertType] = useState('info');
    var [alert, setAlert] = useState(false);

    const appCtx = useAppContext();
    const socketCtx = useSocketContext();
    const popupCtx = usePopUpContext();

    const handleCloseWindow = () => {
        appCtx.toggleSelectedComp(props.id)
        socketCtx.socket.emit("leave stream room", { id: props.id, userId: socketCtx.username, controlId: 'Cam' });
    };

    const handleReset = () => {
        socketCtx.socket.emit('command', {
            userId: socketCtx.username,
            componentId: props.id,
            command: "reset"
        })
    }

    const handleInfo = () => {
        var timeNow = new Date();
        let difH, difMin, difSec = 0;
        alert = '';

        timeNow = [timeNow.getHours(), timeNow.getMinutes(), timeNow.getSeconds(), timeNow.getDay(), timeNow.getMonth()]
        if (lastChange[0] === '') {
            alert = 'No last change detected!'
        } else if (timeNow[0] > lastChange[0]) {
            difH = timeNow[0] - lastChange[0];
            alert = 'Last change is more than ' + difH + ' h ago!'
        } else if (timeNow[0] === lastChange[0] && timeNow[1] === lastChange[1] && timeNow[2] > lastChange[2]) {
            difSec = timeNow[2] - lastChange[2]
            alert = 'Last change is ' + difSec + ' s ago!'
        } else if (timeNow[0] === lastChange[0] && timeNow[1] > lastChange[1]) {
            difMin = timeNow[1] - lastChange[1]
            alert = 'Last change is more than ' + difMin + ' min ago!'
        } else if (timeNow[3] > lastChange[3] || timeNow[4] > lastChange[4]) {
            alert = 'Last change is more than 24 h ago!'
        } else {
            alert = 'No last change detected!'
        }

        setAlert(alert);
        setAlertType('info');
        popupCtx.toggleShowPopUp(alert, alertType);
    }

    const handleChangeFooter = (newFooter) => {
        var time = new Date();
        setLastChange([time.getHours(), time.getMinutes(), time.getSeconds(), time.getDay(), time.getMonth()])
        setFooter(newFooter);
    };

    useEffect(() => {
        const data = (payload) => {
            console.log("Data payload", payload)
        }

        socketCtx.socket.on("data", data);

        return () => {
            socketCtx.socket.removeAllListeners('data', data)
        }

    }, [socketCtx.socket]);

    useEffect(() => {
        socketCtx.socket.emit("join stream room", { id: props.id, userId: socketCtx.username, controlId: 'Cam' });

    }, []);

    return (
        <Window
            header={props.title + " (" + props.id + ")"}
            top={props.top}
            left={props.left}
            height="340px"
            width="623px"
            onClose={handleCloseWindow}
            onReset={handleReset}
            onInfo={handleInfo}
            footer={footer}
        >
            <CamCtrl
                component={props.id}
                newStatus={handleChangeFooter}
                footer={footer}
            />
        </Window>
    )
}

export default Cam;