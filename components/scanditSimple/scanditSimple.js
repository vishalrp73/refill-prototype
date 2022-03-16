import React, { useState, useRef, useEffect } from 'react';
import { requestCameraPermissionsIfNeeded } from '../../handlers/camera-permission-handler';
import { Alert, AppState, BackHandler, Pressable, Text } from 'react-native';
import { secrets } from '../../secrets';
import { styles } from './scanditSimpleStyles';

import { useGlobalContext } from '../../store/context';

import {
    BarcodeCapture,
    BarcodeCaptureOverlay,
    BarcodeCaptureOverlayStyle,
    BarcodeCaptureSettings,
    Symbology,
    SymbologyDescription
} from 'scandit-react-native-datacapture-barcode';

import {
    Camera,
    CameraSettings,
    DataCaptureContext,
    DataCaptureView,
    FrameSourceState,
    RectangularViewfinder,
    RectangularViewfinderStyle,
    RectangularViewfinderLineStyle,
    VideoResolution
} from 'scandit-react-native-datacapture-core';

import SwipePanel from '../swipePanel/swipePanel';

const ScanditSimple = (props) => {

    const [details, setDetails] = useState(props.details);
    const { scanCount, setScanCount } = useGlobalContext();

    const iterateScan = (barcode) => {

        if ( parseInt(barcode._data) === parseInt(details.GTIN) ) {
            setScanCount(prevCount => prevCount + 1);
            console.log(setScanCount);
        } else {
            console.log('product scanned does not match GTIN')
            Alert.alert(
                null,
                `Error: ${barcode._data} does not match this product`,
                [
                    {
                        text: 'OK',
                        onPress: () => barcodeCaptureMode.isEnabled = true
                    }
                ]
            )
        };

        updateProduct();
    }

    const updateProduct = () => {
        const update = {
            GTIN: props.details.GTIN,
            productName: props.details.productName,
            productImage: props.details.productImage,
            warehouseStock: props.details.warehouseStock,
            minShelf: props.details.minShelf,
            employeeId: props.details.employeeId,
            amountScanned: scanCount
        }
        console.log(update)

        // post to db to save individual item details
        /* fetch('/updateItem/$productId', update)
            .then (response => console.log(response))
            .catch (err => console.log(err)); */
    }


    const licenseKey = secrets.licenseKey;
    const viewRef = useRef(null);
    const context = DataCaptureContext.forLicenseKey(licenseKey)
    const camera = Camera.default;
    const settings = new BarcodeCaptureSettings();
    settings.enableSymbologies([
        Symbology.EAN13UPCA,
        Symbology.EAN8,
        Symbology.UPCE,
        Symbology.QR,
        Symbology.DataMatrix,
        Symbology.Code39,
        Symbology.Code128,
        Symbology.InterleavedTwoOfFive,
    ]);

    const symbologySettings = settings.settingsForSymbology(Symbology.Code39);
    symbologySettings.activeSymbolCounts = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
    const barcodeCaptureMode = BarcodeCapture.forContext(context, settings);


    const setupScan = () => {

        const listener = {
            didScan: (_, session) => {
                const barcode = session.newlyRecognizedBarcodes[0];
                const symbology = new SymbologyDescription(barcode.symbology);
                barcodeCaptureMode.isEnabled = false;
                setTimeout(() => {
                    console.log('re-rendering viewfinder')
                    barcodeCaptureMode.isEnabled = true;
                }, 1000)
                /* Alert.alert(
                    null,
                    `Scanned: ${barcode.data} (${symbology.readableName})`,
                    [
                        { text: 'OK', onPress: () => barcodeCaptureMode.isEnabled = true }
                    ],
                    { cancelable: true }
                ); */
                iterateScan(barcode)
            }
        }

        barcodeCaptureMode.addListener(listener);
        const overlay = BarcodeCaptureOverlay.withBarcodeCaptureForViewWithStyle(
            barcodeCaptureMode,
            viewRef.current,
            BarcodeCaptureOverlayStyle.Legacy
        );
        overlay.viewfinder = new RectangularViewfinder(
            RectangularViewfinderStyle.Rounded,
            RectangularViewfinderLineStyle.Bold
        );
    }


    const startCamera = () => {
        context.setFrameSource(camera);
        const cameraSettings = new CameraSettings();
        cameraSettings.preferredResolution = VideoResolution.UHD4K;
        camera.applySettings(cameraSettings);
        requestCameraPermissionsIfNeeded()
            .then (() => camera.switchToDesiredState(FrameSourceState.On))
            .catch (() => BackHandler.exitApp());
    }

    const stopCamera = () => {
        if (camera) {
            camera.switchToDesiredState(FrameSourceState.Off);
        }
        console.log('stop camera function hit')
    }

    const startCapture = () => {
        startCamera();
        barcodeCaptureMode.isEnabled = true;
    }

    const stopCapture = () => {
        barcodeCaptureMode.isEnabled = false;
        stopCamera();
    }

    const handleAppStateChange = async (nextAppState) => {
        if (nextAppState.match(/inactive|background/)) {
            stopCapture();
            console.log('app in background')
        } else {
            startCapture();
        }
    }

    useEffect(() => {
        AppState.addEventListener('change', handleAppStateChange);
        setupScan();
        startCamera();

        return function cleanup () {
            AppState.removeEventListener('change', handleAppStateChange);
            context.dispose();
        }
    }, [])


    return (
        <>
            <SwipePanel details = {details} count = { scanCount } />
            < DataCaptureView style = {{flex: 1}}
                context = {context} ref = {viewRef} />
        </>
    )
}

export default ScanditSimple;