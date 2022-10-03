import { useState, useEffect, useRef } from "react";
import { useWallet } from "./contexts/accounts";

import Sidebar from "./pages/sidebar";
import { Outlet, useLocation, useNavigate } from "react-router-dom";


import { styled, } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { utils } from 'near-api-js';
import { checkWallet, createNotify, truncate } from './utils/service';

import logo from './assets/logo.svg';

const drawerWidth = 240;

const openedMixin = (theme) => ({
    width: drawerWidth,
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
});

const closedMixin = (theme) => ({
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: `calc(${theme.spacing(7)} + 1px)`,
    [theme.breakpoints.up('sm')]: {
        width: `calc(${theme.spacing(8)} + 1px)`,
    },
});

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
}));

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme, open }) => ({
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        ...(open && {
            ...openedMixin(theme),
            '& .MuiDrawer-paper': openedMixin(theme),
        }),
        ...(!open && {
            ...closedMixin(theme),
            '& .MuiDrawer-paper': closedMixin(theme),
        }),
    }),
);


export default function MainLayout() {
    const location = useLocation();
    const wallet = useWallet();
    const [open, setOpen] = useState(window.innerWidth > 425);
    const disData = JSON.parse(localStorage.getItem("discordUser"))
    const isInitialRender = useRef(true)
    const navigate = useNavigate();

    const [account, setAccount] = useState({
        connected: false,
        walletAddress: "",
        balance: 0,
    });

    const handleDrawerOpen = () => {
        setOpen(true);
    };

    const handleDrawerClose = () => {
        setOpen(false);
    };


    const connectNearWallet = async () => {
        wallet.requestSignIn();
    };

    const disconnectNearWallet = async () => {
        wallet.signOut();
        navigate('/raffles');
        window.location.reload();
    };

    const getAccountDetail = async () => {
        const connected = wallet.isSignedIn();
        if (!connected) return;
        const walletAddress = wallet.getAccountId();
        let balance = await wallet.account().getAccountBalance();
        const amountInNEAR = utils.format
            .formatNearAmount(balance.available)
            .replace(",", "");
        setAccount({
            connected,
            walletAddress,
            balance: Number(amountInNEAR),
        });
    };
    useEffect(() => {
        if (isInitialRender.current) {
            getAccountDetail();
            (async () => {
                const params = new URLSearchParams(location.search);
                const account_id = params.get("account_id");
                const all_keys = params.get("all_keys");
                if (account_id && all_keys) {
                    const result = await checkWallet({ walletAddress: account_id, userid: disData.id });
                    const { status, isRight, data } = result.data;
                    if (status === false) {
                        createNotify('error', 'Unable to connect to server.');
                    } else if (status === true && !isRight) {
                        createNotify('error', `You can't use multiple wallet. Please try again with ${data.walletAddress}`)
                        setTimeout(() => {
                            disconnectNearWallet();
                        }, 2000);
                    }
                }
            })()
        }
        return () => isInitialRender.current = false
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar position="fixed" open={open}>
                <Toolbar sx={{ background: '#161616' }}>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        onClick={handleDrawerOpen}
                        edge="start"
                        sx={{
                            marginRight: 3,
                            ...(open && { display: 'none' }),
                        }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h4"
                        sx={{
                            background: 'linear-gradient(96.35deg, #F7BC14 0%, #E95E57 81.64%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            textAlign: 'center',
                        }}
                        component="div"
                        className="rdc-text-m"
                    >
                        Vulcan+
                    </Typography>
                    <Box sx={{
                        flexGrow: '1',
                        display: 'flex',
                        justifyContent: 'flex-end',
                        py: 1
                    }}>
                        {account && account.connected ?
                            <Button variant="contained" style={{ display: 'flex', textTransform: 'unset' }} >
                                <Typography>
                                    {`${truncate(account.walletAddress, [5, 5])}`}
                                </Typography>
                                <Typography className="hide-text-m">
                                    &nbsp;| &nbsp;
                                </Typography>
                                <Typography className="hide-text-m">
                                    {`${account.balance.toFixed(3)} NEAR`}
                                </Typography>
                            </Button> :
                            <Button sx={{ textTransform: 'unset' }} variant="contained" onClick={connectNearWallet}>Wallet Connect</Button>
                        }
                    </Box>
                </Toolbar>
            </AppBar>
            <Drawer variant="permanent" open={open}>
                <DrawerHeader sx={{ justifyContent: 'flex-end' }}>
                    {open && <Stack spacing={2} sx={{ display: 'flex', mt: 3 }}>
                        <img src={logo} alt="" style={{ width: '70px', margin: 'auto' }} />
                        <Typography sx={{ fontSize: '12px', textAlign: 'center', color: '#9CA3AF' }}>
                            Powered by NEARverse Labs
                        </Typography>
                    </Stack>
                    }
                    <IconButton sx={{ mt: '20px' }} onClick={handleDrawerClose}>
                        <ChevronLeftIcon />
                    </IconButton>
                </DrawerHeader>
                {!open &&
                    <Box sx={{ width: '100%', textAlign: 'center', mt: 1 }}>
                        <img src={logo} alt="" style={{ width: '50px', margin: 'auto' }} />
                    </Box>
                }
                <Sidebar open={open} />
            </Drawer>
            <Box component="main" className="rdc-pd-m" sx={{ flexGrow: 1, p: 3, pt: 6 }}>
                <Outlet />
            </Box>
        </Box>
    );
}
