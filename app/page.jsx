
'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';

export default function Home() {
  const [image, setImage] = useState(null);
  const [previews, setPreviews] = useState([]);

  const formats = [
    { name: '1:1', width: 1080, height: 1080 },
    { name: '3:4', width: 1080, height: 1440 },
    { name: '4:5', width: 1080, height: 1350 },
    { name: '9:16', width: 1080, height: 1920 },
  ];

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const processImages = () => {
    if (!image) return;

    const newPreviews = formats.map((format) => {
      const canvas = document.createElement('canvas');
      canvas.width = format.width;
      canvas.height = format.height;
      const ctx = canvas.getContext('2d');
      const img = new Image();

      return new Promise((resolve) => {
        img.onload = () => {
          const ratio = Math.min(
            img.width / format.width,
            img.height / format.height
          );
          const scaledWidth = format.width * ratio;
          const scaledHeight = format.height * ratio;
          const offsetX = (img.width - scaledWidth) / 2;
          const offsetY = (img.height - scaledHeight) / 2;

          ctx.drawImage(
            img,
            offsetX,
            offsetY,
            scaledWidth,
            scaledHeight,
            0,
            0,
            format.width,
            format.height
          );

          resolve({ name: format.name, url: canvas.toDataURL('image/jpeg') });
        };
        img.src = image;
      });
    });

    Promise.all(newPreviews).then((results) => setPreviews(results));
  };

  const downloadImage = (url, name) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `${name}.jpg`;
    link.click();
  };

  return (
    <div className='p-6 grid gap-6'>
      <Card className='p-4'>
        <CardContent className='flex flex-col gap-4 items-center'>
          <h1 className='text-2xl font-bold'>E-Commerce Image Resizer</h1>
          <Input type='file' accept='image/*' onChange={handleImageUpload} />
          <Button onClick={processImages} disabled={!image}>
            Generate Formats
          </Button>
        </CardContent>
      </Card>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {previews.map((preview) => (
          <motion.div
            key={preview.name}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className='border rounded-2xl p-4 shadow-lg bg-white'
          >
            <h2 className='text-xl mb-2 font-semibold'>{preview.name}</h2>
            <img src={preview.url} alt={preview.name} className='w-full rounded-lg' />
            <Button
              className='mt-4 w-full'
              onClick={() => downloadImage(preview.url, preview.name)}
            >
              Download {preview.name}
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
