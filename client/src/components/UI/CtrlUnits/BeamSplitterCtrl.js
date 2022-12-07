import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useSocketContext } from "../../../services/SocketContext";
import { useState, useRef, useEffect } from "react";
import Box from '@mui/material/Box';
import Switch from "../templates/Switch";


const BeamSplitterCtrl = (props) => {
    const [onlineStatus, setOnlineStatus] = useState(true);
    var [mounted, setMounted] = useState(false);
    const socketCtx = useSocketContext();
    const settingCtrl = useRef();
    const [switchStatus, setSwitchStatus] = useState(false);

    const theme = createTheme({
        palette: {
            mode: 'dark',
            primary: {
                light: '#01bd7d',
                main: '#01bd7d',
                dark: '#01bd7d',
                contrastText: '#01bd7d',
            },
        }
    })

    const settingEmit = () => {
        if (!mounted) {
            mounted = true
            setMounted(true)

            socketCtx.socket.emit("command", {
                userId: socketCtx.username,
                componentId: props.component,
                command: "getStatus"
            })

            socketCtx.socket.emit('getFooter', props.component)

            socketCtx.socket.on('getFooter', payload => {
                if (payload.componentId === props.component) {
                    setOnlineStatus(props.online)
                    props.newStatus(String(payload.status))
                }
                socketCtx.socket.off('getFooter')
            });

            socketCtx.socket.on("status", payload => {
                if (payload.componentId === props.component) {
                    setSwitchStatus(payload.status['laser'])
                }
            })

            socketCtx.socket.on('footer', payload => {
                if (payload.componentId === props.component) {
                    props.newStatus(String(payload.status))
                }
            })
            mounted = false;
            setMounted(false);
        }
        return () => {
            mounted = false;
            setMounted(false);
        }
    }
    settingCtrl.current = settingEmit;

    useEffect(() => {
        settingCtrl.current()
    }, [socketCtx.socket]);

    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ mx: 1 }}>
                <Switch component={props.component} command="beamSplit" start='Off' end='On' checked={switchStatus} online={onlineStatus} option="val" />
            </Box>
        </ThemeProvider>
    )
}
export default BeamSplitterCtrl
