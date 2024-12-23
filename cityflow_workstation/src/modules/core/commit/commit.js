import { useEffect , useState} from 'react';
import { Button } from '@mui/material';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import Link from 'next/link';
const cityioWebsocketServer = process.env.NEXT_PUBLIC_CITYIOWEBSOCKETSERVER;
const cityScopeJSURL = process.env.NEXT_PUBLIC_CITYSCOPEJSURL;

export default function Commit(props) {
    const {input,config,run,setOutput} = props;

    const { sendJsonMessage, lastJsonMessage, readyState,getWebSocket } = useWebSocket(cityioWebsocketServer,
        {share: true,shouldReconnect: () => true},
    );

    useEffect(()=>{
        if (!input) return;
        if (input.tableName && input.input && run && readyState === ReadyState.OPEN) {
            let layers = []
            layers.push({"id":"cityflow","type":"geojson","data":input.input,"properties":{}})  
            sendJsonMessage({
                "type": "MODULE", 
                "content":{"gridId": input.tableName, "save": false, "moduleData":{"layers":layers}}
                })
            setOutput({output:"done"});
        }
    },[run,input,readyState]);

    const url = input?.tableName ? `${cityScopeJSURL}/?cityscope=${input.tableName}` : "";

    return (
        <>
        <Link href={url} target="_blank">
            <Button variant="outlined" fullWidth m={1}>
                Open CityScopeJS
            </Button>
       </Link> 
        </>
    );
}