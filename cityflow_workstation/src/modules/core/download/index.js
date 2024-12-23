import { useEffect , useState} from 'react';
import { List, ListItem, MenuItem,TextField,Stack,Autocomplete } from '@mui/material';
import { set } from 'lodash';

const cityioServer = process.env.NEXT_PUBLIC_CITYIOSERVER;

export default function WebAPI(props) {
    const {config,setConfig,setOutput,run} = props;
    const [tableList, setTableList] = useState([]);
    const [inputValue, setInputValue] = useState({
        tableName: config.tableName ||"",
        dataPath: config.dataPath||"GEOGRID",
    });

    //get table list
    useEffect(() => { 
        const apiUrl = `${cityioServer}/api/table/list`
        fetch(apiUrl)
            .then(data=>data.json())
            .then(data=>setTableList(data))
            .catch(error => console.error("failed to fetch data"))
    },[]);

    const callAPI = async () => {
        const apiUrl = `${cityioServer}/api/table/`
        const query = inputValue.tableName;
        if (!query) return;
        const queryUrl = query? apiUrl + query : apiUrl;
        let jsonDataGET = await fetch(queryUrl)
            .then(data=>data.json())
            .catch(error => console.error("failed to fetch data"))
        
        //combine GEOGRID and GEOGRIDDATA to get finnal data
        if (jsonDataGET && jsonDataGET.GEOGRID && jsonDataGET.GEOGRIDDATA){
            jsonDataGET.GEOGRID.features.forEach((d,i)=>{
                d.properties = {...d.properties,
                    ...jsonDataGET.GEOGRIDDATA[i],
                    height: jsonDataGET.GEOGRIDDATA[i].height[1]*5,
                }
            });
            setOutput({output:jsonDataGET[inputValue.dataPath],tableName:inputValue.tableName});
        }
    }

    const handleValueChange = (e) => {
        setInputValue({...inputValue, dataPath: e.target.value});
        setConfig({...config, dataPath: e.target.value});
    }

    const handleTableChange = (e,v,r) => {
        setInputValue({...inputValue, tableName: v});
        setConfig({...config, tableName: v});
    }

    // global run control
    useEffect(()=>{
        if (!run||!inputValue.tableName) {
            setOutput({output:null,tableName:null});
        }else{
            callAPI();
        }
    },[run,inputValue]);

    

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