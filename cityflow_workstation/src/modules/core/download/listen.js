import { useEffect , useState} from 'react';
import { List, ListItem, MenuItem,TextField,Stack,Autocomplete } from '@mui/material';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { set } from 'lodash';

const cityioWebsocketServer = process.env.NEXT_PUBLIC_CITYIOWEBSOCKETSERVER;
const cityioServer = process.env.NEXT_PUBLIC_CITYIOSERVER;

export default function Listen(props) {
    const {config,setConfig,setOutput,run,loading,setLoading} = props;
    const [tableList, setTableList] = useState([]);
    const [inputValue, setInputValue] = useState({
        tableName: config.tableName ||"",
        dataPath: config.dataPath||"GEOGRID",
    }); 
    const [baseOutput, setBaseOutput] = useState(null);

    const { sendJsonMessage, lastJsonMessage, readyState,getWebSocket } = useWebSocket(cityioWebsocketServer,
        {share: true,shouldReconnect: () => true},
    );

    //get table list
    useEffect(() => { 
        const apiUrl = `${cityioServer}/api/table/list`
        fetch(apiUrl)
            .then(data=>data.json())
            .then(data=>setTableList(data))
            .catch(error => console.error("failed to fetch data"))
    },[]);

    useEffect(()=>{
        if (!run) {
            setOutput({output:null,tableName:null});
        }
        if (inputValue.tableName && run && readyState === ReadyState.OPEN) {
            console.log("connect to cityioWebsocketServer")
            sendJsonMessage({
                "type":"SUBSCRIBE", 
                "content":{"gridId": inputValue.tableName}
                })
        }
    },[run,inputValue,readyState]);

    // clear the output and then update it with the new baseOutput
    // because the deckgl map will not refresh when the baseOutput is slightly changed
    // ? may have better way to do this
    useEffect(()=>{
        setOutput({output:null,tableName:inputValue.tableName});
        const timeout = setTimeout(()=>{
            setOutput({output:baseOutput,tableName:inputValue.tableName});
        },1); 
        return () => {
            clearTimeout(timeout);
        };
    },[baseOutput]);

    useEffect(()=>{
        if (!lastJsonMessage) return;
        const {type,content} = lastJsonMessage;
        switch (type) {
            case "TABLE_SNAPSHOT":
                const snapshot = content?.snapshot;
                if (snapshot && inputValue.dataPath === "GEOGRID") {
                    const geoGrid = snapshot.GEOGRID;
                    const geoGridData = snapshot.GEOGRIDDATA;
                    geoGrid.features.forEach((d,i)=>{
                        d.properties = {...d.properties,
                            ...geoGridData[i],
                            height: geoGridData[i].height[1]*4,
                        }
                    });
                    setBaseOutput({...geoGrid});
                }
                break;
            case "GEOGRIDDATA_UPDATE":
                const updatedGeoGridData = content?.geogriddata;
                const updatedGrid = {...baseOutput};
                updatedGrid && updatedGrid.features.forEach((d,i)=>{
                    d.properties = {...d.properties,
                        ...updatedGeoGridData[i],
                        height: updatedGeoGridData[i].height[1]*4,
                    }
                }
                );
                setBaseOutput(updatedGrid);
                break;
            case "SUBSCRIPTION_REQUEST":
                sendJsonMessage({
                    "type":"SUBSCRIBE", 
                    "content":{"gridId": inputValue.tableName}
                    })
                break;
            case "SUBSCRIPTION_REMOVAL_REQUEST":
                sendJsonMessage({
                    "type":"UNSUBSCRIBE", 
                    "content":{"gridId": inputValue.tableName}
                    })
                break;
        }       
    },[lastJsonMessage]);

    const handleValueChange = (e) => {
        setInputValue({...inputValue, dataPath: e.target.value});
        setConfig({...config, dataPath: e.target.value});
    }

    const handleTableChange = (e,v,r) => {
        setInputValue({...inputValue, tableName: v});
        setConfig({...config, tableName: v});
    }

    return (
        <>
        <List>
            <ListItem sx={{display:"flex", alignItems: "center",justifyContent: "center",}}>
                <Stack sx={{width:"100%"}} spacing={2}>
                    {tableList.length>0 &&
                    <Autocomplete
                        id="tableList"
                        size='small'
                        options={[...tableList,""]}
                        value = {inputValue.tableName || ""}
                        sx={{width:"100%",height:"30px",
                        fontSize: 8,
                        '& .MuiOutlinedInput-root': { height: '30px' }}}
                        renderInput={(params) => <TextField {...params} variant="outlined"
                        placeholder='table name'
                        inputProps={{...params.inputProps, style: {fontSize: 8}}}
                        InputLabelProps={{style: { fontSize: 8}}}  
                        />}
                        onChange={handleTableChange}
                    />
                    }
                    <TextField id="dataPath" label="Data Path" variant="outlined" size="small"
                        onChange={handleValueChange} 
                        fullWidth
                        select
                        value = {inputValue.dataPath}
                        InputLabelProps={{style: { fontSize: 8 }}}  
                        InputProps={{style: { fontSize: 8}}}>
                        {/* <MenuItem value={"ALL"}>ALL</MenuItem> */}
                        <MenuItem value={"GEOGRID"}>GEOGRID</MenuItem>
                        {/* <MenuItem value={"GEOGRIDDATA"}>GEOGRIDDATA</MenuItem> */}
                    </TextField>
                </Stack>
            </ListItem>
        </List>
        </>
    );
}