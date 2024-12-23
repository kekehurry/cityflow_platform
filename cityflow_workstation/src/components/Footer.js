import {Typography, Stack,Divider} from '@mui/material'
import theme from "@/theme";

export default function Footer(){
    const cityscopeJSUrl = process.env.NEXT_PUBLIC_CITYSCOPEJS_URL;
    return(
        <Divider orientation="horizontal" sx={{width:"100%"}}>
            <Stack direction="row" spacing={2} 
            sx={{justifyContent:"center",
                cursor:"pointer",
                textDecoration:"none",
                color:theme.palette.text.secondary
            }}>
                <Typography variant="h6">Tutorials</Typography>
                <Divider orientation="vertical" flexItem />
                <Typography variant="h6">Docs</Typography>
                <Divider orientation="vertical" flexItem />
                <a href={cityscopeJSUrl} style={{
                    color:theme.palette.text.secondary,
                    textDecoration:"none"}}>
                    <Typography variant="h6">CityScopeJS</Typography>
                </a>
                <Divider orientation="vertical" flexItem />
                <a href="https://github.com/CityScope/CS_cityflow" style={{
                    color:theme.palette.text.secondary,
                    textDecoration:"none"}}>
                    <Typography variant="h6">Github</Typography>
                </a>
            </Stack>
        </Divider>
    )
}