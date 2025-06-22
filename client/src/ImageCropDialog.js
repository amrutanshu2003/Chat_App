import React, { useState, useRef } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Box, Slider, Typography } from '@mui/material';

function getCroppedImg(image, crop, fileName, scale = 1) {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    canvas.width = crop.width;
    canvas.height = crop.height;
    
    const ctx = canvas.getContext('2d');

    const pixelRatio = window.devicePixelRatio;
    canvas.width = crop.width * pixelRatio;
    canvas.height = crop.height * pixelRatio;
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width,
        crop.height
    );

    return new Promise((resolve) => {
        canvas.toBlob(blob => {
            if (!blob) {
                console.error('Canvas is empty');
                return;
            }
            blob.name = fileName;
            resolve(blob);
        }, 'image/jpeg');
    });
}


const ImageCropDialog = ({ open, onClose, imageSrc, onCropComplete }) => {
    const [crop, setCrop] = useState();
    const [completedCrop, setCompletedCrop] = useState(null);
    const [scale, setScale] = useState(1);
    const imgRef = useRef(null);

    function onImageLoad(e) {
        const { width, height } = e.currentTarget;
        const newCrop = centerCrop(
            makeAspectCrop(
                {
                    unit: '%',
                    width: 90,
                },
                1, // aspect ratio 1:1
                width,
                height
            ),
            width,
            height
        );
        setCrop(newCrop);
        return false;
    }

    const handleCrop = async () => {
        if (completedCrop?.width && completedCrop?.height && imgRef.current) {
            try {
                const croppedImageBlob = await getCroppedImg(
                    imgRef.current,
                    completedCrop,
                    'avatar.jpeg',
                    scale
                );
                onCropComplete(croppedImageBlob);
            } catch (e) {
                alert('Failed to crop image. Please try again.');
                onCropComplete(null);
            }
        } else {
            alert('Please select a crop area.');
            onCropComplete(null);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm">
            <DialogTitle>Crop Image</DialogTitle>
            <DialogContent sx={{ 
                overflow: 'hidden',
                '&::-webkit-scrollbar': {
                    display: 'none'
                },
                msOverflowStyle: 'none',  /* IE and Edge */
                scrollbarWidth: 'none'  /* Firefox */
            }}>
                {imageSrc && (
                    <ReactCrop
                        crop={crop}
                        onChange={c => setCrop(c)}
                        onComplete={(c) => setCompletedCrop(c)}
                        aspect={1}
                        circularCrop
                    >
                        <img
                            ref={imgRef}
                            alt="Crop me"
                            src={imageSrc}
                            style={{ transform: `scale(${scale})`, maxHeight: '70vh', display: 'block' }}
                            onLoad={onImageLoad}
                        />
                    </ReactCrop>
                )}
            </DialogContent>
            <DialogActions>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '50%', mr: 2 }}>
                    <Typography gutterBottom sx={{ mr: 2, mb: 0 }}>Zoom</Typography>
                    <Slider
                        value={scale}
                        min={1}
                        max={3}
                        step={0.1}
                        aria-labelledby="Zoom"
                        onChange={(e, newValue) => setScale(newValue)}
                    />
                </Box>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleCrop} variant="contained">Crop</Button>
            </DialogActions>
        </Dialog>
    );
};

export default ImageCropDialog; 