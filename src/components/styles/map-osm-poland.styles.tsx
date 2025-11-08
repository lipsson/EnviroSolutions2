import {Box} from '@mui/material';
import {styled} from '@mui/material/styles';
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import Style from "ol/style/Style";

// Podstawowy styl dla obiektów GeoJSON
export const defaultStyle = new Style({
    stroke: new Stroke({
        color: 'rgba(255, 0, 0, 0.8)', // Czerwona linia
        width: 2,
    }),
    fill: new Fill({
        color: 'rgba(255, 0, 0, 0.2)', // Lekko przeźroczysty czerwony wypełnienie
    }),
});

export const MapStyles = styled(Box)(({theme}) => ({

    '& .ol-viewport': {
        borderRadius: theme.shape.borderRadius,
        boxShadow: theme.shadows[8],
        transition: 'all 0.5s ease',
    },
    '& .map': {
        width: '100%',
        height: '80vh',
        minHeight: 400,/* opcjonalnie */
    }
}));
export const BoxStyles = styled(Box)(({ theme }) => ({
    alignItems: 'center',
    backgroundColor: theme.palette.secondary.main,
    borderRadius: 4,
    border: '1px solid',
    borderColor: theme.palette.primary.main,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    left: '50%',
    margin: '25px 0',
    padding: '5px 10px',
    position: 'absolute',
    transform: 'translateX(-50%)',
    zIndex: 1201,
    gap: '8px',
}));


// styled for attribution
export const ControlsAttribution = styled('div')(() => ({
    bottom: 5,
    fontSize: 10,
    position: 'absolute',
    right: 5,
    zIndex: 1,
    '& .ol-attribution': {
        display: 'flex',
        '& button': {
            display: 'none',
        },
        '& ul': {
            listStyleType: 'none',
        },
    },
}));

// styled for scale
export const ControlsScale = styled('div')(({ theme }) => ({
    border: '1px solid',
    borderColor: theme.palette.primary.main ,
    backgroundColor: theme.palette.common.white,
    borderRadius: theme.shape.borderRadius,
    bottom: 5,
    color: theme.palette.common.black,
    left: 5,
    opacity: 0.7,
    padding: '2px',
    position: 'absolute',
    zIndex: 600,
}));

export const ControlsScaleInner = styled('div')(({ theme }) => ({
    border: '1px solid',
    borderColor: theme.palette.primary.main,
    borderTop: 'none',
    color: theme.palette.primary.main,
    fontSize: 10,
    fontWeight: 700,
    margin: 1,
    textAlign: 'center',
    willChange: 'contents, width',
    transition: 'width 0.25s ease, background-color 0.25s ease, color 0.25s ease',
    '&:hover': {
        color: theme.palette.common.white,
        backgroundColor: theme.palette.primary.main,
    },
}));

// styled for zoom
export const ControlsZoom = styled('div')(({ theme }) => ({
    position: 'absolute',
    zIndex: 1,
    '& .ol-zoom': {
        display: 'flex',
        flexDirection: 'column',
        marginLeft: 5,
        marginTop: 5,
        '&-in': {
            marginBottom: 2,
        },
        '&-in, &-out': {
            border: '1px solid',
            borderColor: theme.palette.primary.main,
            backgroundColor:theme.palette.action.selected,
            borderRadius: theme.shape.borderRadius,
            color: theme.palette.primary.main,
            fontFamily: '"RedHatText", sans-serif',
            height: 21,
            opacity:  1 ,
            padding: 0,
            width: 21,
            transition: 'background-color 0.25s ease, color 0.25s ease, opacity 0.25s ease, border-color 0.25s ease',
            '&:hover': {
                backgroundColor: theme.palette.primary.main ,
                borderColor: theme.palette.common.white,
                color: theme.palette.common.white,
                cursor: 'pointer',
                opacity:  0.7 ,
            },
        },
    },
}));

export const ControlCenterMap = styled('div')(({ theme }) => ({
    backgroundColor: theme.palette.action.selected ,
    border: '1px solid',
    borderColor: theme.palette.primary.main ,
    borderRadius: theme.shape.borderRadius,
    heigth: 30,
    width: 25,
    position: 'absolute',
    zIndex: 1,
    top: 5,
    color: theme.palette.primary.main,
    right: 5,
    opacity:  1 ,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.25s ease, color 0.25s ease, opacity 0.25s ease, border-color 0.25s ease',
    '&:hover': {
        cursor: 'pointer',
        backgroundColor:theme.palette.primary.main ,
        borderColor: theme.palette.common.white,
        color: theme.palette.common.white,
        opacity:  0.7 ,
    },
}));

export const Popup = styled('div')(({ theme }) => ({
    position: 'absolute',
    backgroundColor: theme.palette.common.white,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    filter: 'drop-shadow(0 1px 4px rgba(0,0,0,0.2))',
    borderRadius: theme.shape.borderRadius,
    padding: 15,
    left: 12,
    width: 350,
    minHeight: 150,
    zIndex: 2000,
    top: '50%',
    transform: 'translateY(-50%)',
    '&:after, &:before': {
        top: '100%',
        border: 'solid transparent',
        content: '" "',
        height: 0,
        width: 0,
        position: 'absolute',
        pointerEvents: 'none',
    },
    '&:after': {
        bordeTopColor: theme.palette.common.white,
        borderWidth: 10,
    },
    '&:before': {
        bordeTopColor: theme.palette.primary.main,
        borderWidth: 11,
    },
}));
